'use client';

import { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from '../../services/api';
import { ChatOutlined as ChatIcon, Close as CloseIcon } from '@mui/icons-material';

export const ChatWidget = () => {
  const [messages, setMessages] = useState<Array<{ content: string; isUser: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // ... (keep the existing formatMarkdown function and useEffect hooks from ChatPage)

  const formatMarkdown = (text: string): string => {
    let formatted = text;
  
    // Pre-process: Insert newline before numbered list items if missing
    formatted = formatted.replace(/(\d+\.\s)/g, "\n$1");
  
    // Process code blocks and inline code
    formatted = formatted
      .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  
    // Process headings
    formatted = formatted
      .replace(/####\s*(.*?)(?:\n|$)/g, "<h4>$1</h4>")
      .replace(/###\s*(.*?)(?:\n|$)/g, "<h3>$1</h3>")
      .replace(/##\s*(.*?)(?:\n|$)/g, "<h2>$1</h2>")
      .replace(/#\s*(.*?)(?:\n|$)/g, "<h1>$1</h1>");
  
    // Process other Markdown elements
    formatted = formatted
      .replace(/^\s*>\s+(.*)$/gm, "<blockquote>$1</blockquote>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/^---$/gm, "<hr>")
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<img src='$2' alt='$1' />")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2'>$1</a>");
  
    // Process lists
    formatted = formatted.replace(
      /((?:^\s*-\s+.*(?:\n|$))+)/gm,
      (match) => `<ul>${match.replace(/-\s+(.*)/g, "<li>$1</li>")}</ul>`
    ).replace(
      /((?:^\s*\d+\.\s+.*(?:\n|$))+)/gm,
      (match) => `<ol>${match.replace(/\d+\.\s+(.*)/g, "<li>$1</li>")}</ol>`
    );
    
    formatted = formatted.replace(/(?:^|\n)(?!<h\d>|<ul>|<ol>|<pre>|<blockquote>|<hr>)([^\n]+)(?=\n|$)/g, (match, p1) => {
      // Skip if the line is already wrapped or is empty
      if (/^\s*$/.test(p1) || /^<\/?(h\d|ul|ol|pre|blockquote|hr)>/.test(p1)) {
        return match;
      }
      return `<p>${p1}</p>`;
    });
  
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
  
    // Add user message
    setMessages(prev => [...prev, { content: input, isUser: true }]);
    setInput('');
    setIsLoading(true);
  
    try {
      // Add empty assistant message
      setMessages(prev => [...prev, { content: '', isUser: false }]);
  
      // Stream response - handle errors
      const stream = await streamChatResponse('52f4bf9d-daa3-41da-8c69-7338705bef3b', input);
      
      try {
        for await (const chunk of stream) {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.isUser) return prev;
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + chunk }
            ];
          });
        }
      } catch (streamError) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { content: 'Error receiving response', isUser: false }
        ]);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-[400px] lg:w-[480px] h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 text-white rounded-t-xl">
            <h3 className="font-semibold">Finance Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded-full"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[99%] p-2 rounded-lg text-sm ${
                  msg.isUser 
                    ? 'bg-blue-100 text-blue-900' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about finances..."
                className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <ChatIcon fontSize="medium" />
        </button>
      )}
    </div>
  );
};