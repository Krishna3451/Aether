"use server";

import { createClient } from "@/lib";
import { redirect } from "next/navigation";

export const signInWithGoogle = async () => {
    const supabase = await createClient()

    const auth_callback_url = `${process.env.NEXT_SITE_URL}/auth/callback`

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: auth_callback_url,
        },
    })

    if (error) {
        console.log("error", error)
    }

    redirect(data.url!);
};

export const signOut = async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
};
