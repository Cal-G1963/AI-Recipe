// This helper function initializes the Gemini AI client by dynamically importing
// the module from the CDN. It's designed to work in a package.json-less environment.
// It should only be used in server-side code (Vercel Edge Functions).

// Using a reliable CDN (jsdelivr) to fetch the ES module.
const genaiModulePromise = import('https://cdn.jsdelivr.net/npm/@google/genai@0.14.0/+esm');

export async function getAiClient() {
    const { GoogleGenAI } = await genaiModulePromise;
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // This error will be caught by the serverless function's error handling
      // and a proper JSON response will be sent to the client.
      throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey });
}

export async function getGenAITypes() {
    const { Type } = await genaiModulePromise;
    return { Type };
}