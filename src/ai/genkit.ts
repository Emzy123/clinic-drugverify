import {genkit, Plugin} from 'genkit';
import {googleAI, googleSearch} from '@genkit-ai/googleai';

// IMPORTANT: The Google API key is now hardcoded for deployment simplicity.
const GOOGLE_API_KEY = "AIzaSyCH4SB5xKV6gk5zgnW2BODzWbpm2_5qUdM";

let plugins: Plugin<any>[] = [];

// Conditionally enable googleSearch tool only in production (Vercel)
if (process.env.NODE_ENV === 'production') {
  plugins.push(googleAI({apiKey: GOOGLE_API_KEY, tools: [googleSearch]}));
} else {
  // In development, just use the basic AI without the search tool.
  plugins.push(googleAI({apiKey: GOOGLE_API_KEY}));
}

export const ai = genkit({
  plugins: plugins,
  logLevel: 'debug',
});
