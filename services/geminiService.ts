import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, MealType, DietaryOption, CookingMethod } from '../types';
import { LanguageKey, languages, translations } from "../localization";

// This is the correct, client-side implementation.
// It uses the VITE_API_KEY that you configured in your Vercel settings.
const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
  throw new Error("VITE_API_KEY environment variable not set. Please check your Vercel project settings.");
}

const ai = new GoogleGenAI({ apiKey });

const getBase64Data = (dataUrl: string): string => {
    const parts = dataUrl.split(',');
    if (parts.length === 2) return parts[1];
    if (!dataUrl.includes(',')) return dataUrl;
    throw new Error("Invalid data URL format");
};


export const generateRecipe = async (
  ingredients: string,
  mealType: MealType,
  dietaryOptions: DietaryOption[],
  cookingMethods: CookingMethod[],
  language: LanguageKey,
  isQuickMeal: boolean
): Promise<Recipe> => {
    
    const recipeSchema = {        type: Type.OBJECT,
        properties: {
          recipeName: { type: Type.STRING, description: 'Creative and appealing title for the recipe.' },
          description: { type: Type.STRING, description: 'A brief, enticing description of the dish.' },
          prepTime: { type: Type.STRING, description: 'Estimated preparation time, e.g., "15 minutes".' },
          cookTime: { type: Type.STRING, description: 'Estimated cooking time, e.g., "30 minutes".' },
          servings: { type: Type.STRING, description: 'Number of servings the recipe makes, e.g., "4 servings".' },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'List of all required ingredients with quantities, including those provided and any additional ones needed.'
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Step-by-step instructions for preparing the dish.'
          },
          nutrition: {
            type: Type.OBJECT,
            description: 'Estimated nutritional information per serving.',
            properties: {
              calories: { type: Type.STRING, description: 'Estimated calories per serving, e.g., "350 kcal".' },
              protein: { type: Type.STRING, description: 'Estimated protein per serving, e.g., "30g".' },
              carbs: { type: Type.STRING, description: 'Estimated carbohydrates per serving, e.g., "25g".' },
              fat: { type: Type.STRING, description: 'Estimated fat per serving, e.g., "15g".' },
              glycemicIndex: { type: Type.STRING, description: 'Estimated Glycemic Index of the dish (e.g., "Low", "Medium", "High", or a numeric value).' }
            },
            required: ['calories', 'protein', 'carbs', 'fat']
          }
        },
        required: ['recipeName', 'description', 'prepTime', 'cookTime', 'servings', 'ingredients', 'instructions', 'nutrition']
      };
      
    const dietaryPreferences = dietaryOptions.length > 0 ? `It should also adhere to the following dietary restrictions: ${dietaryOptions.join(', ')}.` : '';
    const mealTypePreference = mealType !== MealType.ANY ? `The recipe should be for ${mealType.toLowerCase()}.` : '';
    const cookingMethodPreference = cookingMethods.length > 0
      ? `The recipe must be suitable for someone who only has the following equipment available: ${cookingMethods.join(', ')}. Please do not suggest recipes requiring equipment that is not on this list (for example, if 'Oven' is not listed, do not suggest a baking recipe).`
      : '';
    const quickMealPreference = isQuickMeal
      ? 'The combined preparation and cooking time for the recipe MUST be 30 minutes or less. Prioritize quick and easy recipes.'
      : '';
    const languageName = languages[language];
  
    const systemInstruction = `You are an expert chef who creates simple, delicious, and easy-to-follow recipes. Your primary function is to respond in the user's specified language.`;
    
    const userPrompt = `
      IMPORTANT: You must generate the entire recipe response strictly in the ${languageName} language. Every single field in the JSON output (recipeName, description, ingredients, instructions, nutrition fields, etc.) must be in ${languageName}.
  
      When specifying temperatures, you MUST use the degree symbol '°' (Unicode U+00B0). For example: "Preheat oven to 350°F (175°C)". Do not use any other character to represent degrees.
  
      Based on the following available ingredients: "${ingredients}", generate a single recipe.
  
      ${quickMealPreference}
      ${mealTypePreference}
      ${dietaryPreferences}
      ${cookingMethodPreference}
  
      Please provide a complete recipe. If the provided ingredients are insufficient, you can add a few common pantry staples (like oil, salt, pepper, flour, sugar, etc.) to make a complete dish.
      
      Also include an estimated nutritional breakdown per serving (calories, protein, carbs, fat, and Glycemic Index).
  
      The tone should be encouraging and friendly.
      Ensure the output is a valid JSON object that strictly follows the provided schema.
  
      Final reminder: The entire JSON response and all its text content must be in ${languageName}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: recipeSchema,
            },
        });
      
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating recipe:", error);
        throw new Error(translations[language]['errorGeneration']);
    }
};

export const generateRecipeImage = async (recipeName: string, description: string): Promise<string> => {
    try {
        const prompt = `Food photography of "${recipeName}", delicious, appetizing, high detail, vibrant colors.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
          const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
          return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
          throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error(translations['en']['errorImageGeneration']);
    }
};

