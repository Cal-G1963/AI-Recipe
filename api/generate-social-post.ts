import { getAiClient, getGenAITypes } from './_common';
import { Recipe } from '../types';
import { languages, LanguageKey } from '../localization';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), { status: 405 });
  }

  try {
    const { recipe, language }: { recipe: Recipe; language: LanguageKey } = await request.json();
    const { Type } = await getGenAITypes();
    
    const socialPostSchema = {
        type: Type.OBJECT,
        properties: {
          post: { type: Type.STRING, description: 'A single, generic, and versatile social media post with emojis, relevant hashtags, and a placeholder URL.' },
        },
        required: ['post']
    };

    const ai = await getAiClient();

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

    return new Response(JSON.stringify({ post: parsedPost.post }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in generate-social-post API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
