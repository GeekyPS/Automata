import { TextServiceClient } from "@google-ai/generativelanguage/build/src/v1beta2";
import { GoogleAuth } from "google-auth-library";
require("dotenv").config();

async function generateTextWithPalmAPI(field: string): Promise<string> {
    const MODEL_NAME = "models/text-bison-001";
    const API_KEY = process.env.PALM_API_KEY!;

    const PROMPT = `Fill in something Indian for the "${field}" field of google form. just provide the answer. if you don't know the context also, assume something and just give the final plain text answer.`;

    console.log(PROMPT);

    const client = new TextServiceClient({
        authClient: new GoogleAuth().fromAPIKey(API_KEY),
      });
      

  try {

    // Extract the generated text from the API response
    const generatedText = await client.generateText({
        model: MODEL_NAME,
        prompt: {
          text: PROMPT,
        },
      });

    return generatedText?.[0]?.candidates?.[0]?.output || `hello ${field}`;
  } catch (error) {
    console.error('Error generating text with Palm API:', error);
    return `hello ${field}`;
  }
}

export {generateTextWithPalmAPI};