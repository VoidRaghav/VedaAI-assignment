import OpenAI from 'openai';
import { AssignmentInput, GeneratedPaper, QuestionType } from '../types';
import https from 'https';
import http from 'http';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  timeout: 60000,
  maxRetries: 3,
  httpAgent: new http.Agent({ keepAlive: true, family: 4 }),
  fetch: (url: any, init: any) => {
    return fetch(url, {
      ...init,
      signal: AbortSignal.timeout(60000)
    });
  }
});

export class AIService {
  async generateQuestions(assignment: AssignmentInput): Promise<GeneratedPaper> {
    const prompt = this.buildPrompt(assignment);
    
    const response = await openrouter.chat.completions.create({
      model: 'deepseek/deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator. Return ONLY valid JSON. Do not include explanation text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const cleanContent = content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanContent);
    return this.validateAndStructure(parsed, assignment);
  }

  private buildPrompt(assignment: AssignmentInput): string {
    const subject = (assignment as any).subject || 'General';
    const classLevel = (assignment as any).class || 'Standard';
    const duration = (assignment as any).duration || '45';
    const instructions = assignment.additionalInstructions || '';
    
    return `Generate ${assignment.totalQuestions} questions for ${subject} subject for class ${classLevel}.
Time allowed: ${duration} minutes.
Total marks: ${assignment.totalMarks}
${instructions ? `Additional instructions: ${instructions}` : ''}

IMPORTANT: Generate questions ONLY related to ${subject} subject appropriate for class ${classLevel} students.
Do NOT use the assignment title for question context.

CRITICAL REQUIREMENT: Every question MUST have an "answer" field. This is mandatory.

Return ONLY this JSON (no explanation):
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Answer all questions",
      "questions": [
        {
          "text": "question text about ${subject}",
          "difficulty": "easy",
          "marks": 2,
          "type": "mcq",
          "answer": "Mitochondria (or the specific correct answer)"
        }
      ]
    }
  ],
  "totalMarks": ${assignment.totalMarks},
  "totalQuestions": ${assignment.totalQuestions}
}

MANDATORY RULES:
1. All questions must be about ${subject} for class ${classLevel}
2. Mix easy/medium/hard difficulty
3. Create 2-3 sections
4. Total marks must equal ${assignment.totalMarks}
5. Total questions must equal ${assignment.totalQuestions}
6. **CRITICAL**: EVERY question MUST include an "answer" field - NO EXCEPTIONS
7. For MCQ: provide the correct option with brief explanation
8. For short answer: provide a concise model answer (2-3 sentences)
9. For long answer: provide key points or a brief model answer
10. Never omit the "answer" field - it is required for the answer key`;
  }

  private validateAndStructure(parsed: any, assignment: AssignmentInput): GeneratedPaper {
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid response structure');
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    const validTypes = ['mcq', 'short', 'long', 'true-false'];

    parsed.sections.forEach((section: any) => {
      if (!section.questions || !Array.isArray(section.questions)) {
        throw new Error('Invalid section structure');
      }

      section.questions.forEach((q: any) => {
        if (!validDifficulties.includes(q.difficulty)) {
          q.difficulty = 'medium';
        }
        if (!validTypes.includes(q.type)) {
          q.type = assignment.questionTypes[0];
        }
      });
    });

    return parsed as GeneratedPaper;
  }
}

export default new AIService();
