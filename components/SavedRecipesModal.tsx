
import React from 'react';
import { Recipe } from '../types';
import SavedRecipesList from './SavedRecipesList';

interface SavedRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeName: string) => void;
  t: (key: string) => string;
}

const SavedRecipesModal: React.FC<SavedRecipesModalProps> = ({
  isOpen,
  onClose,
  recipes,
  selectedRecipe,
  onSelect,
  onDelete,
  t
}) => {
  if (!isOpen) {
    return null;
  }

  const handleSelectAndClose = (recipe: Recipe) => {
    onSelect(recipe);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-recipes-modal-title"
    >
      <div
        className="bg-amber-50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-transform duration-300 transform scale-95"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'enter 0.3s ease-out forwards' }}
      >
        <header className="flex justify-between items-center p-4 border-b border-amber-200">
          <h2 id="saved-recipes-modal-title" className="text-xl font-bold text-amber-800">{t('savedRecipesModalTitle')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('closeModalLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-4 overflow-y-auto">
          {recipes.length > 0 ? (
            <SavedRecipesList
              recipes={recipes}
              selectedRecipe={selectedRecipe}
              onSelect={handleSelectAndClose}
              onDelete={onDelete}
              t={t}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600">{t('noSavedRecipes')}</p>
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default SavedRecipesModal;
