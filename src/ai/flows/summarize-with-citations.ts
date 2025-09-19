// SummarizeWithCitations Story: As a user, I want the application to generate a concise summary of the research findings, including citations to the original sources, so I can easily reference the information and verify its accuracy.

'use server';

/**
 * @fileOverview Summarizes research findings and includes citations to original sources.
 *
 * - summarizeWithCitations - A function that generates a summary of research findings with citations.
 * - SummarizeWithCitationsInput - The input type for the summarizeWithCitations function.
 * - SummarizeWithCitationsOutput - The return type for the summarizeWithCitations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWithCitationsInputSchema = z.object({
  question: z.string().describe('The research question being asked.'),
  documents: z
    .array(z.string())
    .describe(
      'An array of document content as strings to be analyzed for answering the research question.'
    ),
});
export type SummarizeWithCitationsInput = z.infer<
  typeof SummarizeWithCitationsInputSchema
>;

const SummarizeWithCitationsOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the research findings, including citations to the original sources.'
    ),
  citations: z
    .array(z.string())
    .describe('An array of cited source URLs or document identifiers.'),
});
export type SummarizeWithCitationsOutput = z.infer<
  typeof SummarizeWithCitationsOutputSchema
>;

export async function summarizeWithCitations(
  input: SummarizeWithCitationsInput
): Promise<SummarizeWithCitationsOutput> {
  return summarizeWithCitationsFlow(input);
}

const summarizeWithCitationsPrompt = ai.definePrompt({
  name: 'summarizeWithCitationsPrompt',
  input: {schema: SummarizeWithCitationsInputSchema},
  output: {schema: SummarizeWithCitationsOutputSchema},
  prompt: `You are an expert research assistant. Your task is to provide a concise summary of research findings based on the provided documents, including citations to the original sources. 

  Research Question: {{{question}}}

  Documents:
  {{#each documents}}
  Document {{@index + 1}}: {{{this}}}
  {{/each}}

  Summary:
  Please provide a summary of the research findings, including citations to the original sources where the information was found. Include the URL if available. 
  If a URL is unavailable, cite the document number (e.g., Document 1, Document 2, etc.).

  Citations:
  Please list the cited sources (URLs or document numbers) used in the summary.
  `,
});

const summarizeWithCitationsFlow = ai.defineFlow(
  {
    name: 'summarizeWithCitationsFlow',
    inputSchema: SummarizeWithCitationsInputSchema,
    outputSchema: SummarizeWithCitationsOutputSchema,
  },
  async input => {
    const {output} = await summarizeWithCitationsPrompt(input);
    return output!;
  }
);
