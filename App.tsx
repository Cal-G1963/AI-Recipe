
import React, { useState, useCallback, useEffect } from 'react';
import { Recipe, DietaryOption, MealType, CookingMethod } from './types';
import { generateRecipe, generateRecipeImage, initiateVideoGeneration, checkVideoStatus, getFinalVideo, generateSocialPost } from './services/geminiService';
import { getSavedRecipes, saveRecipes } from './services/localStorageService';
import IngredientForm from './components/IngredientForm';
import RecipeDisplay from './components/RecipeDisplay';
import Spinner from './components/Spinner';
import { ChefHatIcon } from './components/icons/ChefHatIcon';
import FoodDecorations from './components/FoodDecorations';
import { languages, translations, LanguageKey } from './localization';
import SocialPostModal from './components/SocialPostModal';
import SavedRecipesModal from './components/SavedRecipesModal';
import VideoModal from './components/VideoModal';
import { CollectionIcon } from './components/icons/CollectionIcon';

// --- CONFIGURATION ---
// TODO: Replace this placeholder with your actual Gmail address.
const RECIPIENT_EMAIL = 'calumgreig@gmail.com';
// --------------------

// --- LocalStorage Auto-Save ---
const FORM_STATE_KEY = 'ai_recipe_generator_form_state';
const CURRENT_RECIPE_KEY = 'ai_recipe_generator_current_recipe';

const getInitialFormState = () => {
  try {
    const savedState = localStorage.getItem(FORM_STATE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      return {
        ingredients: parsed.ingredients || '',
        mealType: parsed.mealType || MealType.ANY,
        dietaryOptions: parsed.dietaryOptions || [],
        cookingMethods: parsed.cookingMethods || [],
        language: parsed.language || 'en',
        isQuickMeal: parsed.isQuickMeal || false,
      };
    }
  } catch (e) {
    console.error("Failed to load form state from localStorage", e);
  }
  return { ingredients: '', mealType: MealType.ANY, dietaryOptions: [], cookingMethods: [], language: 'en', isQuickMeal: false };
};

const getInitialRecipe = (): Recipe | null => {
  try {
    // FIX: Corrected typo in localStorage key from CURRENT_RECIPEC_KEY to CURRENT_RECIPE_KEY.
    const savedRecipe = localStorage.getItem(CURRENT_RECIPE_KEY);
    return savedRecipe ? JSON.parse(savedRecipe) : null;
  } catch (e) {
    console.error("Failed to load current recipe from localStorage", e);
    return null;
  }
};
// --------------------------------

const App: React.FC = () => {
  const initialFormState = getInitialFormState();
  const [ingredients, setIngredients] = useState<string>(initialFormState.ingredients);
  const [mealType, setMealType] = useState<MealType>(initialFormState.mealType);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOption[]>(initialFormState.dietaryOptions);
  const [cookingMethods, setCookingMethods] = useState<CookingMethod[]>(initialFormState.cookingMethods);
  const [language, setLanguage] = useState<LanguageKey>(initialFormState.language);
  const [isQuickMeal, setIsQuickMeal] = useState<boolean>(initialFormState.isQuickMeal);
  const [recipe, setRecipe] = useState<Recipe | null>(getInitialRecipe);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState<boolean>(false);
  const [selectedRecipeForSocial, setSelectedRecipeForSocial] = useState<Recipe | null>(null);
  const [isSavedRecipesModalOpen, setIsSavedRecipesModalOpen] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [videoModalUrl, setVideoModalUrl] = useState<string>('');
  const [isEmailCopied, setIsEmailCopied] = useState<boolean>(false);


  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language]?.[key] || translations['en'][key];
  }, [language]);

  useEffect(() => {
    setSavedRecipes(getSavedRecipes());
  }, []);
  
  // Auto-save form state to localStorage
  useEffect(() => {
    try {
      const formState = { ingredients, mealType, dietaryOptions, cookingMethods, language, isQuickMeal };
      localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
    } catch (e) {
      console.error("Failed to save form state to localStorage", e);
    }
  }, [ingredients, mealType, dietaryOptions, cookingMethods, language, isQuickMeal]);

  // Auto-save current recipe to localStorage
  useEffect(() => {
    try {
      if (recipe) {
        localStorage.setItem(CURRENT_RECIPE_KEY, JSON.stringify(recipe));
      } else {
        localStorage.removeItem(CURRENT_RECIPE_KEY);
      }
    } catch (e) {
      console.error("Failed to save current recipe to localStorage", e);
    }
  }, [recipe]);


  const handleSaveRecipe = (recipeToSave: Recipe) => {
    if (savedRecipes.some(r => r.recipeName === recipeToSave.recipeName)) {
      return; // Already saved
    }
    const recipeWithNotes = { ...recipeToSave, notes: '' }; // Initialize notes field
    const newSavedRecipes = [...savedRecipes, recipeWithNotes];
    setSavedRecipes(newSavedRecipes);
    saveRecipes(newSavedRecipes);
    setRecipe(recipeWithNotes); // Update current recipe to reflect saved state
  };

  const handleDeleteRecipe = (recipeNameToDelete: string) => {
    setSavedRecipes(prevSaved => {
        const newSavedRecipes = prevSaved.filter(r => r.recipeName !== recipeNameToDelete);
        saveRecipes(newSavedRecipes);
        return newSavedRecipes;
    });
    setRecipe(prevRecipe => {
        if (prevRecipe && prevRecipe.recipeName === recipeNameToDelete) {
            return null; // Clear the display if the deleted recipe was being viewed
        }
        return prevRecipe;
    });
  };

  const handleSelectSavedRecipe = (recipeToView: Recipe) => {
    setRecipe(recipeToView);
    setError(null);
    setImageError(null);
    setVideoError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRateRecipe = (newRating: number) => {
    setRecipe(prevRecipe => {
      if (!prevRecipe) return null;
      
      const updatedRecipe = { ...prevRecipe, rating: newRating };

      setSavedRecipes(prevSaved => {
        const newSaved = prevSaved.map(r =>
          r.recipeName === updatedRecipe.recipeName ? updatedRecipe : r
        );
        saveRecipes(newSaved);
        return newSaved;
      });
      
      return updatedRecipe;
    });
  };

  const handleUpdateNotes = (recipeName: string, newNotes: string) => {
    const newSavedRecipes = savedRecipes.map(r => 
      r.recipeName === recipeName ? { ...r, notes: newNotes } : r
    );
    setSavedRecipes(newSavedRecipes);
    saveRecipes(newSavedRecipes);

    if (recipe && recipe.recipeName === recipeName) {
      setRecipe(prev => prev ? { ...prev, notes: newNotes } : null);
    }
  };

  const handleGenerateRecipe = useCallback(async () => {
    if (!ingredients.trim()) {
      setError(t('errorIngredients'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageError(null);
    setVideoError(null);
    setRecipe(null);

    try {
      const result = await generateRecipe(ingredients, mealType, dietaryOptions, cookingMethods, language, isQuickMeal);
      setRecipe(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : t('errorGeneration');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, mealType, dietaryOptions, cookingMethods, language, t, isQuickMeal]);

  const handleGenerateVideo = useCallback(async () => {
    if (!recipe || !recipe.imageUrl) return;

    setVideoError(null);
    const recipeToUpdate = { ...recipe, isVideoGenerating: true };
    setRecipe(recipeToUpdate);

    const isSaved = savedRecipes.some(r => r.recipeName === recipeToUpdate.recipeName);
    if (isSaved) {
        const newSaved = savedRecipes.map(r => r.recipeName === recipeToUpdate.recipeName ? recipeToUpdate : r);
        setSavedRecipes(newSaved);
        saveRecipes(newSaved);
    }
    
    try {
        let operation = await initiateVideoGeneration(recipe.recipeName, recipe.imageUrl);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await checkVideoStatus(operation);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (downloadLink) {
            const videoUrl = await getFinalVideo(downloadLink);
            setVideoModalUrl(videoUrl);
            setIsVideoModalOpen(true);

            setRecipe(prev => {
                if (prev && prev.recipeName === recipe.recipeName) {
                    const finalRecipe = { ...prev, videoUrl, isVideoGenerating: false };
                    if (isSaved) {
                        const newSaved = savedRecipes.map(r => r.recipeName === finalRecipe.recipeName ? finalRecipe : r);
                        setSavedRecipes(newSaved);
                        saveRecipes(newSaved);
                    }
                    return finalRecipe;
                }
                return prev;
            });
        } else {
            throw new Error(t('errorVideoGeneration'));
        }

    } catch (err) {
        console.error("Failed to generate recipe video:", err);
        const errorMessage = err instanceof Error ? err.message : t('errorVideoGeneration');
        setVideoError(errorMessage);
        const finalRecipe = { ...recipeToUpdate, isVideoGenerating: false };
        setRecipe(finalRecipe);
         if (isSaved) {
            const newSaved = savedRecipes.map(r => r.recipeName === recipe.recipeName ? finalRecipe : r);
            setSavedRecipes(newSaved);
            saveRecipes(newSaved);
        }
    }
  }, [recipe, savedRecipes, t]);

  const handleOpenSocialModal = (recipeForSocial: Recipe) => {
    setSelectedRecipeForSocial(recipeForSocial);
    setIsSocialModalOpen(true);
  };

  const handleCloseSocialModal = () => {
    setIsSocialModalOpen(false);
    // Delay clearing to prevent flicker during modal close animation
    setTimeout(() => setSelectedRecipeForSocial(null), 300);
  };
  
  const handleWatchVideo = (url: string) => {
    setVideoModalUrl(url);
    setIsVideoModalOpen(true);
  };

  const handleEmailRecipe = async (recipeToEmail: Recipe) => {
    const subject = `${t('emailSubjectPrefix')}: ${recipeToEmail.recipeName}`;
    
    const ingredientsTitle = t('ingredientsHeader');
    const ingredientsList = recipeToEmail.ingredients.map(ing => `- ${ing}`).join('\n');
    
    const instructionsTitle = t('instructionsHeader');
    const instructionsList = recipeToEmail.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');
    
    const body = 
      `${recipeToEmail.description}\n\n` +
      `--- ${ingredientsTitle} ---\n${ingredientsList}\n\n` +
      `--- ${instructionsTitle} ---\n${instructionsList}`;

    try {
      await navigator.clipboard.writeText(body);
      setIsEmailCopied(true);
      setTimeout(() => setIsEmailCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy recipe to clipboard:', err);
      alert('Could not copy recipe to clipboard. Please copy it manually.');
    }
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(RECIPIENT_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(t('gmailBodyPlaceholder'))}`;
    
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const fetchImage = async () => {
      if (recipe && !recipe.imageUrl && !recipe.videoUrl) {
        setImageError(null);
        try {
          const imageUrl = await generateRecipeImage(recipe.recipeName, recipe.description);

          // Update the current recipe state
          setRecipe(prevRecipe => {
            if (prevRecipe && prevRecipe.recipeName === recipe.recipeName) {
              return { ...prevRecipe, imageUrl };
            }
            return prevRecipe;
          });

          // And also update the recipe in the saved list if it exists there
          setSavedRecipes(prevSavedRecipes => {
            const isSaved = prevSavedRecipes.some(r => r.recipeName === recipe.recipeName);
            if (isSaved) {
              const newSavedRecipes = prevSavedRecipes.map(r =>
                r.recipeName === recipe.recipeName ? { ...r, imageUrl } : r
              );
              saveRecipes(newSavedRecipes);
              return newSavedRecipes;
            }
            return prevSavedRecipes;
          });

        } catch (err) {
          console.error("Failed to generate recipe image:", err);
          const errorMessage = err instanceof Error ? err.message : t('errorImageGeneration');
          setImageError(errorMessage);
        }
      }
    };

    fetchImage();
  }, [recipe, t]);

  return (
    <div className="min-h-screen font-sans text-gray-800 relative overflow-x-hidden">
      <FoodDecorations />
      <header className="bg-white shadow-md p-4 sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ChefHatIcon className="h-8 w-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-amber-800 tracking-tight">{t('headerTitle')}</h1>
          </div>
          <div className="flex items-center gap-4">
             <button
                onClick={() => setIsSavedRecipesModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg transition-colors bg-amber-100 hover:bg-amber-200 text-amber-800"
                aria-label={t('savedRecipesButton')}
              >
                <CollectionIcon className="h-5 w-5" />
                <span className="hidden sm:inline">{t('savedRecipesButton')}</span>
              </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageKey)}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition duration-150 bg-white"
              aria-label={t('selectLanguageLabel')}
            >
              {Object.entries(languages).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="md:sticky md:top-28 flex flex-col gap-8">
            <IngredientForm
              ingredients={ingredients}
              setIngredients={setIngredients}
              mealType={mealType}
              setMealType={setMealType}
              isQuickMeal={isQuickMeal}
              setIsQuickMeal={setIsQuickMeal}
              dietaryOptions={dietaryOptions}
              setDietaryOptions={setDietaryOptions}
              cookingMethods={cookingMethods}
              setCookingMethods={setCookingMethods}
              isLoading={isLoading}
              onSubmit={handleGenerateRecipe}
              t={t}
            />
          </div>

          <div className="min-h-[400px] flex flex-col justify-center items-center">
            {isLoading ? (
              <div className="text-center">
                <Spinner />
                <p className="mt-4 text-amber-700 font-medium">{t('generateButtonLoading')}</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg w-full text-center">
                <strong className="font-bold">{t('errorOops')} </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            ) : recipe ? (
              <RecipeDisplay 
                recipe={recipe}
                imageError={imageError}
                videoError={videoError}
                onSave={handleSaveRecipe}
                isSaved={savedRecipes.some(r => r.recipeName === recipe.recipeName)}
                onRate={handleRateRecipe}
                onUpdateNotes={(newNotes) => handleUpdateNotes(recipe.recipeName, newNotes)}
                onGenerateAnother={handleGenerateRecipe}
                onOpenSocialModal={handleOpenSocialModal}
                onEmailRecipe={handleEmailRecipe}
                isEmailCopied={isEmailCopied}
                onWatchVideo={handleWatchVideo}
                onGenerateVideo={handleGenerateVideo}
                t={t}
              />
            ) : (
              <div className="text-center p-8 bg-amber-100/50 rounded-lg border-2 border-dashed border-amber-300">
                <ChefHatIcon className="h-16 w-16 mx-auto text-amber-400" />
                <h2 className="mt-4 text-xl font-semibold text-amber-800">{t('initialStateTitle')}</h2>
                <p className="mt-2 text-amber-700">{t('initialStateText')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <SavedRecipesModal
        isOpen={isSavedRecipesModalOpen}
        onClose={() => setIsSavedRecipesModalOpen(false)}
        recipes={savedRecipes}
        selectedRecipe={recipe}
        onSelect={handleSelectSavedRecipe}
        onDelete={handleDeleteRecipe}
        t={t}
      />
      
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={videoModalUrl}
        recipeName={recipe?.recipeName || t('videoModalAriaLabel')}
        t={t}
      />

      <SocialPostModal
        isOpen={isSocialModalOpen}
        onClose={handleCloseSocialModal}
        recipe={selectedRecipeForSocial}
        language={language}
        t={t}
      />

      <footer className="text-center p-4 mt-8 text-sm text-amber-700/80">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
};

export default App;
