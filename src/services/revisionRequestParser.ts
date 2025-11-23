/**
 * Revision Request Parser
 *
 * Detects and parses REVISION_REQUEST blocks from LLM responses.
 * Used by Veo 3.1 scene-type classifier to ask clarifying questions.
 */

export interface ParsedRevisionRequest {
  isRevisionRequest: boolean;
  questions: string[];
  rawResponse: string;
}

/**
 * Detects if an LLM response contains a REVISION_REQUEST block
 *
 * @param response - The full text response from the LLM.
 * @returns True if a revision request block is detected.
 */
export function containsRevisionRequest(response: string): boolean {
  return response.includes('REVISION_REQUEST:');
}

/**
 * Parses a REVISION_REQUEST block and extracts questions
 *
 * Expected format:
 * ```
 * REVISION_REQUEST:
 *
 * I need a bit more information to optimize this for Veo 3.1. Please answer 1-2 of these:
 *
 * 1. [Question 1]
 * 2. [Question 2]
 * 3. [Question 3]
 * ```
 *
 * @param response - The full text response from the LLM.
 * @returns A ParsedRevisionRequest object containing the extraction results.
 */
export function parseRevisionRequest(response: string): ParsedRevisionRequest {
  if (!containsRevisionRequest(response)) {
    return {
      isRevisionRequest: false,
      questions: [],
      rawResponse: response,
    };
  }

  // Extract the REVISION_REQUEST block
  const revisionRequestMatch = response.match(/REVISION_REQUEST:([\s\S]*?)(?=\n\n[A-Z]|$)/);
  if (!revisionRequestMatch) {
    // Fallback: Take everything after REVISION_REQUEST:
    const fallbackMatch = response.match(/REVISION_REQUEST:([\s\S]*)/);
    if (fallbackMatch) {
      const block = fallbackMatch[1].trim();
      const questions = extractQuestions(block);
      return {
        isRevisionRequest: true,
        questions,
        rawResponse: response,
      };
    }
    return {
      isRevisionRequest: false,
      questions: [],
      rawResponse: response,
    };
  }

  const block = revisionRequestMatch[1].trim();
  const questions = extractQuestions(block);

  return {
    isRevisionRequest: true,
    questions,
    rawResponse: response,
  };
}

/**
 * Extracts numbered questions from a REVISION_REQUEST block
 * Handles formats:
 * - "1. Question text"
 * - "1) Question text"
 * - "1: Question text"
 *
 * @param block - The text block containing questions.
 * @returns An array of extracted question strings.
 */
function extractQuestions(block: string): string[] {
  const lines = block.split('\n');
  const questions: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match patterns: "1. ", "1) ", "1: " at the start
    const questionMatch = trimmed.match(/^(\d+)[.):]\s+(.+)/);
    if (questionMatch) {
      const questionText = questionMatch[2].trim();
      questions.push(questionText);
    }
  }

  return questions;
}

/**
 * Formats user's answers to revision request questions for inclusion in next prompt
 *
 * @param questions - The original questions asked by the AI.
 * @param answers - The user's provided answers.
 * @returns A formatted markdown block string suitable for prompt context.
 */
export function formatAnswersForPrompt(questions: string[], answers: string): string {
  const answersBlock = `
**User's Additional Context:**

${answers.trim()}

**Original Questions:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;

  return answersBlock;
}
