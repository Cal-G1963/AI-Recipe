import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { generateSocialPost } from '../services/geminiService';
import Spinner from './Spinner';
import { LanguageKey } from '../localization';

interface SocialPostModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  language: LanguageKey;
  t: (key: string) => string;
}

const SocialPostModal: React.FC<SocialPostModalProps> = ({ recipe, isOpen, onClose, language, t }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [socialPost, setSocialPost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setSocialPost(null);
        setError(null);
        setIsLoading(false);
      }, 300); // Delay to allow for close animation
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!recipe) return;
    setIsLoading(true);
    setError(null);
    setSocialPost(null);
    try {
      const post = await generateSocialPost(recipe, language);
      setSocialPost(post);
    } catch (err) {
      setError(t('errorSocialPostGeneration'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!socialPost) return;
    navigator.clipboard.writeText(socialPost);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 transition-opacity duration-300" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-modal-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-transform duration-300 transform scale-95" 
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'enter 0.3s ease-out forwards' }}
      >
        <header className="relative flex justify-center items-center p-4 border-b border-gray-200">
          <h2 id="social-modal-title" className="text-xl font-bold text-gray-800">{t('socialModalTitle')}</h2>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('closeModalLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto">
          <p className="text-center text-lg font-bold text-amber-800 tracking-wider">THANK YOU FOR SHARING</p>
          
          {!socialPost && !isLoading && (
            <div className="text-center py-4">
              <button
                onClick={handleGenerate}
                className="w-full sm:w-auto bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-transform transform hover:scale-105"
              >
                {t('generateSocialPostButton')}
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8">
              <Spinner />
              <p className="mt-4 text-amber-700 font-medium">{t('generateSocialPostLoading')}</p>
            </div>
          )}

          {error && (
             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full text-center">
                <strong className="font-bold">{t('errorOops')} </strong>
                <span className="block sm:inline">{error}</span>
              </div>
          )}

          {socialPost && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <textarea
                  readOnly
                  value={socialPost}
                  className="w-full h-48 p-3 bg-white border border-black rounded-md font-mono text-sm whitespace-pre-wrap"
                  aria-label={t('generatedPostAriaLabel')}
                />
              </div>
              <div className="text-center">
                 <button
                  onClick={handleCopy}
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm font-bold py-2 px-4 rounded-md transition-colors"
                >
                  {isCopied ? t('copiedButton') : t('copyButton')}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SocialPostModal;