"use client";

import { updateUser } from '@/actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger, } from "@/components/ui/hover-card";
import { useInstructions } from '@/hooks';
import { cn } from '@/utils';
import { User } from '@supabase/supabase-js';
import { InfoIcon, Loader2Icon, XIcon } from "lucide-react";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from "./ui/button";
import { Textarea } from './ui/textarea';

interface Props {
    user: User | null;
}

const InstructionsModal = ({ user }: Props) => {

    const maxChars = 1500;

    const { isOpen, setIsOpen } = useInstructions();

    const [error, setError] = useState<boolean>(false);
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [text, setText] = useState<string>(user?.user_metadata?.instructions || "");
    const [initialText, setInitialText] = useState<string>(user?.user_metadata?.instructions || "");

    const handleUpdateInstructions = async () => {
        setIsLoading(true);

        try {
            const newInstructions = await updateUser(text);
            setInitialText(newInstructions);
            setIsOpen(false);
            toast.success("Changes saved!");
        } catch (error) {
            console.error("Error updating instructions:", error);
            toast.error("Failed to update instructions. Please try again");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (text !== initialText) {
            setIsAlertOpen(true);
            return;
        } else {
            setText(initialText);
            setIsOpen(false);
        }
    };

    const handleDiscardChanges = () => {
        setText(initialText);
        setIsAlertOpen(false);
        setIsOpen(false);
    };

    useEffect(() => {
        if (text.length > maxChars) {
            setError(true);
        } else {
            setError(false);
        }
    }, [text]);

    if (!user) {
        return null;
    }

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        handleClose();
                    }
                }}
            >
                <DialogContent showCloseButton={false} className="flex flex-col w-full md:rounded-2xl min-h-80 sm:max-w-xl">
                    <DialogTitle className="text-lg font-semibold sr-only">
                        Customize
                    </DialogTitle>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={handleClose}
                        className="focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 absolute top-4 right-4"
                    >
                        <XIcon className="size-4" />
                    </Button>
                    <div className="flex flex-col items-start w-full">
                        <div className="flex items-center gap-x-1.5">
                            <span className="text-sm font-medium">
                                Custom Instructions
                            </span>
                            <HoverCard openDelay={0} closeDelay={2000}>
                                <HoverCardTrigger>
                                    <InfoIcon className="size-3.5 text-muted-foreground" />
                                </HoverCardTrigger>
                                <HoverCardContent side="top" className="px-4 py-3 border-border rounded-xl">
                                    <div className="flex flex-col items-start gap-2">
                                        <span className="text-sm font-medium">
                                            Make it more personalize
                                        </span>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            <li>What is your location or region?</li>
                                            <li>What is your profession or field of work?</li>
                                            <li>What are your hobbies or personal interests?</li>
                                            <li>What topics you want to create content about?</li>
                                            <li>What are some of your personal goals?</li>
                                        </ul>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                        <p className="mt-2 text-sm text-foreground/80">
                            How would you like Aether to respond and interact with you?
                        </p>
                        <Textarea
                            value={text}
                            maxLength={maxChars}
                            disabled={isLoading}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter your custom instructions here..."
                            className={cn(
                                "w-full h-40 mt-2 overflow-y-auto text-base rounded-lg resize-none border",
                                error ? "border-destructive focus-visible:border-destructive" : "border-border"
                            )}
                        />
                        <div
                            className={cn(
                                "flex items-center justify-end w-full mt-1",
                                error ? "text-destructive" : "text-foreground/80"
                            )}
                        >
                            <span className="text-xs">
                                {text.length}/{maxChars}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full gap-4 md:flex-row md:justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isLoading}
                            onClick={handleClose}
                            className="w-full md:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={text.trim() === "" || error || isLoading || text === initialText}
                            onClick={handleUpdateInstructions}
                            className="w-full md:w-16"
                        >
                            {isLoading ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            You have unsaved changes
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to close without saving your changes?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Back
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDiscardChanges}>
                            Exit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
};

export default InstructionsModal;
