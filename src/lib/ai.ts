import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI API
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || ""
);

/**
 * Generate a creative and poetic description of a hair transformation
 * @param {string} originalImageDescription - Description of the original hair
 * @param {string} newStyleDescription - Description of the new hairstyle
 * @returns {Promise<string>} A poetic description of the transformation
 */
export async function generatePoetryForHairTransformation(
  originalImageDescription: string = "natural hair",
  newStyleDescription: string = "new hairstyle"
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Write a short, fun, and poetic description (max 3 sentences) about a person who transformed their ${originalImageDescription} into a ${newStyleDescription}. 
    Make it cheerful, vibrant, and slightly over-the-top, like you're really excited about this transformation! 
    Use emoji and fun punctuation. Be creative but concise. Don't use quotation marks or formatting - just the text itself.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Error generating AI poetry:", error);
    return `✨ Absolutely stunning transformation from ${originalImageDescription} to a brilliant ${newStyleDescription}! Your new look is going to turn heads! ✨`;
  }
}

export async function generateCritiqueForHairTransformation(
  imagePath: string,
  message: string = "Please provide a critical appreciation and constructive feedback on this hair transformation, highlighting both its strengths and areas for improvement."
): Promise<string> {
  try {
    const {
      GoogleGenerativeAI,
      GoogleAIFileManager,
    } = require("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);

    // Upload the image file to Gemini
    const uploadResult = await fileManager.uploadFile(imagePath, {
      mimeType: "image/webp",
      displayName: imagePath,
    });
    const file = uploadResult.file;
    console.log(`Uploaded file ${file.displayName} as: ${file.name}`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri,
              },
            },
          ],
        },
      ],
    });

    const result = await chatSession.sendMessage(message);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating AI critique:", error);
    return "Could not generate a critique. Please try again later.";
  }
}