export const initiateVideoGeneration = async (recipeName: string, base64ImageDataUrl: string): Promise<any> => {
    try {
        const imageBytes = getBase64Data(base64ImageDataUrl);
        const prompt = `Generate a short, visually appealing video of the dish '${recipeName}' from the image provided. The video should be dynamic and appetizing, showcasing the dish in a flattering way.`;

        const operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt: prompt,
          image: {
            imageBytes: imageBytes,
            mimeType: 'image/jpeg',
          },
          config: {
            numberOfVideos: 1
          }
        });
        return operation;
    } catch (error) {
        console.error("Error initiating video generation:", error);
        throw new Error(translations['en']['errorVideoGeneration']);
    }
};

export const checkVideoStatus = async (operation: any): Promise<any> => {
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error checking video status:", error);
        throw new Error(translations['en']['errorVideoGeneration']);
    }
};

export const getFinalVideo = async (downloadLink: string): Promise<string> => {
    try {
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);

        if (!videoResponse.ok || !videoResponse.body) {
            const errorBody = await videoResponse.text();
            console.error("Error downloading video from Gemini:", errorBody);
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Error getting final video file:", error);
        throw new Error(translations['en']['errorVideoGeneration']);
    }
};

export const generateSocialPost = async (recipe: Recipe, language: LanguageKey): Promise<string> => {
    const socialPostSchema = {
        type: Type.OBJECT,
        properties: {
          post: { type: Type.STRING, description: 'A single, generic, and versatile social media post with emojis, relevant hashtags, and a placeholder URL.' },
        },
        required: ['post']
    };
    
    const languageName = languages[language];
    const systemInstruction = `You are a social media marketing expert specializing in food content. You must respond ONLY in the ${languageName} language. The tone should be fun, enthusiastic, and appetizing.`;
    const userPrompt = `
      IMPORTANT: You must generate the entire response strictly in the ${languageName} language. The JSON field must be in ${languageName}.
      Generate one engaging, generic social media post for a recipe called "${recipe.recipeName}".
      Recipe Description: ${recipe.description}
      The post should be versatile enough for any platform.
      - Use relevant emojis and hashtags (e.g., #Recipe #Foodie #${recipe.recipeName.replace(/\s/g, '')}).
      - At the end of the post, you MUST include the following placeholder URL: https://your-recipe-website.com
      - Ensure the output is a valid JSON object that strictly follows the provided schema. Do not add any extra text or explanations outside of the JSON object.
      Final reminder: The entire JSON output and its text content must be in ${languageName}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: socialPostSchema,
            },
        });
    
        const jsonText = response.text.trim();
        const parsedPost = JSON.parse(jsonText);
    
        if (!parsedPost.post || typeof parsedPost.post !== 'string') {
            throw new Error("Received an invalid social post format from the API.");
        }
        return parsedPost.post;
    } catch (error) {
        console.error("Error generating social post:", error);
        throw new Error(translations[language]['errorSocialPostGeneration']);
    }
};
