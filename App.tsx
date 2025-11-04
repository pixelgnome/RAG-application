import React, { useState, useCallback } from 'react';
import { KnowledgeBaseManager } from './components/KnowledgeBaseManager';
import { ChatInterface } from './components/ChatInterface';
import { generateAnswer, extractPdfContent } from './services/geminiService';
import type { ChatMessage, KnowledgeDocument } from './types';
import { MessageSender } from './types';

function App() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeDocument[]>([
    {
      id: 'faq-initial-1',
      name: "When does the course AI Foundations and Prompt Engineering end?",
      content: "Ques: When does the course AI Foundations and Prompt Engineering end?\nAns: November 14",
      type: 'faq',
    }
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: MessageSender.BOT, text: "Hello! Add documents to the knowledge base and ask me questions about them." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFaq = useCallback((question: string, answer: string) => {
    const newFaq: KnowledgeDocument = {
      id: `faq-${Date.now()}`,
      name: question,
      content: `Ques: ${question}\nAns: ${answer}`,
      type: 'faq',
    };
    setKnowledgeBase(prev => [...prev, newFaq]);
  }, []);

  const handleAddPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: MessageSender.BOT, text: `Analyzing ${file.name}...` }]);
    
    const content = await extractPdfContent(file);
    
    if (content.startsWith('Error:')) {
        setMessages(prev => {
            const newMessages = prev.slice(0, -1); // remove "Analyzing..."
            newMessages.push({ sender: MessageSender.BOT, text: `Could not process ${file.name}. ${content}` });
            return newMessages;
        });
    } else {
        const newPdf: KnowledgeDocument = {
            id: `pdf-${Date.now()}`,
            name: file.name,
            content: content,
            type: 'pdf',
        };
        setKnowledgeBase(prev => [...prev, newPdf]);
        setMessages(prev => {
            const newMessages = prev.slice(0, -1); // remove "Analyzing..."
            newMessages.push({ sender: MessageSender.BOT, text: `Successfully added "${file.name}" to the knowledge base.` });
            return newMessages;
        });
    }
    
    setIsLoading(false);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { sender: MessageSender.USER, text: message }]);

    if (knowledgeBase.length === 0) {
      setMessages(prev => [...prev, { sender: MessageSender.BOT, text: "The knowledge base is empty. Please add some documents before asking questions." }]);
      setIsLoading(false);
      return;
    }

    const context = knowledgeBase
      .map(doc => `--- Document: ${doc.name} ---\n${doc.content}`)
      .join('\n\n');
    
    const botAnswer = await generateAnswer(message, context);

    setMessages(prev => [...prev, { sender: MessageSender.BOT, text: botAnswer }]);
    setIsLoading(false);
  }, [knowledgeBase]);

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            Interactive RAG Knowledge Base
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Build your own knowledge source and get answers instantly with Gemini.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <KnowledgeBaseManager 
              knowledgeBase={knowledgeBase}
              onAddFaq={handleAddFaq}
              onAddPdf={handleAddPdf}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;