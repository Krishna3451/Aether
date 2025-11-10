import Container from "@/components/global/container";
import { capitalizeFirstLetter } from "@/utils";
import { User } from "@supabase/supabase-js";

interface Props {
    user: User | null;
    handleSelectPrompt: (prompt: string) => void;
}

const EmptyState = ({ user, handleSelectPrompt }: Props) => {
    return (
        <Container animation="blurIn" className="relative flex flex-col items-center justify-end w-full h-full">
            <div className="flex flex-col items-center justify-center size-full">
                <div className="relative w-full flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center">
                        {/* <video src="/icon.mp4" autoPlay loop muted className="size-32" /> */}
                        <img src="/icon.gif" className="w-32" />
                        <div className="absolute bottom-4 bg-orange-500 w-10 h-[2px] blur-sm rounded-full mx-auto"></div>
                    </div>
                    <h2 className="text-2xl font-medium mt-4">
                        Hello {capitalizeFirstLetter(user?.user_metadata.full_name || "there")}!
                    </h2>
                </div>
                {/* <div className="grid w-full grid-cols-1 gap-2 mt-10 mb-6 md:grid-cols-2">
                    {PROMPTS.map((prompt, index) => (
                        <Container key={prompt.title} delay={index * 0.05}>
                            <div
                                onClick={() => handleSelectPrompt(prompt.title + " " + prompt.description)}
                                className="flex flex-col items-start w-full px-4 py-4 bg-transparent border cursor-pointer rounded-2xl border-border hover:bg-muted select-none active:scale-95 transition transform"
                            >
                                <h3 className="text-base font-medium">
                                    {prompt.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {prompt.description}
                                </p>
                            </div>
                        </Container>
                    ))}
                </div> */}
            </div>
        </Container>
    )
};

export default EmptyState
