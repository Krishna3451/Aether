"use client";

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { FacebookIcon, InstagramIcon, MessageSquareTextIcon, TwitterIcon } from "lucide-react";
import { toast } from "sonner";
import { Message } from "@/actions/chat";

interface Props {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    message: Message;
}

const ShareMessageModal = ({ isOpen, setIsOpen, message }: Props) => {

    const handleShare = (platform: string) => {
        let url = "";
        const text = message.content;
        const encodedMessage = encodeURIComponent(text);

        switch (platform) {
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${encodedMessage}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/dialog/send&u=${encodedMessage}&quote=${encodedMessage}`;
                // url = `https://www.facebook.com/sharer/sharer.php?u=${encodedMessage}&quote=${encodedMessage}`;
                break;
            case 'twitter':
                url = `https://x.com/intent/tweet?text=${encodedMessage}`;
                break;
            case 'instagram':
                const link = "https://www.instapaper.com/" + encodedMessage;
                url = `https://www.instapaper.com/share?url=${encodedMessage}`;
                break;
            default:
                toast.error("Invalid platform");
        };

        window.open(url, "_blank");
    };


    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
            <DialogContent className="max-w-md sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        Share Message
                    </DialogTitle>
                    <DialogDescription>
                        Share this message with your friends on your favorite social media platforms
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center w-full gap-2 pt-4 justify-evenly">
                    <Button
                        variant="ghost"
                        onClick={() => handleShare('whatsapp')}
                        className="flex-col gap-2 h-min group hover:bg-transparent text-foreground/70"
                    >
                        <MessageSquareTextIcon className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-xs mt-">WhatsApp</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleShare('facebook')}
                        className="flex-col gap-2 h-min group hover:bg-transparent text-foreground/70"
                    >
                        <FacebookIcon className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-xs mt-">Facebook</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleShare('twitter')}
                        className="flex-col gap-2 h-min group hover:bg-transparent text-foreground/70"
                    >
                        <TwitterIcon className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-xs mt-">Twitter</span>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => handleShare('instagram')}
                        className="flex-col gap-2 h-min group hover:bg-transparent text-foreground/70"
                    >
                        <InstagramIcon className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
                        <span className="text-xs mt-">Instagram</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default ShareMessageModal
