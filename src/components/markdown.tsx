import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './code-block';
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from './ui/table';
import { cn } from '@/utils';

const components: Partial<Components> = {
    code({ node, className, children, ...props }) {
        const childArray = React.Children.toArray(children)
        const firstChild = childArray[0] as React.ReactElement
        const firstChildAsString = React.isValidElement(firstChild)
            // @ts-expect-error
            ? (firstChild as React.ReactElement).props.children
            : firstChild

        if (firstChildAsString === "▍") {
            return <span className="mt-1 cursor-default animate-pulse">▍</span>
        }

        if (typeof firstChildAsString === "string") {
            childArray[0] = firstChildAsString.replace("`▍`", "▍")
        }

        const match = /language-(\w+)/.exec(className || "")

        if (
            typeof firstChildAsString === "string" &&
            !firstChildAsString.includes("\n")
        ) {
            return (
                <code className={cn(className, "px-1 py-0.5 rounded bg-muted")} {...props}>
                    {childArray}
                </code>
            )
        }

        return (
            <CodeBlock
                key={Math.random()}
                language={(match && match[1]) || ""}
                value={String(childArray).replace(/\n$/, "")}
                {...props}
            />
        )
    },
    pre: ({ children }) => <>{children}</>,
    ol: ({ node, children, ...props }) => {
        return (
            <ol className="list-decimal list-outside ml-4" {...props}>
                {children}
            </ol>
        );
    },
    li: ({ node, children, ...props }) => {
        return (
            <li className="py-1" {...props}>
                {children}
            </li>
        );
    },
    ul: ({ node, children, ...props }) => {
        return (
            <ul className="list-decimal list-outside ml-4" {...props}>
                {children}
            </ul>
        );
    },
    strong: ({ node, children, ...props }) => {
        return (
            <span className="font-semibold" {...props}>
                {children}
            </span>
        );
    },
    em: ({ node, children, ...props }) => (
        <em className="italic" {...props}>
            {children}
        </em>
    ),
    blockquote: ({ node, children, ...props }) => (
        <blockquote className="border-l-4 border-border pl-4 py-1 my-4 bg-muted/20 rounded-r-lg" {...props}>
            {children}
        </blockquote>
    ),
    a: ({ node, children, ...props }) => {
        return (
            // @ts-expect-error
            <Link
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noreferrer"
                {...props}
            >
                {children}
            </Link>
        );
    },
    p: ({ node, children, ...props }) => (
        <p className="" {...props}>
            {children}
        </p>
    ),
    h1: ({ node, children, ...props }) => {
        return (
            <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
                {children}
            </h1>
        );
    },
    h2: ({ node, children, ...props }) => {
        return (
            <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
                {children}
            </h2>
        );
    },
    h3: ({ node, children, ...props }) => {
        return (
            <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
                {children}
            </h3>
        );
    },
    h4: ({ node, children, ...props }) => {
        return (
            <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
                {children}
            </h4>
        );
    },
    h5: ({ node, children, ...props }) => {
        return (
            <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
                {children}
            </h5>
        );
    },
    h6: ({ node, children, ...props }) => {
        return (
            <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
                {children}
            </h6>
        );
    },

    table: ({ node, children, ...props }) => (
        <div className="my-6 rounded-md border border-border overflow-hidden">
            <Table {...props}>
                {children}
            </Table>
        </div>
    ),
    thead: ({ node, children, ...props }) => (
        <TableHeader {...props}>
            {children}
        </TableHeader>
    ),
    tbody: ({ node, children, ...props }) => (
        <TableBody {...props}>
            {children}
        </TableBody>
    ),
    tr: ({ node, children, ...props }) => (
        <TableRow {...props}>
            {children}
        </TableRow>
    ),
    td: ({ node, children, ...props }) => (
        <TableCell className="p-3 border-t border-border" {...props}>
            {children}
        </TableCell>
    ),
    th: ({ node, children, ...props }) => (
        <TableHead className="p-3 text-foreground font-medium bg-muted/50" {...props}>
            {children}
        </TableHead>
    ),
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
    return (
        <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
            {children}
        </ReactMarkdown>
    );
};

const Markdown = memo(
    NonMemoizedMarkdown,
    (prevProps, nextProps) => prevProps.children === nextProps.children,
);

export default Markdown;
