
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';

const ImageGenPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    const result = await generateImage(prompt);
    
    if (result) {
      setImageUrl(result);
    } else {
      setError('Failed to generate image. Please try a different prompt.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2">AI Image Generation</h2>
      <p className="text-slate-400 mb-6">Describe the image you want to create.</p>
      
      <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic lion wearing a crown in a futuristic city"
          className="flex-grow w-full px-4 py-3 text-lg bg-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 font-semibold text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className="mt-8">
        {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg aspect-square w-full max-w-lg mx-auto border-2 border-dashed border-slate-600">
                <div className="w-16 h-16 border-4 border-sky-500 border-dashed rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-300">Conjuring your masterpiece...</p>
            </div>
        )}
        {error && <p className="text-red-400">{error}</p>}
        {imageUrl && !isLoading && (
          <div className="group relative w-full max-w-lg mx-auto">
            <img
              src={imageUrl}
              alt={prompt}
              className="rounded-lg shadow-2xl w-full h-full object-cover"
            />
            <a 
              href={imageUrl} 
              download={`gemini-art-${Date.now()}.png`}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Download Image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        )}
         {!imageUrl && !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg aspect-square w-full max-w-lg mx-auto border-2 border-dashed border-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-slate-400">Your generated image will appear here</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenPanel;
