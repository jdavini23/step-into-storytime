import { type NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        prompt,
        system:
          "You are a creative children's story writer who specializes in magical, engaging bedtime stories with positive messages.",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return NextResponse.json({ content: text });
    } catch (error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Story generation timed out. Please try again.' },
          { status: 408 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate story' },
      { status: 500 }
    );
  }
}
