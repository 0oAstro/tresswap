import { Client } from "@gradio/client";
import { NextRequest, NextResponse } from "next/server";

// Mock mode disabled as requested
const MOCK_ENABLED = false;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const faceImage = formData.get("faceImage") as File;
    const shapeImage = formData.get("shapeImage") as File;
    const colorImage = formData.get("colorImage") as File | null;
    const blendingMode = (formData.get("blendingMode") as string) || "Article";
    const poissonIters = parseInt(
      (formData.get("poissonIters") as string) || "0"
    );
    const poissonErosion = parseInt(
      (formData.get("poissonErosion") as string) || "15"
    );

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

    // Connect to the API without token (as shown in test.js)
    const client = await Client.connect("AIRI-Institute/HairFastGAN");
    console.log("Successfully connected to API");

    console.log("Preparing API inputs...");

    // Resize face image
    console.log("Resizing face image...");
    const faceResizeResult = await client.predict("/resize_inner", {
      img: faceImage,
      align: ["Face", "Shape", "Color"],
    });
    const faceResizedUrl = faceResizeResult.data[0].url;
    const faceResizedResponse = await fetch(faceResizedUrl);
    const faceResizedBlob = await faceResizedResponse.blob();

    let shapeResizedBlob = null;
    let colorResizedBlob = null;
    if (shapeImage) {
      console.log("Resizing shape image...");
      const shapeResizeResult = await client.predict("/resize_inner", {
        img: shapeImage,
        align: ["Face", "Shape", "Color"],
      });
      const shapeResizedUrl = shapeResizeResult.data[0].url;
      const shapeResizedResponse = await fetch(shapeResizedUrl);
      shapeResizedBlob = await shapeResizedResponse.blob();
      // Enforce interdependence: if shape exists, ignore color
      colorResizedBlob = null;
    } else if (colorImage) {
      console.log("Resizing color image...");
      const colorResizeResult = await client.predict("/resize_inner", {
        img: colorImage,
        align: ["Face", "Shape", "Color"],
      });
      const colorResizedUrl = colorResizeResult.data[0].url;
      const colorResizedResponse = await fetch(colorResizedUrl);
      colorResizedBlob = await colorResizedResponse.blob();
    }

    // Second step: Call the swap_hair endpoint with all our inputs
    console.log("Calling swap_hair with resized images...");
    const swapResult = await client.predict("/swap_hair", {
      face: faceResizedBlob,
      shape: shapeResizedBlob,
      color: colorResizedBlob,
      blending: blendingMode,
      poisson_iters: poissonIters,
      poisson_erosion: poissonErosion,
    });

    console.log("Swap result:", JSON.stringify(swapResult).substring(0, 200));

    // Extract the URL from the result using the same pattern as test.js
    if (swapResult) {
      const resultUrl = swapResult.data[0].value.url;
      console.log("Temporary swap result URL:", resultUrl);

      // Download the swapped image blob
      console.log("Swapped image public URL:", resultUrl);

      return NextResponse.json({
        url: resultUrl,
        success: true,
      });
    } else {
      console.error("Error processing hair swap request");
      return NextResponse.json(
        {
          error: "Error processing hair swap request",
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
