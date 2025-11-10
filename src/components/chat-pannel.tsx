"use client";

import { Message as MessageProps } from "@/actions/chat";
import { useInput } from "@/hooks/use-input";
import { User } from "@supabase/supabase-js";
import { TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from 'react';
import ChatMessage from "./chat-message";
import EmptyState from "./empty-state";

interface Props {
    user: User | null;
    error: string | null;
    isLoading: boolean;
    isAiLoading?: boolean;
    messages: MessageProps[];
}

const ChatPannel = ({ user, error, messages, isLoading, isAiLoading }: Props) => {

    const router = useRouter();

    const messagesRef = useRef<HTMLDivElement>(null);

    const { setInput } = useInput();

    const [oMessages, setOMessages] = useState<MessageProps[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleSelectPrompt = (prompt: string) => {
        setInput(prompt);
    };

    const scrollToBottom = () => {
        messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);

    useEffect(() => {
        if (messages.length > 0) {
            setOMessages([]);
        }
    }, [messages]);

    const messagesWithLoading = isAiLoading
        ? [
            ...messages,
            {
                id: 'loading-ai',
                chat_id: messages[messages.length - 1]?.chat_id || '',
                content: '',
                role: 'assistant',
                created_at: new Date().toISOString(),
                is_loading: true
            } as MessageProps
        ]
        : messages;

    return (
        <div className="relative flex flex-col w-full max-w-3xl pt-16 pb-24 mx-auto h-full">
            {messages.length === 0 && (
                <EmptyState user={user} handleSelectPrompt={handleSelectPrompt} />
            )}

            {messagesWithLoading.map((msg, index) => (
                <ChatMessage
                    key={`${msg.id}-${index}`}
                    message={msg}
                    index={index}
                    messages={messagesWithLoading}
                    isLoading={isLoading && index === messagesWithLoading.length - 1}
                />
            ))}

            {error?.length && (
                <div className="py-4 flex items-center justify-center w-full">
                    <div className="flex items-center bg-destructive/10 text-destructive px-4 py-1.5 rounded-lg text-sm">
                        <TriangleAlertIcon className="w-5 h-5 text-destructive" />
                        <p className="ml-2 font-medium">{error}</p>
                    </div>
                </div>
            )}

            <div ref={messagesRef} className="w-full h-px" />
        </div>
    )
};

export default ChatPannel
