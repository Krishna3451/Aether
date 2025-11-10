"use client";

import Container from "@/components/global/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ErrorPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
            <Container animation="fadeUp" delay={0.1}>
                <div className="text-center relative">
                    <span className="text-base font-medium text-red-500 bg-red-50 rounded-sm px-2 py-1">
                        500
                    </span>
                    <h2 className="text-3xl md:text-4xl font-semibold mt-6">
                        Internal Server Error
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mt-3">
                        Sorry, something went wrong on our end.
                    </p>

                    <Link href="/">
                        <Button className="mt-6" size="sm">
                            Back to home
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    );
};

export default ErrorPage; 
