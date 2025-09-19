'use server';

import {
  generateKeyTakeaways,
  type GenerateKeyTakeawaysInput,
  type GenerateKeyTakeawaysOutput,
} from '@/ai/flows/generate-key-takeaways';

import {
  autoRefreshAnswers,
  type AutoRefreshAnswersInput,
  type AutoRefreshAnswersOutput,
} from '@/ai/flows/auto-refresh-answers';

interface ActionResult<T> {
  data?: T;
  error?: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

export async function handleResearchRequest(
  formData: FormData
): Promise<ActionResult<GenerateKeyTakeawaysOutput>> {
  try {
    const question = formData.get('question') as string;
    const files = formData.getAll('files') as File[];

    if (!question || question.length < 10) {
      return { error: 'Please provide a more detailed research question.' };
    }
    if (files.length === 0) {
      return { error: 'Please upload at least one document.' };
    }

    const documents: GenerateKeyTakeawaysInput['documents'] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return { error: `File "${file.name}" exceeds the 20MB size limit.` };
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return { error: `File "${file.name}" is not a supported type. Please upload PDFs.` };
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      documents.push({
        filename: file.name,
        dataUri: dataUri,
      });
    }

    const input: GenerateKeyTakeawaysInput = {
      question,
      documents,
    };

    const result = await generateKeyTakeaways(input);
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || 'An unexpected error occurred while generating the report.' };
  }
}


export async function handleRefresh(
  researchQuestion: string,
  currentAnswer: string,
  sourceUrls: string[]
): Promise<ActionResult<AutoRefreshAnswersOutput>> {
   try {
    const input: AutoRefreshAnswersInput = {
      researchQuestion,
      currentAnswer,
      sourceUrls,
    };

    const result = await autoRefreshAnswers(input);
    return { data: result };
   } catch (e: any) {
     console.error(e);
     return { error: e.message || 'An unexpected error occurred while refreshing the report.' };
   }
}
