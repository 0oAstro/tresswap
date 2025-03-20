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

// Create client once instead of for each request
let clientPromise: Promise<any> | null = null;

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
    const faceImage = formData.get("faceImage") as File;
    const shapeImage = formData.get("shapeImage") as File | null;
    const colorImage = formData.get("colorImage") as File | null;
    const blendingMode = (formData.get("blendingMode") as string) || "Article";

    // Default values for poisson parameters
    const poissonIters = 0; // Simple default value
    const poissonErosion = 15; // Default erosion value

    // Validate inputs
    if (!faceImage) {
      return NextResponse.json(
        { error: "face image is required", success: false },
        { status: 400 }
      );
    }

    // Require either shape or color image
    if (!shapeImage && !colorImage) {
      return NextResponse.json(
        {
          error: "either a hairstyle or color reference is required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Use mock result for development/testing
    if (MOCK_ENABLED) {
      console.log("using mock result for hairswap");

      // Add artificial delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return NextResponse.json({
        url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=870&auto=format&fit=crop",
        success: true,
      });
    }

    console.log("connecting to hairfastgan api...");

    // Get the client (reuses existing connection)
    const client = await getClient();
    console.log("successfully connected to api");

    // Skip resizing since images are already pre-resized from the client-side
    console.log("using pre-resized images from client");

    // Call the swap_hair endpoint directly with the provided images
    console.log("calling swap_hair with provided images...");
    const swapResult = (await client.predict("/swap_hair", {
      face: faceImage,
      shape: shapeImage,
      color: colorImage,
      blending: blendingMode,
      poisson_iters: poissonIters,
      poisson_erosion: poissonErosion,
    })) as GradioImageResponse;

    console.log("swap result received");

    // Extract the URL from the result
    if (swapResult?.data?.[0]?.value?.url) {
      const resultUrl = swapResult.data[0].value.url;
      console.log("swapped image public url:", resultUrl);

      return NextResponse.json({
        url: resultUrl,
        success: true,
      });
    } else {
      console.error("invalid response format from hair swap api");
      return NextResponse.json(
        {
          error: "invalid response format from hair swap api",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("error swapping hair:", error);

    // User-friendly error message
    let errorMessage = "error processing hair swap request";
    if ((error as Error).message) {
      errorMessage = (error as Error).message;

      // Clean up common error messages
      if (errorMessage.includes("Unexpected token '<'")) {
        errorMessage =
          "the hairfastgan service is currently unavailable. please try again later.";
      } else if (errorMessage.includes("ECONNRESET")) {
        errorMessage =
          "connection to the ai service was reset. the service might be overloaded.";
      } else if (errorMessage.includes("timeout")) {
        errorMessage = "the request timed out. the ai service might be busy.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: (error as Error).message || "unknown error",
        success: false,
      },
      { status: 503 }
    );
  }
}
