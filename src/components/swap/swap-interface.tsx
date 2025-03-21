"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ImageIcon,
  Upload,
  Camera,
  Share2,
  Download,
  Loader2,
  ArrowLeft,
  Sparkles,
  Instagram,
  Twitter,
  Copy,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";
import { swapHair } from "@/lib/hairswap";
import { createClient } from "@/utils/supabase/client";

// Enhanced image state with resize status and error tracking
interface ImageState {
  file: File | null;
  preview: string | null;
  resizedBlob?: Blob | null;
  resizing: boolean;
  error: string | null;
}

// Queue for resize operations
const resizeQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

// Process resize queue
const processQueue = async () => {
  if (isProcessingQueue || resizeQueue.length === 0) return;

  isProcessingQueue = true;
  try {
    const nextResize = resizeQueue.shift();
    if (nextResize) await nextResize();
  } finally {
    isProcessingQueue = false;
    if (resizeQueue.length > 0) {
      setTimeout(processQueue, 300); // Small delay between requests
    }
  }
};

export default function SwapInterface() {
  // Enhanced image states
  const [sourceImage, setSourceImage] = useState<ImageState>({
    file: null,
    preview: null,
    resizing: false,
    error: null,
  });
  const [shapeImage, setShapeImage] = useState<ImageState>({
    file: null,
    preview: null,
    resizing: false,
    error: null,
  });
  const [colorImage, setColorImage] = useState<ImageState>({
    file: null,
    preview: null,
    resizing: false,
    error: null,
  });

  // Webcam refs
  const sourceWebcamRef = useRef<Webcam>(null);
  const shapeWebcamRef = useRef<Webcam>(null);
  const colorWebcamRef = useRef<Webcam>(null);

  // Camera state
  const [activeCamera, setActiveCamera] = useState<string | null>(null);

  // Result states
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analyzingHairstyle, setAnalyzingHairstyle] = useState(false);

  // Userid state
  const [userId, setUserId] = useState<string | null>(null);

  // Add a new state for the stored permanent URL
  const [storedResultUrl, setStoredResultUrl] = useState<string | null>(null);

  // Get user id on mount
  useEffect(() => {
    const getUserId = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    getUserId();
  }, []);

  const handleImageFileCallback = useCallback(
    (
      file: File,
      setImage: React.Dispatch<React.SetStateAction<ImageState>>,
      imageType: string = "image"
    ) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage({
            file,
            preview: e.target.result as string,
            resizing: true,
            error: null,
          });

          // Queue resize operation instead of starting immediately
          // @ts-expect-error I dont know why
          resizeQueue.push(() => resizeImage(file, setImage, imageType));
          if (!isProcessingQueue) {
            processQueue();
          }
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // Setup clipboard paste event listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
              // Determine which uploader to use based on active element or focus
              const activeId = document.activeElement?.id || "";
              if (activeId.includes("shape")) {
                handleImageFileCallback(file, setShapeImage, "hairstyle");
              } else if (activeId.includes("color")) {
                handleImageFileCallback(file, setColorImage, "color");
              } else {
                // Default to source image
                handleImageFileCallback(file, setSourceImage, "face");
              }
              toast.success("✨ image pasted", {
                description: "clipboard image added (っ˘ω˘ς )",
              });
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageFileCallback]);

  // Begin resizing process via queue system
  const resizeImage = async (
    file: File,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>,
    imageType: string
  ) => {
    setImage((prev) => ({ ...prev, resizing: true, error: null }));

    try {
      // Create a FormData to send the file to the resizing API
      const formData = new FormData();
      formData.append("image", file);

      // Call resize API
      const response = await fetch("/api/resize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `failed to resize ${imageType} image: ${response.statusText}`
        );
      }

      const resizedBlob = await response.blob();

      setImage((prev) => ({
        ...prev,
        resizedBlob,
        resizing: false,
      }));

      return true;
    } catch (error) {
      console.error(`error resizing ${imageType} image:`, error);

      setImage((prev) => ({
        ...prev,
        resizing: false,
        error: `failed to resize ${imageType}: ${(error as Error).message}`,
      }));

      toast.error(`${imageType} resize failed ｡°(°.◜ᯅ◝°)°｡`, {
        description: (error as Error).message,
      });

      return false;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>,
    imageType: string
  ) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match("image.*")) {
        handleImageFile(file, setImage, imageType);
      }
    }
  };

  const handleImageFile = (
    file: File,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>,
    imageType: string = "image"
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage({
          file,
          preview: e.target.result as string,
          resizing: true,
          error: null,
        });

        // Queue resize instead of immediate processing
        // @ts-expect-error Dont ask me why it works
        resizeQueue.push(() => resizeImage(file, setImage, imageType));
        if (!isProcessingQueue) {
          processQueue();
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>,
    imageType: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleImageFile(file, setImage, imageType);
    }
  };

  // Capture photo from webcam
  const capturePhoto = (
    cameraId: string,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>,
    imageType: string
  ) => {
    const webcamRef =
      cameraId === "source"
        ? sourceWebcamRef
        : cameraId === "shape"
        ? shapeWebcamRef
        : colorWebcamRef;

    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert data URL to File
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `camera-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            handleImageFile(file, setImage, imageType);
            // Close camera after taking photo
            setActiveCamera(null);
          });
      }
    }
  };

  const shareOnTwitter = () => {
    if (storedResultUrl || resultImage) {
      // Download and redirect approach
      downloadResult().then(() => {
        const text = "check out my transformed hairstyle! ✨ #tresswap";
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}`;
        window.open(twitterUrl, "_blank");
      });
    }
  };

  const shareOnInstagram = () => {
    toast.info("instagram sharing", {
      description:
        "image saved for sharing on instagram with #tresswap hashtag! (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤",
    });
    downloadResult().then(() => {
      // For Instagram, just open the site after download
      window.open("https://instagram.com", "_blank");
    });
  };

  const copyImageLink = async () => {
    if (storedResultUrl) {
      navigator.clipboard.writeText(storedResultUrl).then(() => {
        toast.success("link copied", {
          description: "permanent link copied to clipboard (っ˘ω˘ς )",
        });
      });
    } else if (resultImage && userId) {
      toast.error("please wait", {
        description: "image is still being processed ｡°(°.◜ᯅ◝°)°｡",
      });
    } else {
      toast.error("not signed in", {
        description:
          "you need to be signed in to share permanent links ｡°(°.◜ᯅ◝°)°｡",
      });
    }
  };

  const shareResult = () => {
    if (navigator.share && storedResultUrl) {
      navigator
        .share({
          title: "check out my new hairstyle from tresswap!",
          text: "i transformed my hair using tresswap - what do you think? #tresswap ✨",
          url: storedResultUrl,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          toast.error("can't share", {
            description: "sharing not supported on this device ｡°(°.◜ᯅ◝°)°｡",
          });
        });
    } else if (navigator.share && resultImage) {
      navigator
        .share({
          title: "check out my new hairstyle from tresswap!",
          text: "i transformed my hair using tresswap - what do you think? #tresswap ✨",
          url: resultImage,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          toast.error("can't share", {
            description: "sharing not supported on this device ｡°(°.◜ᯅ◝°)°｡",
          });
        });
    } else {
      toast("share options", {
        description: "choose how to share your new look! (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤",
      });
    }
  };

  const downloadResult = async () => {
    const imageUrl = storedResultUrl || resultImage;
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `tresswap-${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}.webp`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (error) {
        console.error(error);
        toast.error("download failed", {
          description: "couldn't download the image ｡°(°.◜ᯅ◝°)°｡",
        });
      }
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setResultImage(null);
    setAiResponse(null);
  };

  // Get AI analysis of the hairstyle
  const getHairstyleAnalysis = async (imageUrl: string) => {
    try {
      setAnalyzingHairstyle(true);
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "result.jpg");
      const analysisResponse = await fetch("/api/hairstyle-analysis", {
        method: "POST",
        body: formData,
      });

      if (!analysisResponse.ok) {
        throw new Error("failed to analyze hairstyle");
      }

      const data = await analysisResponse.json();
      return (
        data.analysis ||
        "your new hairstyle looks fantastic! the blend appears natural and suits your face shape well. ✨"
      );
    } catch (error) {
      console.error("Error analyzing hairstyle:", error);
      return "your new hairstyle looks fantastic! the blend appears natural and suits your face shape well. ✨";
    } finally {
      setAnalyzingHairstyle(false);
    }
  };

  // Save image to Supabase bucket with privacy enhancement
  const saveImageToBucket = async (
    imageUrl: string,
    prefix: string
  ): Promise<string> => {
    try {
      // Skip if no user is logged in
      if (!userId) return imageUrl;

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const supabase = createClient();
      const fileExt = "webp";

      // Generate a random ID for the file instead of using user UUID directly
      const randomId = crypto.randomUUID().replace(/-/g, "").substring(0, 12);
      const fileName = `${prefix}_${Date.now()}_${randomId}.${fileExt}`;

      // Use a hashed subdirectory based on user ID instead of directly exposing UUID
      // This still allows for organization by user but doesn't expose the UUID
      const hashedUserId = await hashUserId(userId);
      const filePath = `results/${hashedUserId}/${fileName}`;

      const { error } = await supabase.storage
        .from("hairswap")
        .upload(filePath, blob, {
          contentType: "image/webp",
          upsert: true,
        });

      if (error) {
        console.error("Error uploading to storage:", error);
        return imageUrl;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("hairswap")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error("Error saving to bucket:", error);
      return imageUrl;
    }
  };

  // Helper function to create a hashed directory from user ID
  const hashUserId = async (userId: string): Promise<string> => {
    // Simple hashing function to create a consistent but non-reversible directory name
    // In production, you might want to use a more sophisticated method
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  };

  // Set a cookie to track non-logged users who have used their free swap
  const setFreeSwapUsedCookie = () => {
    // Only set for non-logged users
    if (!userId) {
      document.cookie = "used_free_swap=true; path=/; max-age=31536000"; // 1 year
    }
  };

  // Save transformation to history
  const saveToHistory = async (resultUrl: string) => {
    try {
      // Skip if no user is logged in
      if (!userId) return;

      const supabase = createClient();

      const { error } = await supabase.from("hair_history").insert([
        {
          user_id: userId,
          result_url: resultUrl,
          // created_at is handled automatically by Supabase
        },
      ]);

      if (error) {
        console.error("Error saving to history:", error);
      }
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  // Modified handleSwapRequest to set cookie for non-logged users
  const handleSwapRequest = async () => {
    // Make sure we have a face image and at least one of shape or color
    if (!sourceImage.file || (!shapeImage.file && !colorImage.file)) {
      toast.error("missing required images ｡°(°.◜ᯅ◝°)°｡", {
        description:
          "please upload a face photo and either a hairstyle or color reference.",
      });
      return;
    }

    // Check if any required image is still resizing
    if (
      sourceImage.resizing ||
      (shapeImage.file && shapeImage.resizing) ||
      (colorImage.file && colorImage.resizing)
    ) {
      toast.error("images still processing", {
        description:
          "please wait for all images to finish processing. (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤",
      });
      return;
    }

    // Check for any resize errors in required images
    if (
      sourceImage.error ||
      (shapeImage.file && shapeImage.error) ||
      (colorImage.file && colorImage.error)
    ) {
      toast.error("image processing errors", {
        description:
          "one or more images failed to process. please try uploading them again. ｡°(°.◜ᯅ◝°)°｡",
      });
      return;
    }

    setLoading(true);
    try {
      toast.info("processing your images", {
        description:
          "this may take a moment as we transform your hairstyle... ✨",
        duration: 5000,
      });

      // Pass pre-resized images if available, otherwise original files
      const imageUrl = await swapHair(
        sourceImage.resizedBlob || sourceImage.file,
        shapeImage.resizedBlob || shapeImage.file,
        colorImage.resizedBlob || colorImage.file,
        "Article", // Default blending mode
        0, // Default poisson iters
        15 // Default poisson erosion
      );

      setResultImage(imageUrl);

      // Get AI analysis of the result
      const analysis = await getHairstyleAnalysis(imageUrl);
      setAiResponse(analysis);

      // Save result image to bucket once if user is logged in
      if (userId) {
        toast.info("saving your result", {
          description: "creating a permanent link to your transformation...",
        });

        // Upload the result to the bucket once with privacy enhancement
        const savedResultUrl = await saveImageToBucket(imageUrl, "result");
        setStoredResultUrl(savedResultUrl);

        // Save to history with the permanent URL
        await saveToHistory(savedResultUrl);

        toast.success("saved permanently ✨", {
          description:
            "your transformation has been saved to your account (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤",
        });
      } else {
        // For non-logged users, set cookie to indicate they've used their free swap
        setFreeSwapUsedCookie();

        toast.info("free preview", {
          description: "sign in to save your result and create more! ✨",
        });
      }

      setShowResults(true);
      toast.success("transformation complete! ✨", {
        description: "your new hairstyle is ready! (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤",
      });
    } catch (error: any) {
      console.error("Error:", error);

      // Extract error message
      let errorMessage =
        "failed to transform hair. please try again. ｡°(°.◜ᯅ◝°)°｡";
      let details = "there was an error processing your request.";

      if (error.message) {
        if (
          error.message.includes("API is currently unavailable") ||
          error.message.includes("service is currently unavailable")
        ) {
          errorMessage = "service unavailable";
          details =
            "the AI service is currently unavailable or overloaded. please try again later. ｡°(°.◜ᯅ◝°)°｡";
        } else if (error.message.includes("timeout")) {
          errorMessage = "request timed out";
          details =
            "the AI service is taking too long to respond. it may be busy. please try again later. ｡°(°.◜ᯅ◝°)°｡";
        } else if (error.message.includes("Failed to resize")) {
          errorMessage = "image processing failed";
          details = error.message;
        } else {
          details = error.message;
        }
      }

      toast.error(errorMessage, {
        description: details,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const ImageUploader = ({
    title,
    description,
    image,
    setImage,
    cameraId,
    required = false,
  }: {
    title: string;
    description: string;
    image: ImageState;
    setImage: React.Dispatch<React.SetStateAction<ImageState>>;
    cameraId: string;
    required?: boolean;
  }) => {
    const webcamRef =
      cameraId === "source"
        ? sourceWebcamRef
        : cameraId === "shape"
        ? shapeWebcamRef
        : colorWebcamRef;
    const imageType =
      cameraId === "source"
        ? "face"
        : cameraId === "shape"
        ? "hairstyle"
        : "color";

    const videoConstraints = {
      width: 300,
      height: 300,
      facingMode: "user",
    };

    // Handle click on the entire card to open file dialog
    const handleCardClick = () => {
      // Only trigger if not in camera mode and no image is already uploaded
      if (activeCamera !== cameraId && !image.preview) {
        document.getElementById(`${cameraId}-upload`)?.click();
      }
    };

    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            {title} {required && <span className="text-red-500 ml-1">*</span>}
          </CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardHeader>
        <CardContent
          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-md cursor-pointer flex-grow relative"
          onDrop={(e) => handleDrop(e, setImage, imageType)}
          onDragOver={handleDragOver}
          onClick={handleCardClick}
          style={{ minHeight: "200px" }}
          id={`${cameraId}-uploader`}
        >
          {activeCamera === cameraId ? (
            <div className="relative w-full h-full flex flex-col">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded-md object-cover w-full h-full"
              />
              <div className="absolute bottom-2 inset-x-0 flex justify-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => capturePhoto(cameraId, setImage, imageType)}
                >
                  take photo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCamera(null)}
                >
                  cancel
                </Button>
              </div>
            </div>
          ) : image.preview ? (
            <div className="relative w-full aspect-square h-full">
              <Image
                src={image.preview}
                alt={`${title} Preview`}
                fill
                className="object-cover rounded-md"
              />
              {image.resizing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {image.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 rounded-md">
                  <p className="text-white text-sm bg-red-500 p-2 rounded">
                    error: {image.error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 p-4 h-full">
              <div className="rounded-full p-3 bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  drag & drop, paste or upload (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤
                </p>
              </div>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, setImage, imageType)}
            id={`${cameraId}-upload`}
          />
        </CardContent>
        <CardFooter className="flex justify-center gap-2 pt-2 pb-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              document.getElementById(`${cameraId}-upload`)?.click()
            }
            className="h-8 text-xs px-2"
          >
            <Upload className="h-3 w-3 mr-1" />
            upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveCamera(cameraId)}
            className="h-8 text-xs px-2"
          >
            <Camera className="h-3 w-3 mr-1" />
            camera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard
                .read()
                .then((items) => {
                  for (const item of items) {
                    if (
                      item.types.includes("image/png") ||
                      item.types.includes("image/jpeg")
                    ) {
                      item.getType(item.types[0]).then((blob) => {
                        const file = new File([blob], "clipboard-image.jpg", {
                          type: blob.type,
                        });
                        handleImageFile(file, setImage, imageType);
                      });
                    }
                  }
                })
                .catch(() => {
                  toast.info("paste image", {
                    description: "press paste with an image copied ✨",
                  });
                });
              document.getElementById(`${cameraId}-uploader`)?.focus();
            }}
            className="h-8 text-xs px-2"
          >
            <Clipboard className="h-3 w-3 mr-1" />
            paste
          </Button>
          {image.preview && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setImage({
                  file: null,
                  preview: null,
                  resizing: false,
                  error: null,
                });
              }}
              className="h-8 text-xs px-2"
            >
              remove
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (showResults && (resultImage || storedResultUrl)) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto">
        <Card className="w-full">
          <div className="w-full relative">
            {/* Reduced image dimensions for a compact view */}
            <Image
              src={storedResultUrl || resultImage || ""}
              alt="transformed hair result"
              width={300}
              height={225}
              className="object-contain w-full"
              priority
            />
          </div>
          <CardContent className="pt-2">
            <p className="text-sm text-center font-medium">our take on this</p>
            {analyzingHairstyle ? (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-xs">analyzing your new look...</span>
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground mt-1">
                {aiResponse}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={resetForm}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              go back
            </Button>
          </CardFooter>
        </Card>

        {/* Improved share buttons layout */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Button
            variant="outline"
            onClick={shareOnTwitter}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Twitter className="h-4 w-4" />
            <span>twitter</span>
          </Button>
          <Button
            variant="outline"
            onClick={shareOnInstagram}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Instagram className="h-4 w-4" />
            <span>instagram</span>
          </Button>
          <Button
            variant="outline"
            onClick={shareResult}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Share2 className="h-4 w-4" />
            <span>share</span>
          </Button>
          <Button
            variant="outline"
            onClick={copyImageLink}
            className="flex items-center justify-center gap-2 h-12"
          >
            <Copy className="h-4 w-4" />
            <span>copy link</span>
          </Button>
          <Button
            variant="outline"
            onClick={downloadResult}
            className="flex items-center justify-center gap-2 h-12 col-span-2"
          >
            <Download className="h-4 w-4" />
            <span>save image</span>
          </Button>
        </div>

        <Button
          variant="default"
          size="lg"
          onClick={resetForm}
          className="w-full"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          try something new ✨
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Three image uploaders in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ImageUploader
          title="your face"
          description="upload a clear front-facing photo"
          image={sourceImage}
          setImage={setSourceImage}
          cameraId="source"
          required={true}
        />
        <ImageUploader
          title="hairstyle"
          description="upload a hairstyle reference"
          image={shapeImage}
          setImage={setShapeImage}
          cameraId="shape"
          required={true}
        />
        <ImageUploader
          title="color"
          description="optional color reference"
          image={colorImage}
          setImage={setColorImage}
          cameraId="color"
        />
      </div>

      {/* Transform button */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSwapRequest}
        disabled={loading || !sourceImage.file || !shapeImage.file}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            processing... (⁠◍⁠•⁠ᴗ⁠•⁠◍⁠)⁠❤
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            transform my hair! ✨
          </>
        )}
      </Button>
    </div>
  );
}
