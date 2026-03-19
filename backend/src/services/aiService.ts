import OpenAI from 'openai';
import { AssignmentInput, GeneratedPaper, QuestionType } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class AIService {
  async generateQuestions(assignment: AssignmentInput): Promise<GeneratedPaper> {
    const prompt = this.buildPrompt(assignment);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educator creating well-structured question papers. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    return this.validateAndStructure(parsed, assignment);
  }

  private buildPrompt(assignment: AssignmentInput): string {
    const questionTypesList = assignment.questionTypes.join(', ');
    
    return `Create a structured question paper with the following requirements:

Title: ${assignment.title}
${assignment.description ? `Description: ${assignment.description}` : ''}
Total Questions: ${assignment.totalQuestions}
Total Marks: ${assignment.totalMarks}
Question Types: ${questionTypesList}
${assignment.additionalInstructions ? `Additional Instructions: ${assignment.additionalInstructions}` : ''}

Generate a question paper with multiple sections (Section A, Section B, etc.). Distribute questions across difficulty levels (easy, medium, hard) appropriately.

Return ONLY a JSON object with this exact structure:
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "easy|medium|hard",
          "marks": number,
          "type": "mcq|short|long|true-false"
        }
      ]
    }
  ],
  "totalMarks": ${assignment.totalMarks},
  "totalQuestions": ${assignment.totalQuestions}
}

Ensure:
- Total marks sum to exactly ${assignment.totalMarks}
- Total questions equal exactly ${assignment.totalQuestions}
- Mix of difficulty levels
- Questions are relevant to the topic
- Each section has clear instructions`;
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
