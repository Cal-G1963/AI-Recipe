// This is a Vercel Edge function. It uses the standard Web Fetch API.
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests are allowed' }), { status: 405 });
  }

  try {
    const { downloadLink } = await request.json();
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API_KEY environment variable not set.' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!downloadLink) {
      return new Response(JSON.stringify({ error: 'downloadLink is required.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);

    if (!videoResponse.ok || !videoResponse.body) {
        const errorBody = await videoResponse.text();
        console.error("Error downloading video from Gemini:", errorBody);
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    // Create a streaming response for the Edge runtime
    const { readable, writable } = new TransformStream();
    videoResponse.body.pipeTo(writable);

    return new Response(readable, {
        headers: { 'Content-Type': 'video/mp4' },
    });

  } catch (error) {
    console.error("Error in get-video-file API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
