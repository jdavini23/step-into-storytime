import { createParser, type EventSourceMessage } from 'eventsource-parser';
import OpenAI from 'openai';

export interface OpenAIStreamPayload {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  stream?: boolean;
  n?: number;
}

export async function OpenAIStream(
  response: AsyncIterable<OpenAI.Chat.ChatCompletionChunk>
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.choices[0]?.delta?.content || '';
        const queue = encoder.encode(text);
        controller.enqueue(queue);
      }
      controller.close();
    },
  });

  return stream;
}

export class StreamingTextResponse extends Response {
  constructor(body: ReadableStream, init?: ResponseInit) {
    super(body, {
      ...init,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...init?.headers,
      },
    });
  }
}
