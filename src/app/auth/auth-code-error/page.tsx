"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const AuthCodeErrorPage = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center gap-y-4">
                <h2 className="text-2xl font-semibold">
                    Authentication Error
                </h2>
                <p className="text-muted-foreground">
                    There was an error processing your authentication request. This could be due to an expired or invalid authentication code.
                </p>
                <div className="flex gap-x-4">
                    <Button asChild>
                        <Link href="/auth/signin">
                            Try Again
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            Go Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AuthCodeErrorPage;
