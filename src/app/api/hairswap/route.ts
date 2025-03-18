import { Client } from "@gradio/client";
import { NextRequest, NextResponse } from "next/server";

const MOCK_ENABLED = false;

// Define proper types for Gradio API responses
interface GradioImageResponse {
  data: Array<{
    url?: string;
    value?: {
      url: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const faceImage = formData.get("faceImage") as File;
    const shapeImage = formData.get("shapeImage") as File | null;
    const colorImage = formData.get("colorImage") as File | null;
    const blendingMode = (formData.get("blendingMode") as string) || "Article";
    const poissonIters = parseInt(
      (formData.get("poissonIters") as string) || "0",
      10
    );
    const poissonErosion = parseInt(
      (formData.get("poissonErosion") as string) || "15",
      10
    );

    // Validate inputs
    if (!faceImage) {
      return NextResponse.json(
        { error: "Face image is required", success: false },
        { status: 400 }
      );
    }

    // Require either shape or color image
    if (!shapeImage && !colorImage) {
      return NextResponse.json(
        {
          error: "Either a hairstyle or color reference is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Use mock result for development/testing
    if (MOCK_ENABLED) {
      console.log("Using mock result for hairswap");

      // Add artificial delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return NextResponse.json({
        url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=870&auto=format&fit=crop",
        success: true,
      });
    }

    console.log("Connecting to HairFastGAN API...");

    // Connect to the API without token
    const client = await Client.connect("AIRI-Institute/HairFastGAN");
    console.log("Successfully connected to API");

    // Skip resizing since images are already pre-resized from the client-side
    console.log("Using pre-resized images from client");

    // Call the swap_hair endpoint directly with the provided images
    console.log("Calling swap_hair with provided images...");
    const swapResult = (await client.predict("/swap_hair", {
      face: faceImage,
      shape: shapeImage,
      color: colorImage,
      blending: blendingMode,
      poisson_iters: poissonIters,
      poisson_erosion: poissonErosion,
    })) as GradioImageResponse;

    console.log("Swap result received");

    // Extract the URL from the result
    if (swapResult?.data?.[0]?.value?.url) {
      const resultUrl = swapResult.data[0].value.url;
      console.log("Swapped image public URL:", resultUrl);

      return NextResponse.json({
        url: resultUrl,
        success: true,
      });
    } else {
      console.error("Invalid response format from hair swap API");
      return NextResponse.json(
        {
          error: "Invalid response format from hair swap API",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error swapping hair:", error);

    // User-friendly error message
    let errorMessage = "Error processing hair swap request";
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
