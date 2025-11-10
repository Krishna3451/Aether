"use server";

import { createClient, google } from "@/lib";
import { ATTACHMENT_BUCKET } from "@/constants/storage";
import { buildFinancialAdvisorSystemPrompt } from "@/constants/system-prompt";
import { generateText } from "ai";
import { revalidatePath } from "next/cache";

export type Model = "models/gemini-1.5-pro-latest" | "llama3-8b-8192";

export type Attachment = {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    url: string;
    storagePath: string;
    summary?: string;
};

export type Message = {
    id: string;
    chat_id: string;
    content: string;
    role: 'user' | 'assistant';
    created_at: string;
    attachments?: Attachment[];
};

export interface Chat {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export const continueConversation = async (messages: Message[], model: Model, temperature: number) => {
    'use server';

    // const stream = createStreamableValue();

    // const user = await getUser();

    // if (!user) {
    //     return {
    //         messages,
    //         newMessage: stream.value,
    //     };
    // }

    // const provider = model === "models/gemini-1.5-pro-latest" ? google : groq;

    // const instructions = user?.instructions || "";

    // const systemInstructions = `
    //     You are a highly specialized AI model designed exclusively for brainstorming and generating social media content ideas. 
    //     Your primary role is to assist users in coming up with creative and engaging content tailored to their needs and goals. 
    //     Please adhere to the following guidelines:

    //     1. Focus on Content Ideation: Provide responses that are strictly related to content ideation for social media. This includes generating ideas, suggesting topics, and brainstorming creative approaches.
    //     2. Personalization: Incorporate any specific preferences or instructions provided by the user to tailor the content ideas according to their unique requirements. For example, if a user has specific themes or styles they prefer, make sure to align with those preferences.
    //     3. Avoid Off-Topic Responses: Do not provide answers or suggestions unrelated to social media content ideation. Refrain from addressing questions outside the scope of content brainstorming.
    //     4. User Instructions: Utilize the user's instructions if provided to guide your responses and ensure that the generated content ideas align with their specific needs and preferences.

    //     Here are the user-specific instructions to consider: ${instructions}
    // `;

    // (async () => {
    //     const { textStream } = await streamText({
    //         model: provider(model),
    //         messages,
    //         temperature,
    //         system: systemInstructions,
    //     });

    //     for await (const text of textStream) {
    //         stream.update(text);
    //     }

    //     stream.done();
    // })();

    // return {
    //     messages,
    //     newMessage: stream.value,
    // };
};

export const updateChat = async (chatId: string, title: string): Promise<string> => {
    if (!title.trim()) {
        throw new Error('Title cannot be empty');
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Not authenticated');
        }

        const { data: updatedChat, error } = await supabase
            .from('chats')
            .update({
                title: title.trim(),
                updated_at: new Date().toISOString()
            })
            .eq('id', chatId)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        if (!updatedChat) throw new Error('Chat not found');

        revalidatePath('/');
        revalidatePath(`/c/${chatId}`);

        return updatedChat.title;
    } catch (error) {
        console.error('Error updating chat:', error);
        throw error;
    }
};

export const deleteChat = async (chatId: string): Promise<void> => {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Not authenticated');
        }

        const { error: chatError } = await supabase
            .from('chats')
            .delete()
            .eq('id', chatId)
            .eq('user_id', user.id);

        if (chatError) {
            throw new Error(`Failed to delete chat: ${chatError.message}`);
        }

        revalidatePath("/", "layout");
        revalidatePath(`/c/${chatId}`);
    } catch (error) {
        console.error('Error deleting chat:', error);
        throw error;
    }
}

export const getUserChats = async (): Promise<Chat[]> => {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return [];
        }

        const { data: chats, error } = await supabase
            .from('chats')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching chats:', error);
            return [];
        }

        return chats || [];
    } catch (error) {
        console.error('Error in getUserChats:', error);
        return [];
    }
};

