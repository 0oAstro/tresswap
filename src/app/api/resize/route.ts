import { Client } from "@gradio/client";
import { NextRequest, NextResponse } from "next/server";

// Define proper types for Gradio API responses
interface GradioImageResponse {
  data: Array<{
    url?: string;
    value?: {
      url: string;
    };
  }>;
}

// Create client once instead of for each request
let clientPromise: Promise<Client> | null = null;

const MOCK_ENABLED = process.env.MOCK_ENABLED === "true";

// Get or create the HairFastGAN client
const getClient = async () => {
  if (!clientPromise) {
    clientPromise = Client.connect("AIRI-Institute/HairFastGAN");
  }
  return clientPromise;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (MOCK_ENABLED) {
      console.log("using mock result for hairswap");
      return new NextResponse(image, {
        headers: {
          "Content-Type": image.type,
          "Content-Length": image.size.toString(),
        },
      });
    }

    if (!image) {
      return NextResponse.json(
        { error: "No image provided", success: false },
        { status: 400 }
      );
    }

    console.log("Connecting to HairFastGAN API for resizing...");

    // Get the client (reuses existing connection)
    const client = await getClient();

    // Call the resize_inner endpoint
    console.log("Resizing image...");
    const resizeResult = (await client.predict("/resize_inner", {
      img: image,
      align: ["Face", "Shape", "Color"],
    })) as GradioImageResponse;

    if (!resizeResult?.data?.[0]?.url) {
      throw new Error("Failed to resize image");
    }

    const resizedUrl = resizeResult.data[0].url;

    // Fetch the resized image and return it as a blob
    const resizedResponse = await fetch(resizedUrl);
    const resizedBlob = await resizedResponse.blob();

    // Return the resized image
    return new NextResponse(resizedBlob, {
      headers: {
        "Content-Type": resizedBlob.type,
        "Content-Length": resizedBlob.size.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error resizing image:", error);

    // User-friendly error message
    let errorMessage = "Error resizing image";
    if ((error as Error).message) {
      errorMessage = (error as Error).message;

      // Clean up common error messages
      if (errorMessage.includes("Unexpected token '<'")) {
        errorMessage =
          "The HairFastGAN service is currently unavailable. Please try again later.";
      } else if (errorMessage.includes("ECONNRESET")) {
        errorMessage =
          "Connection to the AI service was reset. The service might be overloaded.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "The request timed out. The AI service might be busy.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: (error as Error).message || "Unknown error",
        success: false,
      },
      { status: 503 }
    );
  }
}
