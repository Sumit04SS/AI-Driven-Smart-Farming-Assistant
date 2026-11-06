import React from 'react';
import type { Components } from 'react-markdown';

/**
 * Preprocesses markdown string to ensure LaTeX math formulas (\[...\], \(...\)),
 * table formatting, and heading breaks are properly rendered by remark/rehype plugins.
 */
export const preprocessMarkdown = (content: string): string => {
  if (!content) return '';
  let text = content;

  // 1. Convert LaTeX display math \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '\n\n$$\n$1\n$$\n\n');

  // 2. Convert LaTeX inline math \( ... \) to $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 3. Ensure headings have a preceding blank line so markdown parser detects them
  text = text.replace(/([^\n])\n(#{1,4}\s)/g, '$1\n\n$2');

  return text;
};

/**
 * Enhanced ReactMarkdown component specifications supporting responsive tables,
 * styled headings, code blocks, lists, and KaTeX math formulas.
 */
export const markdownComponents: Components = {
  h1: ({ ...props }) => (
    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 first:mt-0 tracking-tight" {...props} />
  ),
  h2: ({ ...props }) => (
    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-100 first:mt-0" {...props} />
  ),
  h3: ({ ...props }) => (
    <h3 className="text-base sm:text-lg font-bold text-emerald-950 mt-5 mb-2 flex items-center gap-2 first:mt-0" {...props} />
  ),
  h4: ({ ...props }) => (
    <h4 className="text-sm font-semibold text-slate-900 mt-3 mb-1.5" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed mb-4 last:mb-0" {...props} />
  ),
  ul: ({ ...props }) => (
    <ul className="list-disc list-outside pl-5 space-y-2 mb-4 text-sm sm:text-[15px] text-slate-700" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="list-decimal list-outside pl-5 space-y-2 mb-4 text-sm sm:text-[15px] text-slate-700" {...props} />
  ),
  li: ({ ...props }) => (
    <li className="leading-relaxed pl-1" {...props} />
  ),
  strong: ({ ...props }) => (
    <strong className="font-semibold text-slate-900" {...props} />
  ),
  blockquote: ({ ...props }) => (
    <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/60 pl-4 py-2.5 my-4 rounded-r-xl text-sm sm:text-[15px] text-slate-800 italic" {...props} />
  ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto my-5 rounded-xl border border-slate-200 shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm" {...props} />
    </div>
  ),
  thead: ({ ...props }) => (
    <thead className="bg-slate-50 text-slate-800 font-bold uppercase tracking-wider text-[11px]" {...props} />
  ),
  tbody: ({ ...props }) => (
    <tbody className="divide-y divide-slate-100 bg-white" {...props} />
  ),
  tr: ({ ...props }) => (
    <tr className="hover:bg-slate-50/80 transition-colors" {...props} />
  ),
  th: ({ ...props }) => (
    <th className="px-4 py-3 text-left font-semibold text-slate-900" {...props} />
  ),
  td: ({ ...props }) => (
    <td className="px-4 py-2.5 text-slate-700 whitespace-normal leading-relaxed" {...props} />
  ),
  code: ({ inline, className, children, ...props }: any) => {
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono text-xs border border-emerald-100" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="p-3.5 my-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto" {...props}>
        <code>{children}</code>
      </pre>
    );
  },
  hr: ({ ...props }) => (
    <hr className="my-5 border-slate-200/80" {...props} />
  ),
};
