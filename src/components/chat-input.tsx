"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from "@/hooks";
import useEnterSubmit from "@/hooks/use-enter-submit";
import { useHeight } from "@/hooks/use-height";
import { useInput } from "@/hooks/use-input";
import { cn } from "@/utils";
import { formatFileSize, formatTime } from '@/utils/helpers';
import { ArrowUpIcon, CheckIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icons from './global/icons';
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface UploadedFile {
    id: string;
    file: File;
    preview?: string;
    size: string;
}

interface Props {
    isLoading: boolean;
    handleSendMessage: (payload: { message: string; files: File[] }) => Promise<void>;
}

const ChatInput2 = ({ isLoading, handleSendMessage }: Props) => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const { isOpen: isOpenSidebar } = useSidebar();

    const { formRef, onKeyDown } = useEnterSubmit();

    const { input, setInput } = useInput();

    const { setHeight } = useHeight();

    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const [micSupported, setMicSupported] = useState<boolean>(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

    useEffect(() => {
        setMicSupported(!!navigator.mediaDevices?.getUserMedia);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            setIsTranscribing(true);

            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                toast.error("Transcription failed");
                return;
            }

            const data = await response.json();
            const transcript = data.text.trim();

            if (transcript && !transcript.includes('[No speech detected]')) {
                setInput(transcript);
            } else {
                toast('No speech detected in recording');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            toast.error("Transcription failed");
        } finally {
            setIsTranscribing(false);
        }
    };

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                }
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            audioChunksRef.current = [];
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                console.log('Data available, size:', event.data.size);
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
            setRecordingTime(0);

            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('Could not access microphone. Please check permissions.');
        }
    }, []);

    const stopRecording = useCallback((abort: boolean = false) => {
        if (!mediaRecorderRef.current || !isRecording) {
            return;
        }

        const mediaRecorder = mediaRecorderRef.current;

        if (abort) {
            try {
                mediaRecorder.stop();
            } catch (e) {
                console.log('MediaRecorder already stopped');
            }

            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }

            audioChunksRef.current = [];
            mediaRecorderRef.current = null;
            setIsRecording(false);
            toast('Recording aborted');
            return;
        }

        mediaRecorder.onstop = async () => {
            console.log('MediaRecorder stopped, chunks:', audioChunksRef.current.length);

            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }

            if (audioChunksRef.current.length > 0) {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                console.log('Audio blob size:', audioBlob.size);

                if (audioBlob.size > 0) {
                    await transcribeAudio(audioBlob);
                } else {
                    toast('No audio data recorded');
                }
            } else {
                toast('No audio data to transcribe');
            }

            audioChunksRef.current = [];
            mediaRecorderRef.current = null;
        };

        setIsRecording(false);
        try {
            mediaRecorder.stop();
        } catch (e) {
            console.log('MediaRecorder already stopped');
            audioChunksRef.current = [];
            mediaRecorderRef.current = null;
        }
    }, [isRecording, transcribeAudio]);

    const abortRecording = useCallback(() => {
        stopRecording(true);
    }, [stopRecording]);

    const completeRecording = useCallback(() => {
        stopRecording(false);
    }, [stopRecording]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            completeRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, completeRecording]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files).map(file => {
            const id = Math.random().toString(36).substring(2, 9);
            return {
                id,
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                size: formatFileSize(file.size)
            };
        });

        setUploadedFiles(prev => [...prev, ...newFiles]);
        e.target.value = ''; // Reset input to allow selecting the same file again
    };

    const handleRemoveFile = (id: string) => {
        setUploadedFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            if (fileToRemove?.preview) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            return prev.filter(f => f.id !== id);
        });
    };

    useEffect(() => {
        return () => {
            uploadedFiles.forEach(file => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [uploadedFiles]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
            setHeight(textareaRef.current.scrollHeight);
        }
    }, [input]);

    return (
        <div
            className={cn(
                "fixed bottom-0 inset-x-0 mx-auto transition-all duration-300 bg-background z-50 peer-[[data-state=open]]:group-[]:lg:pl-64",
                isOpenSidebar ? "lg:pl-64" : "lg:pl-0"
            )}
        >
            <div className="px-3 text-base pb-4 md:px-5 lg:px-1 xl:px-5">
                <div className="flex flex-1 gap-4 mx-auto text-base md:gap-5 lg:gap-6 md:max-w-3xl">
                    <form
                        ref={formRef}
                        onSubmit={async (e) => {
                            e.preventDefault();

                            if (isLoading) return;

                            const message = input;
                            const trimmedMessage = message.trim();
                            const files = uploadedFiles.map(file => file.file);

                            if (!trimmedMessage && files.length === 0) {
                                toast.error('Type a message or attach a file');
                                return;
                            }

                            await handleSendMessage({
                                message,
                                files,
                            });

                            setUploadedFiles(prev => {
                                prev.forEach(item => {
                                    if (item.preview) {
                                        URL.revokeObjectURL(item.preview);
                                    }
                                });
                                return [];
                            });

                            setInput('');
                        }}
                        className="relative w-full"
                    >
                        <div
                            className={cn(
                                "relative w-full gap-x-1.5 rounded-xl p-1 transition-colors bg-background border border-border/60 overflow-y-auto flex flex-col z-0",
                            )}
                        >
                            {uploadedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2 max-h-24 overflow-y-hidden pt-1 pl-1">
                                    {uploadedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className={cn(
                                                "relative rounded-lg overflow-visible bg-muted/80 flex items-center",
                                                file.preview ? "size-14" : "w-56 h-14"
                                            )}
                                        >
                                            {file.preview ? (
                                                <div className="w-full h-full">
                                                    <img
                                                        src={file.preview}
                                                        alt={file.file.name}
                                                        className="w-full h-full object-cover rounded-lg border border-border"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="p-2 flex items-center gap-2">
                                                    <div className="flex items-center justify-center size-10 rounded-md bg-orange-500">
                                                        <Icons.file className="size-5 text-white" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium truncate max-w-full px-1">
                                                            {file.file.name.length > 16 ? file.file.name.slice(0, 16) + "..." : file.file.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {file.size}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(file.id)}
                                                className="absolute top-1 right-1 bg-black text-white rounded-full cursor-pointer size-4 flex items-center justify-center"
                                            >
                                                <XIcon className="size-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative flex flex-col justify-center flex-1 min-w-0">
                                <Textarea
                                    rows={1}
                                    tabIndex={0}
                                    value={input}
                                    autoFocus={true}
                                    ref={textareaRef}
                                    disabled={isLoading || isRecording || isTranscribing}
                                    onKeyDown={onKeyDown}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className={cn(
                                        "h-auto pl-4 overflow-y-auto bg-transparent border-0 resize-none text-left focus:outline-none min-h-20 max-h-52 w-full",
                                    )}
                                />
                            </div>

                            {/* attach */}
                            <div className="absolute left-2 bottom-2 z-20">
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                type="button"
                                                variant="ghost"
                                                disabled={isLoading}
                                                className="active:scale-90"
                                            >
                                                <label
                                                    htmlFor="file"
                                                    className="size-full flex items-center justify-center cursor-pointer"
                                                >
                                                    <input
                                                        type="file"
                                                        id="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept="image/*,.pdf,.doc,.txt"
                                                    />
                                                    <PlusIcon className="size-4" />
                                                </label>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={10}>
                                            Add files
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* send btn */}
                            <div className="absolute right-2 bottom-2 z-20">
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                type="submit"
                                                disabled={isLoading || (!input.trim() && uploadedFiles.length === 0)}
                                                className="active:scale-90"
                                            >
                                                {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : <ArrowUpIcon className="size-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" sideOffset={10}>
                                            Send message (Enter)
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* mic */}
                            {micSupported && (
                                <div
                                    className={cn(
                                        "absolute bottom-2 right-12 z-20 flex gap-x-2",
                                        textareaRef?.current && textareaRef?.current?.clientHeight > 48 ? "items-end" : "items-center",
                                    )}
                                >
                                    {(isRecording || isTranscribing) && (
                                        <div className="flex items-center gap-2 px-3 py-1 h-8 rounded-md text-xs relative font-medium transition-all bg-blue-500/10 text-blue-500">
                                            {isRecording ? (
                                                <>
                                                    <div className="relative flex items-center justify-center">
                                                        <div className="size-1.5 bg-blue-500/80 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                        <div className="size-2 bg-blue-500 rounded-full animate-ping" />
                                                    </div>
                                                    REC {formatTime(recordingTime)}
                                                </>
                                            ) : (
                                                <>
                                                    <Loader2Icon className="size-3 animate-spin" />
                                                    Transcribing...
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <TooltipProvider delayDuration={0}>
                                        {isRecording ? (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => stopRecording(true)}
                                                            disabled={isLoading || isTranscribing}
                                                            className="relative bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:!text-red-500"
                                                        >
                                                            <XIcon className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" sideOffset={10}>
                                                        Abort recording
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => stopRecording(false)}
                                                            disabled={isLoading || isTranscribing}
                                                            className="relative bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:!text-green-500"
                                                        >
                                                            <CheckIcon className="size-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" sideOffset={10}>
                                                        Complete recording
                                                    </TooltipContent>
                                                </Tooltip>
                                            </>
                                        ) : (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={toggleRecording}
                                                        disabled={isLoading || isTranscribing}
                                                        className="relative transition-all duration-200 active:scale-90"
                                                    >
                                                        <Icons.mic className="size-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" sideOffset={10}>
                                                    Start voice input
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TooltipProvider>
                                </div>
                            )}


                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChatInput2
