import { NextRequest, NextResponse } from "next/server";
import {
  GenerationConfig,
  GoogleGenerativeAI,
  SchemaType,
} from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");
const fileManager = new GoogleAIFileManager(apiKey || "");

const schema = {
  type: SchemaType.OBJECT,
  properties: {
    comment: {
      type: SchemaType.STRING,
      description: "A positive and constructive comment about the hairstyle",
      nullable: false,
    },
  },
  required: ["comment"],
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    // @ts-ignore // TODO: Figure out how to fix this
    responseSchema: schema,
  },
});

/**
 * Uploads the given file to Gemini.
 */
async function uploadToGemini(
  buffer: Buffer,
  mimeType: string,
  filename: string
) {
  // Save buffer to temporary file
  const tempDir = os.tmpdir();
  const filePath = path.join(tempDir, filename);

  fs.writeFileSync(filePath, buffer);

  try {
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: filename,
    });
    const file = uploadResult.file;
    return file;
  } finally {
    // Clean up temp file after upload
    fs.unlinkSync(filePath);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || typeof image === "string") {
      return NextResponse.json(
        { error: "No valid image provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await image.arrayBuffer());
    const filename = `hairstyle_${Date.now()}.jpg`;
    const mimeType = image.type || "image/jpeg";

    // Upload to Gemini
    const file = await uploadToGemini(buffer, mimeType, filename);

    // Create chat session with history
    const chatSession = model.startChat({
      history: [],
    });

    // Send message with file
    const result = await chatSession.sendMessage([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
      {
        text: "Give brutally honest feedback about this hairstyle. Don't sugarcoat anything - if it looks bad, say why. Be direct and specific about what's wrong with it and what needs to be changed.",
      },
    ]);

    // Extract JSON response
    const responseText = result.response.text();
    let responseData;

    try {
      // Try to parse the response text as JSON
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.log("Failed to parse JSON response directly:", e);

      // Look for a JSON object in the text
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          responseData = JSON.parse(jsonMatch[0]);
        } catch (jsonError) {
          console.log("Failed to parse extracted JSON:", jsonError);
          responseData = { comment: responseText.trim() };
        }
      } else {
        // Use the plain text as a comment if no JSON is found
        responseData = { comment: responseText.trim() };
      }
    }

    return NextResponse.json({
      analysis: responseData.comment || "This hairstyle looks great on you!",
    });
  } catch (error) {
    console.error("Error analyzing hairstyle:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze hairstyle",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
