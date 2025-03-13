/**
 * Swap hair by sending a POST request to our API route.
 * @returns A promise that resolves to the result image URL
 */
export async function swapHair(
  faceImage: File,
  shapeImage: File,
  colorImage: File | null,
  blendingMode: string = "Article",
  poissonIters: number = 0,
  poissonErosion: number = 15
): Promise<string> {
  const formData = new FormData();
  formData.append("faceImage", faceImage);
  formData.append("shapeImage", shapeImage);
  if (colorImage) formData.append("colorImage", colorImage);
  formData.append("blendingMode", blendingMode);
  formData.append("poissonIters", poissonIters.toString());
  formData.append("poissonErosion", poissonErosion.toString());

  const response = await fetch("/api/hairswap", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || "API request failed");
  }
  return data.url;
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
