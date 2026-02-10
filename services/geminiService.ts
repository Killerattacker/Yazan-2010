import { GoogleGenAI, Type } from '@google/genai';
import { QuizQuestion, LocalizedText } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const getAIClient = () => {
  if (!API_KEY) {
    console.warn('Missing VITE_GEMINI_API_KEY. Gemini features will be disabled.');
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

const l = (ar: string, en = ''): LocalizedText => ({ ar, en });

export const generateFullCourseData = async (topic: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `\u0623\u0646\u0634\u0626 \u0645\u062D\u062A\u0648\u0649 \u062A\u0639\u0644\u064A\u0645\u064A\u0627\u064B \u0634\u0627\u0645\u0644\u0627\u064B \u0644\u0645\u0648\u0636\u0648\u0639: ${topic}.
\u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0646 \u0627\u0644\u0631\u062F:
1. \u0648\u0635\u0641 \u0639\u0627\u0645 \u062F\u0642\u064A\u0642 (content)
2. \u062A\u0627\u0631\u064A\u062E \u0647\u0630\u0627 \u0627\u0644\u0639\u0644\u0645 \u0623\u0648 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0628\u0634\u0643\u0644 \u0645\u0641\u0635\u0644 (history)
3. \u0623\u0647\u0645 3 \u0639\u0644\u0645\u0627\u0621 \u0633\u0627\u0647\u0645\u0648\u0627 \u0641\u064A\u0647 (scientists) \u0645\u0639 (\u0627\u0644\u0627\u0633\u0645 name\u060C \u0627\u0644\u0633\u064A\u0631\u0629 bio\u060C \u0648\u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u0627\u0641\u062A\u0631\u0627\u0636\u064A image \u0645\u0646 Unsplash \u064A\u0639\u0628\u0631 \u0639\u0646 \u0627\u0644\u0639\u0627\u0644\u0645 \u0623\u0648 \u062A\u062E\u0635\u0635\u0647).
4. 5 \u062D\u0642\u0627\u0626\u0642 \u0645\u0630\u0647\u0644\u0629 \u0648\u0642\u0635\u064A\u0631\u0629 (facts)
\u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0628\u0635\u064A\u063A\u0629 JSON.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          history: { type: Type.STRING },
          scientists: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                bio: { type: Type.STRING },
                image: { type: Type.STRING }
              },
              required: ['name', 'bio', 'image']
            }
          },
          facts: { type: Type.STRING }
        },
        required: ['content', 'history', 'scientists', 'facts']
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateCourseImage = async (prompt: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Create a high-quality educational 3D illustration or creative visual for the topic: ${prompt}. Clean, professional, and vibrant colors.`
        }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: '1:1'
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `\u0623\u0646\u0634\u0626 \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u064B \u0645\u0646 4 \u0623\u0633\u0626\u0644\u0629 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F \u062D\u0648\u0644: ${topic}.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER, description: 'Index of correct option (0-3)' }
          },
          required: ['question', 'options', 'correctAnswer']
        }
      }
    }
  });

  const raw = JSON.parse(response.text || '[]') as { question: string; options: string[]; correctAnswer: number }[];
  return raw.map(item => ({
    question: l(item.question),
    options: item.options.map(opt => l(opt)),
    correctAnswer: item.correctAnswer
  }));
};