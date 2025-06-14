import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({ content, className = '' }) => {
  const [copiedBlocks, setCopiedBlocks] = useState<Record<number, boolean>>({});

  const copyToClipboard = async (text: string, blockIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => ({ ...prev, [blockIndex]: true }));
      setTimeout(() => {
        setCopiedBlocks(prev => ({ ...prev, [blockIndex]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
                     code({ node, className, children, ...props }: any) {
             const inline = !className;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const code = String(children).replace(/\n$/, '');
            const blockIndex = Math.random();

            if (inline) {
                             return (
                 <code className="bg-gray-800/60 text-orange-300 px-2 py-1 rounded text-base font-mono">
                   {children}
                 </code>
               );
            }

                         return (
               <div className="relative group my-4">
                 <div className="flex items-center justify-between bg-slate-800/70 px-4 py-2 rounded-t-lg border border-white/10">
                   <span className="text-xs text-white/60 font-mono">{language}</span>
                   <button
                     onClick={() => copyToClipboard(code, blockIndex)}
                     className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                   >
                     {copiedBlocks[blockIndex] ? (
                       <>
                         <Check className="h-3 w-3" />
                         Copied
                       </>
                     ) : (
                       <>
                         <Copy className="h-3 w-3" />
                         Copy
                       </>
                     )}
                   </button>
                 </div>
                 <SyntaxHighlighter
                   language={language}
                   style={dracula}
                   customStyle={{
                     fontSize: '18px',
                     lineHeight: '1.2',
                     margin: 0,
                     borderRadius: '0 0 0.5rem 0.5rem',
                     border: '1px solid rgba(255, 255, 255, 0.1)',
                     borderTop: 'none',
                     backgroundColor: '#1e1a29',
                   }}
                   {...props}
                 >
                   {code}
                 </SyntaxHighlighter>
               </div>
             );
          },
                     h1: ({ children }) => (
             <h1 className="text-4xl font-bold text-white mt-6 mb-4">{children}</h1>
           ),
           h2: ({ children }) => (
             <h2 className="text-3xl font-bold text-white/95 mt-6 mb-3">{children}</h2>
           ),
           h3: ({ children }) => (
             <h3 className="text-2xl font-semibold text-white/90 mt-4 mb-2">{children}</h3>
           ),
           p: ({ children }) => (
             <p className="text-white/85 leading-relaxed my-2 text-lg">{children}</p>
           ),
                     ul: ({ children }) => (
             <ul className="space-y-1 my-2">{children}</ul>
           ),
           ol: ({ children }) => (
             <ol className="space-y-1 my-2">{children}</ol>
           ),
           li: ({ children }: any) => (
             <li className="flex gap-3 text-white/85 leading-relaxed text-lg">
               <span className="text-white/60 text-lg min-w-fit pt-0.5">•</span>
               <span className="flex-1">{children}</span>
             </li>
           ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white/95">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-white/90">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageFormatter;