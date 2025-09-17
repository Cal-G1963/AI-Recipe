
import { Recipe } from '../types';

const SAVED_RECIPES_KEY = 'ai_recipe_generator_saved_recipes';

export const getSavedRecipes = (): Recipe[] => {
  try {
    const savedRecipesJson = localStorage.getItem(SAVED_RECIPES_KEY);
    if (savedRecipesJson) {
      return JSON.parse(savedRecipesJson);
    }
  } catch (error) {
    console.error("Could not parse saved recipes from local storage:", error);
  }
  return [];
};

export const saveRecipes = (recipes: Recipe[]): void => {
  try {
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(recipes));
  } catch (error) {
    console.error("Could not save recipes to local storage:", error);
  }
};
