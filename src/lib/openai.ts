import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(text: string) {
  try {
    // Truncate text to avoid token limits
    const truncatedText = text.substring(0, 15000);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert study assistant. Analyze the following text and create a structured summary in JSON format with the following fields:
        - tldr: A brief 5-line summary
        - key_concepts: An array of key concepts (3-7 items)
        - definitions: An array of objects with "term" and "definition" fields for important terms (at least 3-5 terms)
        - bullet_points: An array of bullet points summarizing the main content (5-10 items)
        
        IMPORTANT: Always include all fields. Return ONLY valid JSON, no markdown or additional text.`
        },
        {
          role: 'user',
          content: truncatedText
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error('Summary generation: No content in response');
      return {
        tldr: 'Summary could not be generated.',
        key_concepts: [],
        definitions: [],
        bullet_points: []
      };
    }
    
    const result = JSON.parse(content);
    console.log('Summary generation result:', {
      hasTldr: !!result.tldr,
      keyConceptsCount: result.key_concepts?.length || 0,
      definitionsCount: result.definitions?.length || 0,
      bulletPointsCount: result.bullet_points?.length || 0,
    });
    
    return result;
  } catch (error) {
    console.error('Summary generation failed:', error);
    return {
      tldr: 'Summary could not be generated due to an error.',
      key_concepts: [],
      definitions: [],
      bullet_points: []
    };
  }
}

export async function generateQuiz(text: string, summary: string) {
  try {
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
          content: `Original Text:\n${text.substring(0, 8000)}\n\nSummary:\n${summary}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error('Quiz generation: No content in response');
      return [];
    }
    
    const result = JSON.parse(content);
    const questions = result.questions || [];
    
    if (questions.length === 0) {
      console.error('Quiz generation: No questions generated, raw response:', content);
    }
    
    return questions;
  } catch (error) {
    console.error('Quiz generation failed:', error);
    return [];
  }
}

export async function generateFlashcards(text: string, definitions: Array<{ term: string; definition: string }>, keyConcepts: string[]) {
  try {
    // Create flashcards from definitions
    const definitionCards = (definitions || []).map(def => ({
      front: `What is "${def.term}"?`,
      back: def.definition
    }));

    // Generate additional concept-based flashcards using AI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert flashcard creator. Based on the text and key concepts, create 5-10 flashcards that will help a student learn and retain the material.
        
        Return JSON with a "flashcards" array where each flashcard has:
        - front: A question or prompt (keep it concise)
        - back: The answer or explanation (keep it clear and memorable)
        
        Focus on important facts, relationships, and concepts. Make them Anki-style (short, focused, one concept per card).
        Return ONLY valid JSON.`
        },
        {
          role: 'user',
          content: `Text:\n${text.substring(0, 5000)}\n\nKey Concepts:\n${(keyConcepts || []).join(', ')}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error('Flashcard generation: No content in response');
      return definitionCards;
    }
    
    const result = JSON.parse(content);
    const aiCards = result.flashcards || [];

    // Combine definition cards with AI-generated cards
    const allCards = [...definitionCards, ...aiCards];
    
    if (allCards.length === 0) {
      console.error('Flashcard generation: No flashcards generated');
    }
    
    return allCards;
  } catch (error) {
    console.error('Flashcard generation failed:', error);
    // Return at least the definition cards if AI fails
    return (definitions || []).map(def => ({
      front: `What is "${def.term}"?`,
      back: def.definition
    }));
  }
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
