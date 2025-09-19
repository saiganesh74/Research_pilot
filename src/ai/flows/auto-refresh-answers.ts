'use server';

/**
 * @fileOverview Implements the auto-refresh answers flow, which automatically updates answers when new information is available from connected RSS feeds or blog sources.
 *
 * - autoRefreshAnswers - A function that triggers the auto-refresh process for research insights.
 * - AutoRefreshAnswersInput - The input type for the autoRefreshAnswers function, including the research question and current answer.
 * - AutoRefreshAnswersOutput - The return type for the autoRefreshAnswers function, providing an updated answer if new information is available.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchUpdatedContent } from '@/services/fetch-updated-content';

const AutoRefreshAnswersInputSchema = z.object({
  researchQuestion: z.string().describe('The original research question submitted by the user.'),
  currentAnswer: z.string().describe('The current answer to the research question.'),
  sourceUrls: z.array(z.string()).optional().describe('The URLs of the sources used to generate the current answer.'),
});
export type AutoRefreshAnswersInput = z.infer<typeof AutoRefreshAnswersInputSchema>;

const AutoRefreshAnswersOutputSchema = z.object({
  updatedAnswer: z.string().describe('The updated answer to the research question, if new information is available. If no new information is available, this field should be the same as the current answer.'),
  isUpdated: z.boolean().describe('Indicates whether the answer has been updated with new information.'),
});
export type AutoRefreshAnswersOutput = z.infer<typeof AutoRefreshAnswersOutputSchema>;

export async function autoRefreshAnswers(input: AutoRefreshAnswersInput): Promise<AutoRefreshAnswersOutput> {
  return autoRefreshAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoRefreshAnswersPrompt',
  input: {
    schema: AutoRefreshAnswersInputSchema,
  },
  output: {
    schema: AutoRefreshAnswersOutputSchema,
  },
  prompt: `You are an expert research assistant. Your task is to determine if the current answer to a research question can be improved or updated based on new information from external sources.

  Research Question: {{{researchQuestion}}}
  Current Answer: {{{currentAnswer}}}
  Source URLs: {{#if sourceUrls}}{{#each sourceUrls}}{{{this}}}, {{/each}}{{else}}No source URLs provided.{{/if}}

  New Information: {{{updatedContent}}}

  Based on the new information, assess whether the current answer requires any updates or modifications. If the new information provides additional insights, corrections, or clarifications, generate an updated answer. If the new information is irrelevant or does not significantly impact the current answer, indicate that no update is necessary.

  Provide an updated answer only if it is significantly improved by the new information. If the current answer remains accurate and comprehensive, simply return the current answer.
  Is Updated: {{#if needsUpdate}}true{{else}}false{{/if}}
  Updated Answer: {{#if needsUpdate}}{{{newAnswer}}}{{else}}{{{currentAnswer}}}{{/if}}`,
});

const autoRefreshAnswersFlow = ai.defineFlow(
  {
    name: 'autoRefreshAnswersFlow',
    inputSchema: AutoRefreshAnswersInputSchema,
    outputSchema: AutoRefreshAnswersOutputSchema,
  },
  async input => {
    // Fetch updated content from external sources using the research question.
    const updatedContent = await fetchUpdatedContent(input.researchQuestion, input.sourceUrls || []);

    // Determine if the answer needs to be updated based on the new content using an LLM.
    const llmResponse = await ai.generate({
      model: 'gemini-2.5-flash',
      prompt: `Does the following new information require an update to the current answer to the research question?  If so, provide the updated answer.\n\nResearch Question: ${input.researchQuestion}\nCurrent Answer: ${input.currentAnswer}\nNew Information: ${updatedContent}`,
    });

    const needsUpdate = llmResponse.text.toLowerCase().includes('yes') || llmResponse.text.toLowerCase().includes('updated');
    const newAnswer = needsUpdate ? llmResponse.text : input.currentAnswer;

    const {output} = await prompt({
      ...input,
      updatedContent,
      needsUpdate,
      newAnswer,
    });

    return {
      updatedAnswer: output!.updatedAnswer,
      isUpdated: output!.isUpdated,
    };
  }
);

