import { type NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from '@/lib/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: 'Missing story title' },
        { status: 400 }
      );
    }

    if (!body.mainCharacter?.name) {
      return NextResponse.json(
        { error: 'Missing main character name' },
        { status: 400 }
      );
    }

    if (!body.setting) {
      return NextResponse.json(
        { error: 'Missing story setting' },
        { status: 400 }
      );
    }

    if (!body.theme) {
      return NextResponse.json(
        { error: 'Missing story theme' },
        { status: 400 }
      );
    }

    // Create prompt for AI
    const prompt = `
      Create a children's bedtime story with the following elements:
      
      Title: ${body.title}
      Main Character: ${body.mainCharacter.name}, who is ${
      body.mainCharacter.age || 'young'
    } and is ${body.mainCharacter.traits?.join(', ') || 'adventurous'}
      Setting: ${body.setting}
      Theme: ${body.theme}
      Plot Elements: ${body.plotElements ? body.plotElements.join(', ') : ''}
      
      The story should be written in markdown format with # for the title and appropriate paragraph breaks.
      Make it engaging, age-appropriate, and with a positive message.
      The story should be about 500-800 words long.
    `;

    // Generate story using AI with timeout handling
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 30000)
      );

      const storyPromise = openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              "You are a creative children's story writer who specializes in magical, engaging bedtime stories with positive messages.",
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
      });

      const response = await Promise.race([storyPromise, timeoutPromise]);
      const stream = await OpenAIStream(
        response as AsyncIterable<OpenAI.Chat.ChatCompletionChunk>
      );
      return new StreamingTextResponse(stream);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'Timeout') {
          return NextResponse.json(
            { error: 'Story generation timed out. Please try again.' },
            { status: 408 }
          );
        }
        console.error('Error generating story:', error.message);
        return NextResponse.json(
          { error: error.message || 'Failed to generate story' },
          { status: 500 }
        );
      }
      console.error('Unknown error generating story');
      return NextResponse.json(
        { error: 'Failed to generate story' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: (error as any).message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
