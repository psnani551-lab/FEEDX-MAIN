import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Simple markdown parser - handles common markdown syntax
const parseMarkdown = (text: string): string => {
  let html = text;

  // Escape HTML first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2 text-foreground">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-3 text-foreground">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong class="font-semibold text-foreground">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em class="italic">$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/gim, '<del class="line-through opacity-70">$1</del>');

  // Inline code
  html = html.replace(/`([^`]+)`/gim, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-400">$1</code>');

  // Links: Explicit [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">$1</a>');

  // Auto-linking: Plain https/http URLs (not already inside an <a> tag)
  // This is a simplified regex for plain URLs
  html = html.replace(/(?<!href=")(https?:\/\/[^\s<]+)/gim, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">$1</a>');

  // Lists: Unordered lists (support -, *, + and •)
  // We first mark list items
  html = html.replace(/^\s*[-*+•] (.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground">$1</li>');

  // Wrap adjacent <li> tags in <ul>
  html = html.replace(/(<li class="ml-4 list-disc text-muted-foreground">.*<\/li>(\n)?)+/gim, (match) => {
    return `<ul class="my-2 space-y-1">${match}</ul>`;
  });

  // Ordered lists
  html = html.replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>');
  html = html.replace(/(<li class="ml-4 list-decimal text-muted-foreground">.*<\/li>(\n)?)+/gim, (match) => {
    return `<ol class="my-2 space-y-1">${match}</ol>`;
  });

  // Blockquotes
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-cyan-500/50 pl-4 py-1 my-2 text-muted-foreground italic bg-white/5 rounded-r">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr class="border-white/10 my-4" />');

  // Line breaks and paragraphs
  // Split by double newlines for paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    const content = p.trim().replace(/\n/g, '<br />');
    if (!content) return '';
    // Don't wrap if it's already a structural element like <ul>, <ol>, <blockquote>, <h*>
    if (content.startsWith('<ul') || content.startsWith('<ol') || content.startsWith('<blockquote') || content.startsWith('<h') || content.startsWith('<hr')) {
      return content;
    }
    return `<p class="mb-3">${content}</p>`;
  }).filter(Boolean).join('');

  return html;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const parsedContent = parseMarkdown(content || '');

  return (
    <div
      className={`markdown-content prose prose-invert prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};

export default MarkdownRenderer;
