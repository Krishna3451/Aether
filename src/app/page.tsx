import ChatContainer from "@/components/chat-container";
import Container from "@/components/global/container";
import Icons from "@/components/global/icons";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const Home = async () => {

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        return (
            <div className="flex items-center justify-center w-full relative h-dvh group overflow-auto transition-all duration-300 ease-in-out z-0">
                {/* <div className="absolute -z-10 bottom-0 left-1/2 -translate-x-1/2 bg-orange-500 rounded-full w-1/4 h-1/6 blur-[10rem] hidden lg:block opacity-20"></div> */}

                <div className="fixed -z-10 top-0 left-1/2 -translate-x-1/2 bg-blue-500 rounded-full w-full h-1/6 blur-[10rem] hidden lg:block opacity-10"></div>
                <div className="fixed -z-10 top-0 left-1/2 -translate-x-1/2 bg-amber-500 rounded-full w-3/4 h-1/6 blur-[10rem] hidden lg:block opacity-10"></div>
                <div className="fixed -z-10 top-1/8 left-1/4 -translate-x-1/4 bg-orange-500 rounded-full w-1/3 h-1/6 blur-[10rem] mix-blend-multiply hidden lg:block opacity-20"></div>
                <div className="fixed -z-10 top-1/8 right-1/4 translate-x-1/4 bg-sky-500 rounded-full w-1/3 h-1/6 blur-[10rem] mix-blend-multiply hidden lg:block opacity-20"></div>

                <ChatContainer user={user} messages={[]} />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <Container animation="fadeUp">
                <div className="flex flex-col items-center max-w-xl px-2 mx-auto sm:px-0">
                    <Icons.icon className="size-12" />
                    <h1 className="mt-6 text-3xl font-medium text-center">
                        The intelligent AI companion
                    </h1>
                    <p className="w-full mt-4 text-center text-muted-foreground text-balance">
                        Aether is your creative companion, effortlessly generating content, diagrams, and images
                    </p>
                    <Link href="/auth/signin" className={buttonVariants({ className: "mt-6" })}>
                        Start creating
                        <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                    </Link>
                </div>
            </Container>
        </div>
    )
};

export default Home
