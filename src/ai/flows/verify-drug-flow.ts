
'use server';
/**
 * @fileOverview This file defines a Genkit flow for verifying a drug's authenticity
 * by relying on the AI model's general knowledge and web search capabilities.
 *
 * - verifyDrugWithAi - An asynchronous function that takes a drug query and uses
 *   an AI model to get a verification.
 * - VerifyDrugInput - The input type for the verifyDrugWithAi function.
 * - VerifyDrugOutput - The output type for the verifyDrugWithAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const VerifyDrugInputSchema = z.object({
  drugName: z.string().optional().describe("The name of the drug as it appears on the packaging."),
  ndc: z.string().optional().describe("The National Drug Code (NDC) found on the packaging."),
  gtin: z.string().optional().describe("The Global Trade Item Number (GTIN) from the barcode."),
  nafdacNumber: z.string().optional().describe("The NAFDAC registration number found on the packaging."),
});
export type VerifyDrugInput = z.infer<typeof VerifyDrugInputSchema>;

const VerifyDrugOutputSchema = z.object({
  isSuspect: z.boolean().describe('Whether the drug is suspected to be counterfeit, recalled, or otherwise problematic.'),
  reason: z.string().describe('A detailed explanation for the verdict, including the drug\'s identity if found.'),
  drugName: z.string().optional().describe('The identified name of the drug.'),
  manufacturer: z.string().optional().describe('The identified manufacturer of the drug.'),
  approvalInfo: z.string().optional().describe('Approval information, including dates and regulatory bodies (e.g., NAFDAC, FDA).'),
});
export type VerifyDrugOutput = z.infer<typeof VerifyDrugOutputSchema>;

export async function verifyDrugWithAi(input: VerifyDrugInput): Promise<VerifyDrugOutput> {
  return verifyDrugFlow(input);
}

const verificationPrompt = ai.definePrompt({
  name: 'verifyDrugPrompt',
  input: {schema: VerifyDrugInputSchema},
  output: {schema: VerifyDrugOutputSchema},
  prompt: `You are a pharmaceutical verification specialist. Your task is to analyze the provided drug information and determine if it corresponds to a legitimate product.

  ## Your Process:
  1.  **Analyze the Query**: Review the user's input: Drug Name, NAFDAC Number, NDC, or GTIN.
  2.  **Prioritize Authoritative Sources**: Use your search capabilities to consult official regulatory websites (like NAFDAC, FDA) and reputable pharmaceutical databases (like Drugs.com, DailyMed).
  3.  **Synthesize Findings**: Based on your search, identify the drug, its manufacturer, and its approval status.
  4.  **Form a Verdict**:
      - If you find consistent, verifiable information from authoritative sources, mark the drug as **not suspect**.
      - If you cannot find any information, or if the information is inconsistent (e.g., a NAFDAC number belongs to a different drug), you MUST flag it as **suspect**.
  5.  **Deliver the Response**: Provide a clear verdict and a concise reason. Include the details you found (drug name, manufacturer, approval info).

  ## User-Provided Information:
  - Drug Name: {{{drugName}}}
  {{#if ndc}}- NDC Number: {{{ndc}}}{{/if}}
  {{#if gtin}}- GTIN Number (from barcode): {{{gtin}}}{{/if}}
  {{#if nafdacNumber}}- NAFDAC Number: {{{nafdacNumber}}}{{/if}}
  `,
});

const verifyDrugFlow = ai.defineFlow(
  {
    name: 'verifyDrugFlow',
    inputSchema: VerifyDrugInputSchema,
    outputSchema: VerifyDrugOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await verificationPrompt(input);
      if (output) {
        return output;
      }
      throw new Error("The AI model returned an empty or invalid response.");
    } catch (e) {
      console.error("AI verification failed.", e);
      return {
        isSuspect: true,
        reason: "The AI model failed to process the request or returned an invalid response. Please try again or check the system status. This attempt has been logged.",
        drugName: input.drugName || "N/A",
        manufacturer: "N/A",
        approvalInfo: "N/A",
      };
    }
  }
);
