
import React from 'react';
import { Recipe } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { StarIcon } from './icons/StarIcon';

interface SavedRecipesListProps {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeName: string) => void;
  t: (key: string) => string;
}

const SavedRecipesList: React.FC<SavedRecipesListProps> = ({ recipes, selectedRecipe, onSelect, onDelete, t }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (recipes.length === 0) {
    return null; // Don't render anything if there are no saved recipes
  }

  const sortedRecipes = [...recipes].sort((a, b) => a.recipeName.localeCompare(b.recipeName));

  const filteredRecipes = sortedRecipes.filter(recipe =>
    recipe.recipeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <h3 className="text-2xl font-bold mb-4 text-amber-800">{t('savedRecipesTitle')}</h3>
      
      <div className="mb-4">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full p-2 border border-black rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition duration-150"
          aria-label={t('searchSavedRecipesLabel')}
        />
      </div>
      
      <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => {
            const isSelected = selectedRecipe?.recipeName === recipe.recipeName;
            return (
              <li 
                key={recipe.recipeName}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-amber-200' 
                    : 'bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <div className="flex flex-col flex-1 min-w-0 mr-2">
                  <span className="font-medium text-amber-900 truncate">{recipe.recipeName}</span>
                  {recipe.rating && recipe.rating > 0 && (
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon 
                          key={star}
                          className={`h-4 w-4 ${recipe.rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => onSelect(recipe)}
                    className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-200 rounded-full transition-colors"
                    aria-label={t('viewRecipeAriaLabel').replace('{recipeName}', recipe.recipeName)}
                  >
                    <BookOpenIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(recipe.recipeName)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                    aria-label={t('deleteRecipeAriaLabel').replace('{recipeName}', recipe.recipeName)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            )
          })
        ) : (
          <li className="text-center text-gray-500 py-4">{t('noRecipesFound')}</li>
        )}
      </ul>
    </div>
  );
};

export default SavedRecipesList;
