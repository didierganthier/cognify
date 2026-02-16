import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(text: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert study assistant. Analyze the following text and create a structured summary in JSON format with the following fields:
        - tldr: A brief 5-line summary
        - key_concepts: An array of key concepts (3-7 items)
        - definitions: An array of objects with "term" and "definition" fields for important terms
        - bullet_points: An array of bullet points summarizing the main content (5-10 items)
        
        Return ONLY valid JSON, no markdown or additional text.`
      },
      {
        role: 'user',
        content: text
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generateQuiz(text: string, summary: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert quiz generator. Based on the text and summary provided, create 5 multiple choice questions to test understanding.
        
        Return JSON with a "questions" array where each question has:
        - question: the question text
        - options: array of 4 possible answers
        - correct_answer: index (0-3) of the correct option
        - explanation: brief explanation of why the answer is correct
        
        Make questions varied in difficulty. Return ONLY valid JSON.`
      },
      {
        role: 'user',
        content: `Original Text:\n${text}\n\nSummary:\n${summary}`
      }
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1500,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  // Return the questions array directly
  return result.questions || [];
}

export async function generateAudio(text: string): Promise<Buffer> {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
