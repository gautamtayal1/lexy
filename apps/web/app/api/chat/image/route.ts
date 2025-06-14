import { experimental_generateImage as generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';

const model = openai.image('gpt-image-1');

export async function POST(req: Request) {
  const { image } = await generateImage({
    model: openai.image('gpt-image-1'),
    prompt: 'Santa Claus driving a Cadillac',
  });

  return Response.json(image);
}