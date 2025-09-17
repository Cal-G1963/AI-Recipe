

import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { ChefHatIcon } from './icons/ChefHatIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import StarRating from './StarRating';
import { RefreshIcon } from './icons/RefreshIcon';
import Spinner from './Spinner';
import { ShareIcon } from './icons/ShareIcon';
import { EmailIcon } from './icons/EmailIcon';
import { PlayIcon } from './icons/PlayIcon';
import { VideoIcon } from './icons/VideoIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface RecipeDisplayProps {
  recipe: Recipe;
  imageError: string | null;
  videoError: string | null;
  onSave: (recipe: Recipe) => void;
  isSaved: boolean;
  onRate: (rating: number) => void;
  onUpdateNotes: (notes: string) => void;
  onGenerateAnother: () => void;
  onOpenSocialModal: (recipe: Recipe) => void;
  onEmailRecipe: (recipe: Recipe) => void;
  isEmailCopied: boolean;
  onWatchVideo: (videoUrl: string) => void;
  onGenerateVideo: () => void;
  t: (key: string) => string;
}

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
    <span className="font-semibold">{label}:</span> {value}
  </div>
);

const ImagePlaceholder: React.FC<{t: (key: string) => string}> = ({ t }) => (
  <div className="w-full h-full bg-amber-100 flex flex-col justify-center items-center">
    <ChefHatIcon className="h-12 w-12 text-amber-300" />
    <p className="mt-2 text-sm font-medium text-amber-600">{t('imagePlaceholder')}</p>
  </div>
);

const ImageErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-full h-full bg-red-100 flex flex-col justify-center items-center text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-red-700 font-medium">{message}</p>
  </div>
);

