"use client";

import { signInWithGoogle } from "@/actions";
import Icons from "@/components/global/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SignUpPage = () => {

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Unexpected error during sign in:', error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center gap-y-3 text-center w-full max-w-xs mx-auto">
                <h2 className="text-2xl font-semibold">
                    Sign Up for Aether! ✨
                </h2>
                <p className="text-sm text-muted-foreground">
                    By proceeding, you are creating a Aether account and agreeing to our{" "}
                    <Link href="#" className="text-foreground">
                        Terms of Service
                    </Link>{" "}
                    and <Link href="#" className="text-foreground">
                        Privacy Policy
                    </Link>.
                </p>
                <Button
                    type="button"
                    onClick={() => handleSignIn()}
                    className="w-full"
                >
                    <Icons.google className="w-4 h-4 mr-2" />
                    Sign up with Google
                </Button>
                <p className="text-sm text-muted-foreground mt-">
                    Already a member?{" "}
                    <Link href="/auth/signin" className="text-foreground">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
