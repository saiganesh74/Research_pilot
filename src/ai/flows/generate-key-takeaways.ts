// src/ai/flows/generate-key-takeaways.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating key takeaways from research documents and web sources.
 *
 * - generateKeyTakeaways - An async function that orchestrates the key takeaway generation process.
 * - GenerateKeyTakeawaysInput - The input type for the generateKeyTakeaways function.
 * - GenerateKeyTakeawaysOutput - The output type for the generateKeyTakeaways function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateKeyTakeawaysInputSchema = z.object({
  question: z.string().describe('The research question being asked.'),
  documents: z
    .array(
      z.object({
        filename: z.string().describe('The name of the document.'),
        dataUri: z
          .string()
          .describe(
            "The document's data, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
          ),
      })
    )
    .describe('A list of research documents to analyze.'),
  webSources: z
    .array(z.string())
    .optional()
    .describe('A list of URLs of web sources to analyze.'),
});

export type GenerateKeyTakeawaysInput = z.infer<
  typeof GenerateKeyTakeawaysInputSchema
>;

const GenerateKeyTakeawaysOutputSchema = z.object({
  keyTakeaways: z
    .array(z.string())
    .describe('A list of key takeaways extracted from the documents and web sources.'),
  summary: z.string().describe('A concise summary of the findings.'),
  sources: z
    .array(z.string())
    .describe('A list of source links used for the report generation.'),
});

export type GenerateKeyTakeawaysOutput = z.infer<
  typeof GenerateKeyTakeawaysOutputSchema
>;

// This is an internal schema, not exported.
const AnalyzeDocumentsInputSchema = z.object({
  question: z.string(),
  documents: z.array(z.object({
    filename: z.string(),
    content: z.string(),
  })),
  webSources: z.array(z.string()).optional(),
});


const extractTextFromDocument = ai.defineTool({
  name: 'extractTextFromDocument',
  description: 'Extracts text content from a document provided as a data URI.',
  inputSchema: z.object({
    dataUri: z
      .string()
      .describe(
        "The document's data URI, including MIME type and Base64 encoding."
      ),
  }),
  outputSchema: z.string().describe('The extracted text content.'),
}, async (input) => {
  // TODO: Implement document parsing logic here.
  // For now, just return a placeholder.  This will need to be
  // replaced with real PDF parsing logic.  PDF parsing can be done in
  // Typescript using a library like PDF.js.
  //
  // For simplicity, we are _mocking_ the result
  console.log('MOCK: Extracting text from document', input.dataUri);
  return `MOCK EXTRACTED TEXT FROM ${input.dataUri.substring(0, 50)}...`;
});

const analyzeDocumentsPrompt = ai.definePrompt({
  name: 'analyzeDocumentsPrompt',
  input: {schema: AnalyzeDocumentsInputSchema},
  output: {schema: GenerateKeyTakeawaysOutputSchema},
  prompt: `You are a research assistant tasked with analyzing documents and web sources to answer a research question.

  Research Question: {{{question}}}

  Documents:
  {{#each documents}}
    - Filename: {{this.filename}}
      Content: {{{this.content}}}
  {{/each}}

  Web Sources:
  {{#if webSources}}
    {{#each webSources}}
      - {{this}}
    {{/each}}
  {{else}}
    No web sources provided.
  {{/if}}

  Generate a list of key takeaways, a concise summary of the findings, and a list of source links used for the report generation.

  Please provide the output in JSON format.
  `,
});

export async function generateKeyTakeaways(
  input: GenerateKeyTakeawaysInput
): Promise<GenerateKeyTakeawaysOutput> {
  return generateKeyTakeawaysFlow(input);
}

const generateKeyTakeawaysFlow = ai.defineFlow(
  {
    name: 'generateKeyTakeawaysFlow',
    inputSchema: GenerateKeyTakeawaysInputSchema,
    outputSchema: GenerateKeyTakeawaysOutputSchema,
  },
  async input => {
    // Step 1: Extract text from all documents in parallel.
    const extractedDocuments = await Promise.all(
      input.documents.map(async (doc) => {
        const content = await extractTextFromDocument({ dataUri: doc.dataUri });
        return {
          filename: doc.filename,
          content: content,
        };
      })
    );

    // Step 2: Call the prompt with the extracted text.
    const {output} = await analyzeDocumentsPrompt({
      question: input.question,
      documents: extractedDocuments,
      webSources: input.webSources,
    });
    return output!;
  }
);
