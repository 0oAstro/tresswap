/**
 * Swap hair by sending a POST request to our API route.
 * @returns A promise that resolves to the result image URL
 */
export async function swapHair(
  faceImage: File | Blob,
  shapeImage: File | Blob | null,
  colorImage: File | Blob | null,
  blendingMode: string = "Article",
  poissonIters: number = 0,
  poissonErosion: number = 15
): Promise<string> {
  // Validate inputs
  if (!faceImage) {
    throw new Error("Face image is required");
  }

  // Require at least one of shape or color
  if (!shapeImage && !colorImage) {
    throw new Error("Either hairstyle or color reference is required");
  }

  const formData = new FormData();
  formData.append("faceImage", faceImage);

  if (shapeImage) {
    formData.append("shapeImage", shapeImage);
  }

  if (colorImage) {
    formData.append("colorImage", colorImage);
  }

  formData.append("blendingMode", blendingMode);
  formData.append("poissonIters", poissonIters.toString());
  formData.append("poissonErosion", poissonErosion.toString());

  try {
    const response = await fetch("/api/hairswap", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to swap hair");
    }

    const data = await response.json();
    return data.url;
  } catch (error: unknown) {
    console.error("Error in swapHair:", error);
    throw error;
  }
}

/**
 * Convert a data URL to a File object
 * @param dataUrl - The data URL to convert
 * @param filename - The filename to use
 * @returns A File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
