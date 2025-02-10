import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
    const { message } = await req.json();
  
    try {
        const { text } = await generateText({
            model: google('gemini-1.5-flash'), 
            prompt: `Create a list of five open-ended and engaging questions formatted as a single string which are suitable for a conversation with a friend with username=${message}`,
        });

        return new Response(JSON.stringify({ text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error generating text:", error);

        if (error instanceof Error && error.message.includes('quota')) {
            return new Response(JSON.stringify({
                success: false,
                message: 'You have exceeded your current quota. Please check your plan and billing details.'
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            success: false,
            message: 'An error occurred while generating text.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
