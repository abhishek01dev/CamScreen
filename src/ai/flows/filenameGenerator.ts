
'use server';
/**
 * @fileOverview Generates a filename for a screen recording.
 *
 * - generateFilename - A function that suggests a filename based on an optional topic.
 * - GenerateFilenameInput - The input type for the generateFilename function.
 * - GenerateFilenameOutput - The return type for the generateFilename function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFilenameInputSchema = z.object({
  topic: z.string().optional().describe('An optional topic or short description of the recording.'),
});
export type GenerateFilenameInput = z.infer<typeof GenerateFilenameInputSchema>;

const GenerateFilenameOutputSchema = z.object({
  filename: z.string().describe('The suggested .webm filename.'),
});
export type GenerateFilenameOutput = z.infer<typeof GenerateFilenameOutputSchema>;

export async function generateFilename(input: GenerateFilenameInput): Promise<string> {
  const result = await filenameSuggestionFlow(input);
  return result.filename;
}

const FilenameBasePromptInputSchema = z.object({
  topic: z.string().describe('The topic of the recording.'),
});

const FilenameBasePromptOutputSchema = z.object({
  baseFilename: z.string().describe('A concise, web-safe (kebab-case, lowercase) base for a filename, without date or extension.'),
});

const FilenameBasePrompt = ai.definePrompt({
  name: 'filenameBaseSuggestionPrompt',
  input: { schema: FilenameBasePromptInputSchema },
  output: { schema: FilenameBasePromptOutputSchema },
  prompt: `You are an expert filename creator.
Given a topic for a screen recording, generate a concise, web-safe (kebab-case, lowercase, no special characters other than hyphens) base for a filename.
Do NOT include any dates, timestamps, or file extensions. Just the descriptive part.
Example for topic "User Login Bug": user-login-bug
Example for topic "My new feature demo": my-new-feature-demo

Topic: {{{topic}}}

Generate the base filename.
`,
});

const filenameSuggestionFlow = ai.defineFlow(
  {
    name: 'filenameSuggestionFlow',
    inputSchema: GenerateFilenameInputSchema,
    outputSchema: GenerateFilenameOutputSchema,
  },
  async (input) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDateSuffix = `${year}${month}${day}`;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const currentTimestampSuffix = `${hours}${minutes}${seconds}`;

    const topic = input.topic?.trim().toLowerCase();
    const genericTopics = ["recording", "test", ""];

    if (!topic || genericTopics.includes(topic)) {
      return { filename: `recording-${currentDateSuffix}-${currentTimestampSuffix}.webm` };
    }

    try {
      const { output } = await FilenameBasePrompt({ topic: input.topic! });
      
      if (!output?.baseFilename) {
        throw new Error("LLM returned empty base filename.");
      }

      let base = output.baseFilename
        .toLowerCase()
        .replace(/\s+/g, '-') 
        .replace(/[^a-z0-9-]/g, ''); 
      base = base.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

      if (!base) { 
           const sanitizedTopicFallback = input.topic!.replace(/[^a-z0-9-]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '');
           const topicBase = sanitizedTopicFallback || "generic";
           return { filename: `${topicBase}-${currentDateSuffix}.webm` };
      }
      return { filename: `${base}-${currentDateSuffix}.webm` };

    } catch (e) {
      console.error("Filename generation LLM call failed. Using fallback based on topic.", e);
      const sanitizedTopic = input.topic!.replace(/[^a-z0-9-]/gi, '-').toLowerCase().replace(/-+/g, '-').replace(/^-+|-+$/g, '');
      const fallbackBase = sanitizedTopic || "recording";
      return { filename: `${fallbackBase}-${currentDateSuffix}-${currentTimestampSuffix}.webm` };
    }
  }
);
