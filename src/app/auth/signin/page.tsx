"use client";

import { signInWithGoogle } from "@/actions/auth";
import Icons from "@/components/global/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SignInPage = () => {

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Unexpected error during sign in:', error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto text-center gap-y-3">
                <h2 className="text-2xl font-semibold">
                    Hello there! 👋
                </h2>
                <p className="text-sm text-muted-foreground">
                    By proceeding, you are creating an Aether account and agreeing to our{" "}
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
                    Sign in with Google
                </Button>
                <p className="text-sm text-muted-foreground mt-">
                    New to Aether?{" "}
                    <Link href="/auth/signup" className="text-foreground">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignInPage;
