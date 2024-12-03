import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Wand2 } from 'lucide-react';

export function PromptInput() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/editor', { state: { prompt } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your dream website... (e.g., 'Create a modern portfolio website with a dark theme')"
            className="w-full h-40 p-4 text-gray-200 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none backdrop-blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl pointer-events-none"></div>
        </div>
        <Button 
          type="submit" 
          className="flex items-center justify-center gap-2 py-3 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Wand2 size={20} />
          Generate Website
        </Button>
      </div>
    </form>
  );
}