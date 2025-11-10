import { getChatWithMessages } from "@/actions/chat";
import ChatContainer from "@/components/chat-container";
import { createClient } from "@/lib";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{
        id: string;
    }>
}

const ChatIdPage = async ({ params }: Props) => {

    const { id } = await params;

    if (!id) {
        notFound();
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const chats = await getChatWithMessages(id);
    const messages = chats.messages || [];

    return (
        <div className="w-full h-full">
            <ChatContainer user={user!} chatId={id} messages={messages} />
        </div>
    )
};

export default ChatIdPage
