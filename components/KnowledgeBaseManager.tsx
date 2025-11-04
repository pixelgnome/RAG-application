
import React, { useState } from 'react';
import type { KnowledgeDocument } from '../types';

interface KnowledgeBaseManagerProps {
  knowledgeBase: KnowledgeDocument[];
  onAddFaq: (question: string, answer: string) => void;
  onAddPdf: (file: File) => Promise<void>;
  isLoading: boolean;
}

const FaqIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);


export const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({ knowledgeBase, onAddFaq, onAddPdf, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onAddFaq(question, answer);
      setQuestion('');
      setAnswer('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      await onAddPdf(file);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 flex flex-col h-full ring-1 ring-white/10">
      <h2 className="text-2xl font-bold mb-6 text-sky-300">Knowledge Base</h2>

      <div className="space-y-6">
        {/* Add FAQ Form */}
        <form onSubmit={handleAddFaq} className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Add New FAQ</h3>
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-slate-400 mb-1">Question</label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the benefits of RAG?"
              className="w-full bg-slate-900/80 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none h-24"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-slate-400 mb-1">Answer</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="e.g., RAG combines retrieval models with generative models..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none h-32"
              rows={5}
            />
          </div>
          <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={isLoading || !question.trim() || !answer.trim()}>
            Add FAQ
          </button>
        </form>

        {/* Upload PDF Form */}
        <form onSubmit={handleUploadPdf} className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Upload PDF</h3>
          <div>
            <label htmlFor="pdf-upload" className="block text-sm font-medium text-slate-400 mb-1">PDF File</label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-sky-300 hover:file:bg-slate-600"
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={isLoading || !file}>
            Upload PDF
          </button>
        </form>
      </div>

      <div className="mt-8 flex-grow overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2 mb-4">Documents ({knowledgeBase.length})</h3>
        <div className="space-y-3 pr-2">
          {knowledgeBase.length > 0 ? (
            knowledgeBase.map((doc) => (
              <div key={doc.id} className="bg-slate-900/80 p-3 rounded-md flex items-start space-x-3">
                {doc.type === 'faq' ? <FaqIcon /> : <PdfIcon />}
                <p className="text-sm text-slate-300 break-words w-full">{doc.name}</p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">Your knowledge base is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
};
