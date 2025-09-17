import { Recipe, MealType, DietaryOption, CookingMethod } from '../types';
import { LanguageKey, translations } from "../localization";

// This service now acts as a client to our own API routes,
// which securely handle the Gemini API key on the server-side.

async function handleApiResponse(response: Response, language: LanguageKey, errorKey: keyof typeof translations['en']) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: translations[language][errorKey] }));
    console.error('API Error:', errorData);
    throw new Error(errorData.error || translations[language][errorKey]);
  }
  return response.json();
}

export const generateRecipe = async (
  ingredients: string,
  mealType: MealType,
  dietaryOptions: DietaryOption[],
  cookingMethods: CookingMethod[],
  language: LanguageKey,
  isQuickMeal: boolean
): Promise<Recipe> => {
  const response = await fetch('/api/generate-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, mealType, dietaryOptions, cookingMethods, language, isQuickMeal }),
  });
  return handleApiResponse(response, language, 'errorGeneration');
};

export const generateRecipeImage = async (
  recipeName: string,
  description: string
): Promise<string> => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeName, description }),
  });
  const data = await handleApiResponse(response, 'en', 'errorImageGeneration');
  return data.imageUrl;
};

// Initiates the video generation process and returns the operation object
export const initiateVideoGeneration = async (
  recipeName: string,
  base64ImageDataUrl: string
): Promise<any> => {
    const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeName, base64ImageDataUrl }),
  });
  return handleApiResponse(response, 'en', 'errorVideoGeneration');
};

// Checks the status of an ongoing video generation operation
export const checkVideoStatus = async (operation: any): Promise<any> => {
  const response = await fetch('/api/get-video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation }),
  });
  return handleApiResponse(response, 'en', 'errorVideoGeneration');
};

// Fetches the final video file via our secure proxy
export const getFinalVideo = async (downloadLink: string): Promise<string> => {
    const response = await fetch('/api/get-video-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ downloadLink }),
  });

  if (!response.ok) {
    throw new Error("Failed to download video file.");
  }

  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};


export const generateSocialPost = async (
  recipe: Recipe,
  language: LanguageKey
): Promise<string> => {
  const response = await fetch('/api/generate-social-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe, language }),
  });
  const data = await handleApiResponse(response, language, 'errorSocialPostGeneration');
  return data.post;
};
