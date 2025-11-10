import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib";
import { Attachment, generateAIResponse, generateTitle, Message } from "@/actions/chat";
import { ATTACHMENT_BUCKET } from "@/constants/storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";

export const runtime = "nodejs";

const MAX_ATTACHMENT_CONTEXT_CHARS = 4000;
const IMAGE_DESCRIPTION_MODEL_CANDIDATES = [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
];
const IMAGE_DESCRIPTION_PROMPT = [
    "You are assisting a financial advisor chatbot. Provide a concise yet informative summary of the attached image that could help with financial planning conversations.",
    "Mention any text that appears in the image and transcribe it accurately.",
    "Identify charts, tables, or numerical figures and describe their meaning if possible.",
    "Keep the response under 12 sentences and avoid speculation if information is unclear.",
].join(" ");

type PdfParseFn = (data: Buffer) => Promise<{ text?: string }>;
type PdfParseModule = PdfParseFn | { default: PdfParseFn };

const require = createRequire(import.meta.url);

let cachedPdfParse: PdfParseFn | null = null;
let cachedVisionClient: GoogleGenerativeAI | null = null;
const cachedImageModels = new Map<string, ReturnType<GoogleGenerativeAI["getGenerativeModel"]>>();
let loggedMissingVisionKey = false;

const parsePdf = async (buffer: Buffer) => {
    if (!cachedPdfParse) {
        // Import the actual parser implementation directly; the package entry file
        // attempts to read a fixture PDF when `module.parent` is undefined, which
        // happens inside the Next.js bundle.
        const mod = require("pdf-parse/lib/pdf-parse.js") as PdfParseModule;
        const fn = typeof mod === "function" ? mod : mod.default;
        if (!fn) {
            throw new Error("pdf-parse export not found");
        }
        cachedPdfParse = fn;
    }

    return cachedPdfParse!(buffer);
};

const describeImage = async (buffer: Buffer, mimeType: string): Promise<string | undefined> => {
    const apiKey = process.env.GOOGLE_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
        if (!loggedMissingVisionKey) {
            console.warn("Image description skipped: GOOGLE_API_KEY (or NEXT_PUBLIC_GOOGLE_API_KEY) is not configured.");
            loggedMissingVisionKey = true;
        }
        return undefined;
    }

    try {
        if (!cachedVisionClient) {
            cachedVisionClient = new GoogleGenerativeAI(apiKey);
        }

        const base64Data = buffer.toString("base64");
        let lastError: unknown;

        for (const modelName of IMAGE_DESCRIPTION_MODEL_CANDIDATES) {
            try {
                const model =
                    cachedImageModels.get(modelName) ??
                    cachedVisionClient.getGenerativeModel({ model: modelName });

                cachedImageModels.set(modelName, model);

                const response = await model.generateContent([
                    { inlineData: { data: base64Data, mimeType } },
                    { text: IMAGE_DESCRIPTION_PROMPT },
                ]);

                const text = response.response.text();

                if (!text?.trim()) {
                    return undefined;
                }

                return cleanAndTruncateText(text, MAX_ATTACHMENT_CONTEXT_CHARS);
            } catch (error) {
                const status = (error as { status?: number }).status;
                if (status === 404) {
                    cachedImageModels.delete(modelName);
                    lastError = error;
                    continue;
                }

                throw error;
            }
        }

        if (lastError) {
            console.warn(
                "Image description skipped: no supported Gemini multimodal models were available.",
                lastError,
            );
        }

        return undefined;
    } catch (error) {
        console.error("Failed to generate image description:", error);
        return undefined;
    }
};

type UploadedAttachment = {
    attachment: Attachment;
    extractedText?: string;
    fullExtractedText?: string;
};

