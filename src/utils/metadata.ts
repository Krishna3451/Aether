import { Metadata } from "next";

export const generateMetadata = ({
    title = `${process.env.NEXT_PUBLIC_APP_NAME} - Smart AI Assistant`,
    description = `${process.env.NEXT_PUBLIC_APP_NAME} is an intelligent chat interface that provides contextual rendering of content. It offers a seamless and interactive user experience with AI-powered features.`,
    image = "/thumbnail.png",
    icons = {
        icon: [
            {
                rel: "icon",
                sizes: "32x32",
                url: "/icons/icon.svg",
            },
        ]
    }
}: {
    title?: string;
    description?: string;
    image?: string;
    icons?: {
        icon: {
            rel: string;
            sizes: string;
            url: string;
            media?: string;
        }[];
    }
    noIndex?: boolean;
} = {}): Metadata => ({
    title: title,
    description: description,
    icons: icons,
    openGraph: {
        title,
        description,
        // ...(image && { images: [{ url: image }] }),
    },
});
