import { getUserChats } from "@/actions/chat";
import DesktopHeader from "@/components/desktop-header";
import DesktopSidebar from "@/components/desktop-sidebar";
import Providers from "@/components/global/providers";
import InstructionsModal from "@/components/instructions-modal";
import MainWrapper from "@/components/main-wrapper";
import MobileHeader from "@/components/mobile-header";
import SearchModal from "@/components/search-modal";
import SettingsModal from "@/components/settings-modal";
import { createClient } from "@/lib";
import "@/styles/globals.css";
import { cn, generateMetadata } from "@/utils";
import { Inter } from "next/font/google";

const font = Inter({
    subsets: ["latin"],
});

export const metadata = generateMetadata();

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const chats = await getUserChats();

    return (
        <html lang="en">
            <body
                className={cn(
                    "min-h-screen bg-background text-foreground antialiased",
                    font.className,
                )}
            >
                <Providers>
                    <SearchModal chats={chats} />
                    <SettingsModal user={user!} />
                    <InstructionsModal user={user!} />
                    <DesktopHeader user={user!} />
                    <MobileHeader user={user!} chats={chats} />
                    <div className="relative flex grow h-dvh w-full mx-auto overflow-auto -14 z-0">
                        <DesktopSidebar user={user!} chats={chats} />
                        <MainWrapper user={user!}>
                            {children}
                        </MainWrapper>
                    </div>
                </Providers>
            </body>
        </html>
    );
};
