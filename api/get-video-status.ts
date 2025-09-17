import { getAiClient } from './_common';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), { status: 405 });
  }

  try {
    const { operation: receivedOperation } = await request.json();
    const ai = await getAiClient();

    const updatedOperation = await ai.operations.getVideosOperation({ operation: receivedOperation });

    return new Response(JSON.stringify(updatedOperation), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in get-video-status API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
