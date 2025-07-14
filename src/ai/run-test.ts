// To run this test:
// 1. Make sure you have a .env file in the root of your project with your GOOGLE_API_KEY.
// 2. Run the command: npm run test:ai

import { config } from 'dotenv';
config(); // Load environment variables from .env file

import { verifyDrugWithAi } from './flows/verify-drug-flow';

async function runTest() {
  console.log('🧪 Running AI verification test...');

  // You can change this input to test different scenarios
  const testInput = {
    drugName: 'Tylenol',
    ndc: '50580-491-02'
  };

  console.log('\nINPUT:');
  console.log(JSON.stringify(testInput, null, 2));

  try {
    const result = await verifyDrugWithAi(testInput);
    console.log('\n✅ AI RESPONSE:');
    console.log(JSON.stringify(result, null, 2));

    if (result.isSuspect === false && result.manufacturer) {
        console.log('\nLooks like the AI test was successful! 🎉');
    } else if (result.isSuspect) {
        console.log('\nAI test completed, but the drug was flagged as suspect.');
    } else {
        console.log('\nAI test completed, but the response was inconclusive.');
    }

  } catch (error) {
    console.error('\n❌ AI TEST FAILED:');
    console.error(error);
  }
}

runTest();
