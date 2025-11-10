'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { CheckIcon } from 'lucide-react'
import { FC, memo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import Icons from './global/icons'
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Props {
    language: string
    value: string
}

interface languageMap {
    [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
    javascript: '.js',
    python: '.py',
    java: '.java',
    c: '.c',
    cpp: '.cpp',
    'c++': '.cpp',
    'c#': '.cs',
    ruby: '.rb',
    php: '.php',
    swift: '.swift',
    'objective-c': '.m',
    kotlin: '.kt',
    typescript: '.ts',
    go: '.go',
    perl: '.pl',
    rust: '.rs',
    scala: '.scala',
    haskell: '.hs',
    lua: '.lua',
    shell: '.sh',
    sql: '.sql',
    html: '.html',
    css: '.css',
    jsx: '.jsx',
    tsx: '.tsx',
    json: '.json',
    markdown: '.md',
}

export const generateRandomString = (length: number, lowercase = false) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789';
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return lowercase ? result.toLowerCase() : result
}

const CodeBlock: FC<Props> = memo(({ language, value }) => {

    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

    const handleCopy = () => {
        if (isCopied) return;
        copyToClipboard(value)
    };

    return (
        <div className="relative w-full mt-2 mb-4 font-sans rounded-lg codeblock bg-neutral-50">
            <div className="flex items-center justify-between w-full px-4 py-1.5 pr-4 rounded-t-lg bg-neutral-100 text-neutral-900 select-none">
                <span className="text-xs lowercase">
                    {language}
                </span>
                <div className="flex items-center">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 text-xs w-max hover:bg-transparent text-muted-foreground hover:text-muted-foreground"
                                    onClick={handleCopy}
                                >
                                    {isCopied ? <CheckIcon className="w-3.5 h-3.5 animate-in" /> : <Icons.copy className="w-3.5 h-3.5" />}
                                    <span className="ml-1.5">
                                        {isCopied ? "Copied!" : "Copy"}
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isCopied ? "Copied!" : "Copy"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <SyntaxHighlighter
                language={language}
                style={materialLight}
                PreTag="div"
                showLineNumbers={false}
                customStyle={{
                    margin: 0,
                    width: '100%',
                    background: 'transparent',
                    padding: '1.5rem 1rem',
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollbarColor: "transparent transparent",
                    fontFamily: "JetBrains Mono, monospace",
                }}
                codeTagProps={{
                    style: {
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-mono)'
                    }
                }}
            >
                {value}
            </SyntaxHighlighter>
        </div>
    )
})
CodeBlock.displayName = 'CodeBlock'

export default CodeBlock
