import { getAiClient } from './_common';

export const config = {
  runtime: 'edge',
};

const getBase64Data = (dataUrl: string): string => {
    const parts = dataUrl.split(',');
    if (parts.length === 2) return parts[1];
    if (!dataUrl.includes(',')) return dataUrl;
    throw new Error("Invalid data URL format");
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), { status: 405 });
  }

  try {
    const { recipeName, base64ImageDataUrl } = await request.json();
    const ai = await getAiClient();
    
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

    return new Response(JSON.stringify(operation), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in generate-video API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
