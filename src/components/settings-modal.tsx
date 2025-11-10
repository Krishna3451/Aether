"use client";

import { signOut } from '@/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { TABS } from '@/constants';
import { useIsMobile, useSettings, useSpeech, useVoices } from "@/hooks";
import { User } from '@supabase/supabase-js';
import { motion } from "framer-motion";
import { ChevronDownIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { Button } from "./ui/button";

interface Props {
    user: User | null;
}

const SettingsModal = ({ user }: Props) => {

    const router = useRouter();

    const MotionTabsTrigger = motion(TabsTrigger);

    const { getDisplayName } = useSpeech();

    const { isOpen, setIsOpen } = useSettings();

    const { voices, selectedVoice, setSelectedVoice } = useVoices();

    const isMobile = useIsMobile();

    const [temperature, setTemperature] = useState<number>(7);
    const [isActive, setIsActive] = useState<string>("general");

    // const subscriptionLink = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_LINK || "";

    const handleSignout = async () => {
        await signOut();
        toast.success("You're logged out!");
        router.refresh();
    };

    useEffect(() => {
        localStorage.setItem("luro_model_temprature", temperature.toString());
    }, [temperature]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent showCloseButton={false} className="flex flex-col w-full md:rounded-2xl sm:max-w-3xl h-96 p-4">
                <DialogHeader className="sr-only">
                    <DialogTitle>
                        Settings
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-between w-full pb-4 border-b border-border">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Settings
                        <span className="text-sm text-muted-foreground font-normal">
                            (Beta)
                        </span>
                    </h2>
                    <Button
                        size="icon"
                        type="button"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="focus-visible:ring-0 focus-visible:ring-transparent"
                    >
                        <XIcon className="w-4 h-4" />
                    </Button>
                </div>
                <div className="w-full h-full ">
                    <Tabs
                        value={isActive}
                        defaultValue="general"
                        onValueChange={(value) => setIsActive(value)}
                        orientation={isMobile ? "horizontal" : "vertical"}
                        aria-orientation={isMobile ? "horizontal" : "vertical"}
                        className="flex flex-col w-full gap-6 md:flex-row"
                    >
                        <TabsList aria-orientation={isMobile ? "horizontal" : "vertical"} className="md:min-w-[180px] md:max-w-[200px] overflow-x-auto overflow-y-hidden scrollbar-hide">
                            {TABS.map((tab) => {

                                const name = tab.title.toLowerCase();

                                return (
                                    <MotionTabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        onClick={() => setIsActive(tab.value)}
                                        className="bg-transparent"
                                    >
                                        <span className="flex items-center gap-x-2">
                                            <tab.icon className="w-4 h-4" />
                                            {tab.title}

                                        </span>
                                        {isActive === name && (
                                            <motion.span
                                                layoutId="activeTab"
                                                transition={{
                                                    type: "keyframes",
                                                    duration: 0.3,
                                                }}
                                                className="absolute left-0 rounded-md bg-muted dark:bg-background -z-[1] w-full h-full"
                                            />
                                        )}
                                    </MotionTabsTrigger>
                                )
                            })}
                        </TabsList>
                        <div className="flex-1 w-full px-1 sm:px-0">
                            <TabsContent value="general" className="flex flex-col py-2">
                                <div className="flex flex-col pb-4 border-b border-border">
                                    <span className="text-sm font-medium">
                                        Profile
                                    </span>
                                    <div className="flex items-center gap-x-2">
                                        <div className="mt-2 w-14 h-14">
                                            <Image
                                                src={user?.user_metadata?.picture!}
                                                alt={user?.user_metadata?.full_name!}
                                                width={1024}
                                                height={1024}
                                                className="rounded-full"
                                            />
                                        </div>
                                        <div className="ml-4 flex flex-col">
                                            <span className="text-sm font-medium capitalize">
                                                {user?.user_metadata?.full_name}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {user?.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full py-4 border-b border-border">
                                    <span className="text-sm font-medium">
                                        Language
                                    </span>
                                    <span className="pr-2 text-sm text-muted-foreground">
                                        English
                                    </span>
                                </div>
                                <div className="flex items-center justify-between w-full mt-4">
                                    <span className="text-sm font-medium">
                                        Delete all chats
                                    </span>
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="destructive"
                                    >
                                        Delete all
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="theme" className="flex flex-col">
                                <div className="flex flex-col items-start w-full py-2">
                                    <span className="text-sm font-medium">
                                        Change theme
                                    </span>
                                    <div className="grid w-full grid-cols-3 gap-4 p-0.5 mt-3 text-sm">
                                        {/* {THEMES.map((item) => (
                                                <div
                                                    key={item.title}
                                                    onClick={() => setTheme(item.value)}
                                                    className={cn(
                                                        "flex-1 w-full rounded-2xl cursor-pointer",
                                                        item.value === theme ? "border-2 border-ring" : "border-2 border-transparent",
                                                    )}
                                                >
                                                    <item.icon className="w-full h-full rounded-[14.5px]" />
                                                </div>
                                            ))} */}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="behavior">
                                <div className="flex items-center justify-between w-full py-1">
                                    <span className="text-sm font-medium">
                                        Voice
                                    </span>
                                    <div className="pr-2 text-sm text-muted-foreground">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="sm" variant="ghost">
                                                    {selectedVoice ? `${getDisplayName(selectedVoice)}` : 'Select a voice'}
                                                    <ChevronDownIcon className="w-4 h-4 text-current ml-1.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 overflow-y-auto max-h-60 scrollbar-hide">
                                                {voices.map((voice, index) => (
                                                    <DropdownMenuItem
                                                        key={index}
                                                        onSelect={() => setSelectedVoice(voice)}
                                                    >
                                                        {getDisplayName(voice)}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <div className="flex flex-col w-full mt-4 py-1">
                                    <span className="text-sm font-medium">
                                        Crativity
                                    </span>
                                    <div className="pr-2 text-sm text-muted-foreground">
                                        <Slider
                                            id="temprature"
                                            min={5}
                                            step={1}
                                            max={100}
                                            defaultValue={[43]}
                                            onValueChange={(value) => setTemperature(value[0])}
                                            className="w-full my-6 h-1 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="billing">
                                <div className="flex flex-col items-start w-full py-2">
                                    <span className="text-sm font-medium">
                                        Billing
                                    </span>
                                    <div className="pr-2 text-sm w-full">
                                        {/* {user?.plan === "PRO" ? (
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center justify-between w-full gap-8 py-4 border-b border-border">
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-sm font-medium">
                                                            Plan
                                                        </span>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {user?.plan}
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href={subscriptionLink}
                                                        target="_blank"
                                                        className={buttonVariants({ size: "sm", variant: "outline" })}
                                                    >
                                                        Cancel
                                                    </Link>
                                                </div>
                                                <div className="flex items-center justify-between w-full gap-8 py-4">
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-sm font-medium">
                                                            Invoices
                                                        </span>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            View and download your invoices
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            toast.info("This feature is coming soon!");
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between w-full gap-8 py-4">
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-medium mt-2">
                                                        {user?.plan}
                                                    </span>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Get 5x more features with Luro Pro plan
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsPricingOpen(true)}
                                                >
                                                    Upgrade
                                                </Button>
                                            </div>
                                        )} */}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="security">
                                <div className="flex items-center justify-between w-full gap-8 py-2 border-b border-border">
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">
                                            Two-factor authentication
                                        </span>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Add an extra layer of security to your account by requiring a one-time code when signing in.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            toast.info("This feature is coming soon!");
                                        }}
                                    >
                                        Enable
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between w-full gap-8 py-4">
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium">
                                            Logout of all devices
                                        </span>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Logout of all active sessions across all devices, including your current session. It may take a few minutes to complete.
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleSignout()}
                                    >
                                        Log out
                                    </Button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog >
    )
}

export default SettingsModal
