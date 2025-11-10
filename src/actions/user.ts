"use server";

import { createClient } from "@/lib";
import { revalidatePath, revalidateTag } from "next/cache";

export const updateUser = async (instructions: string): Promise<string> => {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error("User not found");
        }

        const { error } = await supabase
            .from('users')
            .update({ instructions })
            .eq('id', user.id);

        if (error?.code === 'PGRST116') {
            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    instructions,
                    updated_at: new Date().toISOString()
                });

            if (insertError) throw insertError;
        } else if (error) {
            throw error;
        }

        await supabase.auth.updateUser({
            data: { instructions }
        });

        revalidatePath("/");
        
        return instructions;
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};
