"use client";

import { Message } from "@/actions/chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { useVoices } from '@/hooks';
import { cn } from '@/utils';
import { CheckIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { useState } from 'react';
import { toast } from "sonner";
import Icons from './global/icons';
import ShareMessageModal from './share-message-modal';
import { Button } from "./ui/button";

interface Props {
    message: Message;
    role: "user" | "assistant";
}

const MessageOptions = ({ message, role }: Props) => {

    const { voices, selectedVoice } = useVoices();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);
    const [liked, setLiked] = useState<boolean>(false);
    const [disLiked, setDisLiked] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content).then(() => {
            setCopied(true);
            toast.success("Copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleLike = () => {
        // also handle disLiked state if disLiked already then disable
        if (disLiked) {
            setDisLiked(false);
        }
        if (liked) {
            setLiked(false);
            toast.success("Got it, thanks for letting us know");
        } else {
            setLiked(true);
            toast.success("Thank you for your feedback");
        }
    };

    const handleDisLike = () => {
        // also handle liked state if liked already then disable
        if (liked) {
            setLiked(false);
        }
        if (disLiked) {
            setDisLiked(false);
            toast.success("Got it, thanks for letting us know");
        } else {
            setDisLiked(true);
            toast.success("Thank you for your feedback");
        }
    };

    const handleSpeak = () => {
        if (isSpeaking) {
            speechSynthesis?.cancel();
            setIsSpeaking(false);
        } else {
            const utter = new SpeechSynthesisUtterance(message.content);
            if (selectedVoice) {
                utter.voice = voices[0];
            }
            utter.onend = () => setIsSpeaking(false);
            speechSynthesis?.speak(utter);
            setIsSpeaking(true);
        }
    };

    return (
        <div className={cn(
            "flex items-center opacity-0 group-hover/message:opacity-100",
            isSpeaking && "opacity-100",
            role === "assistant" ? "justify-start" : "justify-end",
        )}>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCopy}
                            className="size-8 rounded-lg text-muted-foreground"
                        >
                            {copied ? <CheckIcon className="size-4" /> : <Icons.copy className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {copied ? "Copied!" : "Copy"}
                    </TooltipContent>
                </Tooltip>

                {role === "assistant" && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleSpeak}
                                    className="size-8 rounded-lg text-muted-foreground"
                                >
                                    {isSpeaking ? <Icons.stop className="size-4" /> : <Icons.volume className="size-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isSpeaking ? "Stop speaking" : "Read aloud"}
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setIsOpen(true)}
                                    className="size-8 rounded-lg text-muted-foreground"
                                >
                                    <Icons.share className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Share
                            </TooltipContent>
                        </Tooltip>
                        {(disLiked === false) && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={liked}
                                        onClick={handleLike}
                                        className="size-8 rounded-lg"
                                    >
                                        <ThumbsUpIcon className={cn(
                                            "size-4 transition-colors duration-300",
                                            liked ? "fill-foreground" : "text-muted-foreground"
                                        )} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Good response
                                </TooltipContent>
                            </Tooltip>
                        )}
                        {(liked === false) && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        disabled={disLiked}
                                        onClick={handleDisLike}
                                        className="size-8 rounded-lg"
                                    >
                                        <ThumbsDownIcon className={cn(
                                            "size-4 transition-colors duration-300",
                                            disLiked ? "fill-foreground" : "text-muted-foreground"
                                        )} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Bad response
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </>
                )}
            </TooltipProvider>

            <ShareMessageModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                message={message}
            />
        </div>
    )
}

export default MessageOptions
