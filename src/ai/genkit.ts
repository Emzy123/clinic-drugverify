import {genkit, Plugin} from 'genkit';
import {googleAI, googleSearch} from '@genkit-ai/googleai';

// The GOOGLE_API_KEY is now read from environment variables.
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.log('Missing GOOGLE_API_KEY environment variable.');
}

let plugins: Plugin<any>[] = [];

// Conditionally enable googleSearch tool only in production (Vercel)
if (process.env.NODE_ENV === 'production' && GOOGLE_API_KEY) {
  plugins.push(googleAI({apiKey: GOOGLE_API_KEY, tools: [googleSearch]}));
} else if (GOOGLE_API_KEY) {
  // In development, just use the basic AI without the search tool.
  plugins.push(googleAI({apiKey: GOOGLE_API_KEY}));
}

export const ai = genkit({
  plugins: plugins,
  logLevel: 'debug',
});
