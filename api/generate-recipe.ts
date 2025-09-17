import { getAiClient, getGenAITypes } from './_common';
import { MealType, DietaryOption, CookingMethod } from '../types';
import { languages, LanguageKey } from '../localization';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), { status: 405 });
  }

  try {
    const { 
        ingredients,
        mealType,
        dietaryOptions,
        cookingMethods,
        language,
        isQuickMeal
    }: {
        ingredients: string;
        mealType: MealType;
        dietaryOptions: DietaryOption[];
        cookingMethods: CookingMethod[];
        language: LanguageKey;
        isQuickMeal: boolean;
    } = await request.json();

    const { Type } = await getGenAITypes();

    const recipeSchema = {
        type: Type.OBJECT,
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

    const ai = await getAiClient();

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
    const parsedRecipe = JSON.parse(jsonText);

    return new Response(JSON.stringify(parsedRecipe), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in generate-recipe API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