const VideoLoadingOverlay: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    const loadingText = t('generateVideoLoading');
    return (
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white z-10 overflow-hidden">
            <Spinner />
            <div className="w-full absolute bottom-4 flex">
                <p className="font-medium text-lg whitespace-nowrap animate-marquee">
                    <span className="mx-8">{loadingText}</span>
                    <span className="mx-8">{loadingText}</span>
                </p>
            </div>
        </div>
    );
};

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onSave, isSaved, onRate, onUpdateNotes, onGenerateAnother, onOpenSocialModal, onEmailRecipe, isEmailCopied, onWatchVideo, onGenerateVideo, t, imageError, videoError }) => {
  const [notes, setNotes] = useState(recipe.notes || '');

  useEffect(() => {
    setNotes(recipe.notes || '');
  }, [recipe.notes]);

  const handleDownloadImage = () => {
    if (!recipe.imageUrl) return;
    const a = document.createElement('a');
    a.href = recipe.imageUrl;
    a.download = `${recipe.recipeName.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-amber-200 overflow-hidden w-full animate-fade-in">
      <div className="relative w-full aspect-video bg-amber-100">
        {recipe.imageUrl ? (
          <>
            <img 
              src={recipe.imageUrl}
              alt={recipe.recipeName}
              className="w-full h-full object-cover animate-fade-in-image"
            />
            <div className="absolute top-2 left-2 flex flex-wrap gap-2 z-10">
                <button
                    onClick={handleDownloadImage}
                    className="bg-white/80 rounded-full p-2 pr-4 flex items-center gap-2 text-gray-700 hover:text-black hover:bg-white transition-all"
                    aria-label={t('downloadImageLabel')}
                >
                    <DownloadIcon className="h-5 w-5" />
                    <span className="font-semibold text-sm">{t('downloadAndShare')}</span>
                </button>
            </div>
          </>
        ) : imageError ? (
          <ImageErrorDisplay message={imageError} />
        ) : (
          <ImagePlaceholder t={t} />
        )}

        {recipe.isVideoGenerating && <VideoLoadingOverlay t={t} />}
        
        {videoError && (
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center p-4 z-10">
            <ImageErrorDisplay message={videoError} />
          </div>
        )}

        {recipe.videoUrl && !recipe.isVideoGenerating && (
          <button 
            onClick={() => onWatchVideo(recipe.videoUrl!)}
            className="absolute inset-0 flex justify-center items-center bg-black/40 group transition-all duration-300 hover:bg-black/60 z-10"
            aria-label={t('watchVideoButton')}
          >
            <div className="flex flex-col items-center text-white">
              <div className="bg-white/30 rounded-full p-4 group-hover:bg-white/40 transition-all duration-300 transform group-hover:scale-110">
                <PlayIcon className="h-12 w-12 text-white" />
              </div>
              <span className="mt-2 font-bold text-lg drop-shadow-md">{t('watchVideoButton')}</span>
            </div>
          </button>
        )}
      </div>
     
      <div className="p-6">
        <div className="mb-4 flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={onGenerateAnother}
              className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-amber-100 hover:bg-amber-200 text-amber-800"
              aria-label={t('tryAnotherButton')}
            >
              <RefreshIcon className="h-5 w-5" />
              <span>{t('tryAnotherButton')}</span>
            </button>
             <button
                onClick={() => onEmailRecipe(recipe)}
                className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-amber-100 hover:bg-amber-200 text-amber-800"
                aria-label={t('emailRecipeButton')}
              >
                <EmailIcon className="h-5 w-5" />
                <span>{isEmailCopied ? t('copiedButton') : t('emailRecipeButton')}</span>
            </button>
            <button
                onClick={() => onOpenSocialModal(recipe)}
                className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-blue-100 hover:bg-blue-200 text-blue-800"
                aria-label={t('socialPostButton')}
              >
                <ShareIcon className="h-5 w-5" />
                <span>{t('socialPostButton')}</span>
            </button>
            <div className="relative group">
              <button
                onClick={() => onSave(recipe)}
                disabled={isSaved}
                className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed bg-amber-100 hover:bg-amber-200 text-amber-800 disabled:bg-green-100 disabled:text-green-800"
                aria-label={isSaved ? t('savedButton') : t('saveButton')}
              >
                <BookmarkIcon className={`h-5 w-5 ${isSaved ? 'fill-green-700 text-green-700' : ''}`} />
                <span>{isSaved ? t('savedButton') : t('saveButton')}</span>
              </button>
              {isSaved && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap bg-gray-800 text-white text-xs font-semibold rounded-md py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  {t('recipeSavedTooltip')}
                </span>
              )}
            </div>

            {recipe.imageUrl && !recipe.videoUrl && !recipe.isVideoGenerating && (
                <button
                  onClick={onGenerateVideo}
                  className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-purple-100 hover:bg-purple-200 text-purple-800"
                  aria-label={t('generateVideoButton')}
                >
                  <VideoIcon className="h-5 w-5" />
                  <span>{t('generateVideoButton')}</span>
                </button>
            )}
        </div>

        <h2 className="text-3xl font-bold text-amber-900">{recipe.recipeName}</h2>
        
        {isSaved && (
          <div className="mt-2 mb-4">
            <StarRating rating={recipe.rating || 0} onRate={onRate} t={t} />
          </div>
        )}

        <p className="text-gray-600 my-4 italic">{recipe.description}</p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <InfoPill label={t('prepTimeLabel')} value={recipe.prepTime} />
          <InfoPill label={t('cookTimeLabel')} value={recipe.cookTime} />
          <InfoPill label={t('servingsLabel')} value={recipe.servings} />
          {recipe.nutrition && (
            <>
              <InfoPill label={t('caloriesLabel')} value={recipe.nutrition.calories} />
              <InfoPill label={t('proteinLabel')} value={recipe.nutrition.protein} />
              <InfoPill label={t('carbsLabel')} value={recipe.nutrition.carbs} />
              <InfoPill label={t('fatLabel')} value={recipe.nutrition.fat} />
              {recipe.nutrition.glycemicIndex && (
                <InfoPill label={t('giLabel')} value={recipe.nutrition.glycemicIndex} />
              )}
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500 italic my-4 text-center">
          {t('medicalDisclaimer')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-amber-800 border-b-2 border-amber-200 pb-1">{t('ingredientsHeader')}</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-amber-800 border-b-2 border-amber-200 pb-1">{t('instructionsHeader')}</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
        
        {isSaved && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-amber-800 border-b-2 border-amber-200 pb-1">{t('notesHeader')}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdateNotes(notes)}
              placeholder={t('notesPlaceholder')}
              rows={4}
              className="w-full p-3 border border-black rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition duration-150 bg-white"
              aria-label={t('recipeNotesLabel')}
            />
          </div>
        )}

      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes fade-in-image {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-image {
          animation: fade-in-image 0.5s ease-out forwards;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RecipeDisplay;