import { config } from 'dotenv';
config();

import '@/ai/flows/generate-key-takeaways.ts';
import '@/ai/flows/summarize-with-citations.ts';
import '@/ai/flows/auto-refresh-answers.ts';