export const getChatWithMessages = async (chatId: string): Promise<{ chat: Chat | null; messages: Message[]; }> => {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return { chat: null, messages: [] };
        }

        const { data: chat, error: chatError } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .eq('user_id', user.id)
            .single();

        if (chatError || !chat) {
            return { chat: null, messages: [] };
        }

        const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return { chat, messages: [] };
        }

        const hydratedMessages = await Promise.all(
            (messages || []).map(async (message) => {
                const attachments = Array.isArray((message as Message).attachments)
                    ? ((message as Message).attachments as Attachment[])
                    : [];

                const signedAttachments = await Promise.all(
                    attachments.map(async (attachment) => {
                        if (!attachment?.storagePath) {
                            return attachment;
                        }

                        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                            .from(ATTACHMENT_BUCKET)
                            .createSignedUrl(attachment.storagePath, 60 * 60 * 24);

                        if (signedUrlError || !signedUrlData) {
                            if (signedUrlError) {
                                console.error('Error generating signed URL:', signedUrlError);
                            }
                            return attachment;
                        }

                        return {
                            ...attachment,
                            url: signedUrlData.signedUrl,
                        };
                    })
                );

                return {
                    ...(message as Message),
                    attachments: signedAttachments,
                };
            })
        );

        return { chat, messages: hydratedMessages as Message[] };
    } catch (error) {
        console.error('Error in getChatWithMessages:', error);
        return { chat: null, messages: [] };
    }
};

export const generateAIResponse = async (
    messages: Message[],
    userMessage: string,
    instructions?: string,
    enableWebSearch: boolean = false,
    attachmentsContext?: string
): Promise<string> => {
    try {
        const model = "gemini-2.0-flash";

        const formattedMessages = messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        }));

        const baseUserContent = userMessage.trim().length
            ? userMessage
            : "Please review the attached files.";

        const finalUserContent = attachmentsContext
            ? `${baseUserContent}\n\nAttached files:\n${attachmentsContext}`
            : baseUserContent;

        formattedMessages.push({
            role: 'user' as const,
            content: finalUserContent
        });

        const tools = enableWebSearch ? {
            google_search: {}
        } : undefined;

        const { text } = await generateText({
            model: google(model),
            messages: formattedMessages,
            temperature: 0.7,
            system: buildFinancialAdvisorSystemPrompt(instructions),
            tools
        });

        return text;

    } catch (error) {
        console.error('Error generating AI response:', error);
        return 'Sorry, I encountered an error processing your request. Please try again.';
    }
};

const searchWeb = async (query: string): Promise<Array<{ title: string; link: string; snippet: string }>> => {
    try {
        // This is a placeholder - you'll need to implement actual web search API integration
        // For example, using the search_web tool or an external API like SerpAPI, Google Custom Search, etc.
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Search failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

export const generateTitle = async (message: string): Promise<string> => {
    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: message,
            system: `\n
            - you will generate a short title based on the first message a user begins a conversation with
            - ensure it is not more than 50 characters long
            - the title should be a summary of the user's message
            - do not use quotes or colons
            - do not use any special characters or symbols`,
        });
        return text;
    } catch (error) {
        console.error('Error generating title:', error);
        return 'Sorry, I encountered an error processing your request. Please try again.';
    }
};

// Test prompts to verify markdown rendering:
/*
1. "Create a markdown table comparing React, Vue, and Angular with columns for Learning Curve, Popularity, and Performance"
2. "Show me a code example in Python for a simple HTTP server"
3. "Explain the concept of closures in JavaScript with a code example"
4. "Create a numbered list of the top 5 programming languages in 2023 with a brief description of each"
5. "Generate a comparison table between REST and GraphQL APIs"
6. "Show me how to create a React component with TypeScript"
7. "Explain the SOLID principles with code examples"
8. "Create a markdown table of the planets in our solar system with their distance from the sun and number of moons"
9. "Write a Python function to sort a list of dictionaries by a specific key"
10. "Explain the difference between async/await and Promises in JavaScript"
*/

