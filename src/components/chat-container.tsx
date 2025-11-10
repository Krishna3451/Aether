"use client";

import { Message } from "@/actions";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { toast } from "sonner";
import ChatWrapper from "./chat-wrapper";

interface Props {
    user: User;
    chatId?: string;
    messages: Message[] | [];
}

const ChatContainer = ({ user, chatId, messages }: Props) => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
    const [oMessages, setOMessages] = useState<Message[]>([]);

    const handleSendMessage = async ({ message, files }: { message: string; files: File[] }) => {
        setIsLoading(true);

        if (!message.trim() && files.length === 0) {
            toast.error("Type a message or attach a file");
            setIsLoading(false);
            return;
        }

        const tempMessageId = `temp-${Date.now()}`;
        const userMessage: Message = {
            id: tempMessageId,
            chat_id: chatId || "",
            content: String(message),
            role: "user",
            created_at: new Date().toISOString(),
            attachments: files.map(file => ({
                id: `temp-${Math.random().toString(36).slice(2)}`,
                name: file.name,
                mimeType: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
                storagePath: "",
            })),
        };

        const revokeTempAttachmentUrls = () => {
            userMessage.attachments?.forEach(att => {
                if (att.url.startsWith("blob:")) {
                    URL.revokeObjectURL(att.url);
                }
            });
        };

        setOMessages((prev) => [...prev, userMessage]);

        try {
            setIsAiLoading(true);

            const payload = new FormData();
            payload.append("message", message);
            if (chatId) {
                payload.append("chatId", chatId);
            }
            files.forEach(file => payload.append("files", file));

            const response = await fetch("/api/messages/send", {
                method: "POST",
                body: payload,
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: "Failed to send message" }));
                throw new Error(error.error ?? "Failed to send message");
            }

            const { chatId: returnedChatId, userMessage: savedUserMessage, aiMessage } = await response.json();

            setOMessages(prev => prev.filter(msg => msg.id !== tempMessageId));

            setOMessages(prev => [...prev, savedUserMessage, aiMessage]);

            if (!chatId) {
                router.push(`/c/${returnedChatId}`);
            } else {
                router.refresh();
            }
        } catch (error) {
            console.log("Error creating chat", error);
            toast.error(error instanceof Error ? error.message : "Error sending message. Please try again");
            setOMessages(prev =>
                prev.filter(msg => msg.id !== tempMessageId)
            );
        } finally {
            setIsLoading(false);
            setIsAiLoading(false);
            revokeTempAttachmentUrls();
            setTimeout(() => {
                setOMessages([]);
            }, 1000);
        }
    };

    return (
        <ChatWrapper
            user={user}
            messages={messages}
            isLoading={isLoading}
            oMessages={oMessages}
            isAiLoading={isAiLoading}
            onSubmit={handleSendMessage}
        />
    )
};

export default ChatContainer
