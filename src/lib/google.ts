import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const google = createGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
});