const normalizeExtractedText = (text: string) =>
    text
        .replace(/\r/g, "")
        .replace(/\t/g, " ")
        .replace(/\u0000/g, "")
        .replace(/[ ]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

const cleanAndTruncateText = (text: string, maxChars: number) => {
    const cleaned = normalizeExtractedText(text);

    if (cleaned.length <= maxChars) {
        return cleaned;
    }

    return `${cleaned.slice(0, maxChars)}… [truncated]`;
};

const uploadAttachments = async (
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    chatId: string,
    files: File[]
): Promise<UploadedAttachment[]> => {
    if (!files.length) return [];

    const client = supabase;

    const uploads = await Promise.all(
        files.map(async (file) => {
            const normalizedName = file.name?.toLowerCase?.() ?? "";
            const extension = normalizedName.split(".").pop() ?? "bin";
            const objectPath = `${userId}/${chatId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
            const buffer = Buffer.from(await file.arrayBuffer());

            let extractedText: string | undefined;
            let fullExtractedText: string | undefined;
            let attachmentSummary: string | undefined;
            const isPdf =
                file.type === "application/pdf" ||
                extension === "pdf";
            const isImage =
                file.type?.startsWith("image/") ||
                ["png", "jpg", "jpeg", "gif", "bmp", "webp", "tiff", "svg"].includes(extension);

            if (isPdf) {
                try {
                    const result = await parsePdf(buffer);
                    if (result.text?.trim()) {
                        fullExtractedText = normalizeExtractedText(result.text);
                        extractedText = cleanAndTruncateText(result.text, MAX_ATTACHMENT_CONTEXT_CHARS);
                        attachmentSummary = extractedText;
                        console.log("PDF extracted text", {
                            fileName: file.name,
                            attachmentId: objectPath,
                            text: fullExtractedText,
                        });
                    }
                } catch (error) {
                    console.error(`Failed to parse PDF ${file.name}:`, error);
                }
            } else if (isImage) {
                attachmentSummary = await describeImage(buffer, file.type || `image/${extension}`);
                if (attachmentSummary) {
                    extractedText = attachmentSummary;
                    fullExtractedText = attachmentSummary;
                    console.log("Image description extracted", {
                        fileName: file.name,
                        attachmentId: objectPath,
                        text: fullExtractedText,
                    });
                }
            }

            const { error: uploadError } = await client.storage
                .from(ATTACHMENT_BUCKET)
                .upload(objectPath, buffer, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type || "application/octet-stream",
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: signedUrlData, error: signedUrlError } = await client.storage
                .from(ATTACHMENT_BUCKET)
                .createSignedUrl(objectPath, 60 * 60 * 24);

            let url: string;
            if (signedUrlError || !signedUrlData) {
                if (signedUrlError) {
                    console.error(`Failed to generate signed URL for ${objectPath}:`, signedUrlError);
                }
                const { data: publicUrlData } = client.storage.from(ATTACHMENT_BUCKET).getPublicUrl(objectPath);
                url = publicUrlData.publicUrl;
            } else {
                url = signedUrlData.signedUrl;
            }

            return {
                attachment: {
                    id: randomUUID(),
                    name: file.name,
                    mimeType: file.type,
                    size: file.size,
                    storagePath: objectPath,
                    url,
                    summary: attachmentSummary,
                    extractedText,
                },
                extractedText,
                fullExtractedText,
            };
        })
    );

    return uploads;
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const message = String(formData.get("message") ?? "");
        const chatIdFromForm = formData.get("chatId");
        const files = formData.getAll("files") as File[];

        if (!message.trim() && files.length === 0) {
            return NextResponse.json({ error: "Message or attachment required" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        let chatId = typeof chatIdFromForm === "string" && chatIdFromForm.length ? chatIdFromForm : undefined;

        if (!chatId) {
            const title = message.trim()
                ? await generateTitle(message)
                : "New conversation";

            const { data: chat, error: chatError } = await supabase
                .from("chats")
                .insert({
                    user_id: user.id,
                    title: title || message.slice(0, 50) || "New conversation",
                })
                .select()
                .single();

            if (chatError || !chat) {
                return NextResponse.json({ error: chatError?.message ?? "Failed to create chat" }, { status: 500 });
            }

            chatId = chat.id;
        }

        const resolvedChatId = chatId as string;

        const uploadedAttachments = await uploadAttachments(supabase, user.id, resolvedChatId, files);
        const attachments = uploadedAttachments.map((item) => item.attachment);
        const attachmentsContext = uploadedAttachments
            .filter((item) => item.extractedText)
            .map((item) => `File: ${item.attachment.name}\n${item.extractedText}`)
            .join("\n\n");

        const { data: insertedMessage, error: messageError } = await supabase
            .from("messages")
            .insert({
                chat_id: resolvedChatId,
                content: message.trim().length ? message : "[Attachment]",
                role: "user",
                attachments,
            })
            .select()
            .single();

        if (messageError || !insertedMessage) {
            return NextResponse.json({ error: messageError?.message ?? "Failed to save message" }, { status: 500 });
        }

        const attachmentTextPayload = uploadedAttachments
            .filter((item) => item.fullExtractedText)
            .map((item) => ({
                attachment_id: item.attachment.id,
                chat_id: resolvedChatId,
                message_id: insertedMessage.id,
                user_id: user.id,
                storage_path: item.attachment.storagePath,
                extracted_text: item.fullExtractedText,
            }));

        if (attachmentTextPayload.length) {
            const { error: attachmentTextError } = await supabase
                .from("attachment_texts")
                .insert(attachmentTextPayload);

            if (attachmentTextError) {
                return NextResponse.json({ error: attachmentTextError.message ?? "Failed to save attachment text" }, { status: 500 });
            }
        }

        await supabase
            .from("chats")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", resolvedChatId);

        const { data: history, error: historyError } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", resolvedChatId)
            .order("created_at", { ascending: true });

        if (historyError) {
            return NextResponse.json({ error: historyError.message }, { status: 500 });
        }

        const aiText = await generateAIResponse(
            (history ?? []) as Message[],
            message,
            user.user_metadata?.instructions,
            false,
            attachmentsContext || undefined
        );

        const { data: aiMessage, error: aiError } = await supabase
            .from("messages")
            .insert({
                chat_id: resolvedChatId,
                content: aiText,
                role: "assistant",
                attachments: [],
            })
            .select()
            .single();

        if (aiError || !aiMessage) {
            return NextResponse.json({ error: aiError?.message ?? "Failed to save AI response" }, { status: 500 });
        }

        revalidatePath("/");
        revalidatePath(`/c/${resolvedChatId}`);

        return NextResponse.json({
            chatId: resolvedChatId,
            userMessage: insertedMessage,
            aiMessage,
        });
    } catch (error) {
        console.error("Error handling message send:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

