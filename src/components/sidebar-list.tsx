import Container from "./global/container";
import SidebarItem from "./sidebar-item";
import { Chat } from "@/actions/chat";

const SidebarList = ({ chats }: { chats: Chat[] }) => {
    return (
        <div className="flex flex-1 flex-col">
            {chats.length ? (
                <ol className="sm:px-2">
                    {chats.map((chat, index) => (
                        <SidebarItem key={index} index={index} chat={chat} />
                    ))}
                </ol>
            ) : (
                <Container>
                    <div className="p-6 text-center">
                        <p className="text-sm text-muted-foreground font-medium">
                            No chats found
                        </p>
                    </div>
                </Container>
            )}
        </div>
    )
};

export default SidebarList
