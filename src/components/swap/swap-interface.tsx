"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  ImageIcon,
  Upload,
  Camera,
  Share2,
  Download,
  Loader2,
  ArrowLeft,
  Sparkles,
  Settings,
  Instagram,
  Twitter,
  Copy,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";
import { swapHair } from "@/lib/hairswap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Enhanced image state with resize status and error tracking
interface ImageState {
  file: File | null;
  preview: string | null;
  resizedBlob?: Blob | null;
  resizing: boolean;
  error: string | null;
}

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

  // Camera refs for actual video elements
  const sourceCameraRef = useRef<HTMLVideoElement>(null);
  const shapeCameraRef = useRef<HTMLVideoElement>(null);
  const colorCameraRef = useRef<HTMLVideoElement>(null);

  // Camera stream state
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);

  // Result states
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Advanced settings
  const [poissonIters, setPoissonIters] = useState(0);
  const [poissonErosion, setPoissonErosion] = useState(15);

  // Cleanup camera streams when component unmounts
  useEffect(() => {
    return () => {
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }
    };
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

          // Start resizing process immediately after preview is shown
          resizeImage(file, setImage, imageType).catch((error) => {
            console.error("Resize process failed:", error);
          });
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
              toast.success("Image pasted", {
                description: "Image from clipboard has been added",
              });
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageFileCallback, setSourceImage, setShapeImage, setColorImage]);

  // Begin resizing process as soon as image is selected
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

      // Call HairFastGAN API directly through our proxy
      const response = await fetch("/api/resize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to resize ${imageType} image: ${response.statusText}`
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
      console.error(`Error resizing ${imageType} image:`, error);

      setImage((prev) => ({
        ...prev,
        resizing: false,
        error: `Failed to resize ${imageType}: ${(error as Error).message}`,
      }));

      toast.error(`${imageType} image resize failed`, {
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

        // Start resizing process immediately after preview is shown
        resizeImage(file, setImage, imageType).catch((error) => {
          console.error("Resize process failed:", error);
        });
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

  // Start camera capture
  const startCamera = async (cameraId: string) => {
    try {
      // Close any existing camera stream first
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      mediaStream.current = stream;
      setActiveCamera(cameraId);

      // Set stream to appropriate video element
      const videoRef =
        cameraId === "source"
          ? sourceCameraRef
          : cameraId === "shape"
          ? shapeCameraRef
          : colorCameraRef;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Camera access failed", {
        description: "Could not access your camera. Please check permissions.",
      });
    }
  };

  // Capture photo from camera stream
  const capturePhoto = (
    cameraId: string,
    setImage: React.Dispatch<React.SetStateAction<ImageState>>,
    imageType: string
  ) => {
    const videoRef =
      cameraId === "source"
        ? sourceCameraRef
        : cameraId === "shape"
        ? shapeCameraRef
        : colorCameraRef;

    if (videoRef.current) {
      // Create a canvas element to capture the frame
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current video frame to the canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to a file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `camera-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              handleImageFile(file, setImage, imageType);

              // Close camera after taking photo
              closeCamera();
            }
          },
          "image/jpeg",
          0.95
        );
      }
    }
  };

  // Close camera stream
  const closeCamera = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
    setActiveCamera(null);
  };

  const shareOnTwitter = () => {
    if (resultImage) {
      const text = "Check out my transformed hairstyle! #tresswap challenge";
      const url = encodeURIComponent(resultImage);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${url}`;
      window.open(twitterUrl, "_blank");
    }
  };

  const shareOnInstagram = () => {
    // Instagram doesn't allow direct sharing via URL, so inform the user
    toast.info("Instagram sharing", {
      description:
        "Save the image and share on Instagram with #tresswap hashtag!",
    });
    downloadResult();
  };

  const copyImageLink = () => {
    if (resultImage) {
      navigator.clipboard
        .writeText(resultImage)
        .then(() => {
          toast.success("Link copied", {
            description: "Image link copied to clipboard",
          });
        })
        .catch(() => {
          toast.error("Copy failed", {
            description: "Could not copy the link to clipboard",
          });
        });
    }
  };

  const shareResult = () => {
    if (navigator.share && resultImage) {
      navigator
        .share({
          title: "Check out my new hairstyle from Tresswap!",
          text: "I transformed my hair using Tresswap - what do you think? #tresswap challenge",
          url: resultImage,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          toast.error("Unable to share", {
            description: "Sharing is not supported on this device.",
          });
        });
    } else {
      toast("Share options", {
        description: "Choose a platform to share your new look!",
      });
    }
  };

  const downloadResult = () => {
    if (resultImage) {
      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = resultImage;
      link.download = "tresswap-result.jpg";

      // Append to the body, click it, and remove it
      document.body.appendChild(link);
      link.click();

      // Small delay before removing to ensure the download starts
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setResultImage(null);
    setAiResponse(null);
  };

  const handleSwapRequest = async () => {
    // Make sure we have a face image and at least one of shape or color
    if (!sourceImage.file || (!shapeImage.file && !colorImage.file)) {
      toast.error("Missing required images", {
        description:
          "Please upload a face photo and either a hairstyle or color reference.",
      });
      return;
    }

    // Check if any required image is still resizing
    if (
      sourceImage.resizing ||
      (shapeImage.file && shapeImage.resizing) ||
      (colorImage.file && colorImage.resizing)
    ) {
      toast.error("Images still processing", {
        description: "Please wait for all images to finish processing.",
      });
      return;
    }

    // Check for any resize errors in required images
    if (
      sourceImage.error ||
      (shapeImage.file && shapeImage.error) ||
      (colorImage.file && colorImage.error)
    ) {
      toast.error("Image processing errors", {
        description:
          "One or more images failed to process. Please try uploading them again.",
      });
      return;
    }

    setLoading(true);
    try {
      toast.info("Processing your images", {
        description: "This may take a moment as we transform your hairstyle...",
        duration: 5000,
      });

      // Pass pre-resized images if available, otherwise original files
      const imageUrl = await swapHair(
        sourceImage.resizedBlob || sourceImage.file,
        shapeImage.resizedBlob || shapeImage.file,
        colorImage.resizedBlob || colorImage.file,
        "Article",
        poissonIters,
        poissonErosion
      );

      setResultImage(imageUrl);
      setAiResponse(
        "Your new hairstyle looks fantastic! The blend appears natural and suits your face shape well."
      );
      setShowResults(true);

      toast.success("Transformation complete!", {
        description: "Your new hairstyle is ready!",
      });
    } catch (error: any) {
      console.error("Error:", error);

      // Extract error message
      let errorMessage = "Failed to transform hair. Please try again.";
      let details = "There was an error processing your request.";

      if (error.message) {
        if (
          error.message.includes("API is currently unavailable") ||
          error.message.includes("service is currently unavailable")
        ) {
          errorMessage = "Service unavailable";
          details =
            "The AI service is currently unavailable or overloaded. Please try again later.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timed out";
          details =
            "The AI service is taking too long to respond. It may be busy. Please try again later.";
        } else if (error.message.includes("Failed to resize")) {
          errorMessage = "Image processing failed";
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
    const videoRef =
      cameraId === "source"
        ? sourceCameraRef
        : cameraId === "shape"
        ? shapeCameraRef
        : colorCameraRef;
    const imageType =
      cameraId === "source"
        ? "face"
        : cameraId === "shape"
        ? "hairstyle"
        : "color";

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
          style={{ minHeight: "200px" }}
          id={`${cameraId}-uploader`}
        >
          {activeCamera === cameraId ? (
            <div className="relative w-full h-full flex flex-col">
              <video
                ref={videoRef}
                className="rounded-md object-cover w-full h-full"
                autoPlay
                playsInline
              />
              <div className="absolute bottom-2 inset-x-0 flex justify-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => capturePhoto(cameraId, setImage, imageType)}
                >
                  Take Photo
                </Button>
                <Button variant="outline" size="sm" onClick={closeCamera}>
                  Cancel
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
                    Error: {image.error}
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
                  Drag & drop, paste or upload
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
        <CardFooter className="flex justify-center gap-2 pt-2 pb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              document.getElementById(`${cameraId}-upload`)?.click()
            }
            className="h-8 text-xs px-2"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => startCamera(cameraId)}
            className="h-8 text-xs px-2"
          >
            <Camera className="h-3 w-3 mr-1" />
            Camera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Paste from clipboard", {
                description: "Press Ctrl+V or Cmd+V to paste an image",
              });
              // Focus the uploader to make it the active element for paste
              document.getElementById(`${cameraId}-uploader`)?.focus();
            }}
            className="h-8 text-xs px-2"
          >
            <Clipboard className="h-3 w-3 mr-1" />
            Paste
          </Button>
          {image.preview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setImage({
                  file: null,
                  preview: null,
                  resizing: false,
                  error: null,
                })
              }
              className="h-8 text-xs px-2"
            >
              Remove
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (showResults && resultImage) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 max-w-sm mx-auto">
        <Card className="w-full">
          <div className="w-full relative">
            {/* Reduced image dimensions for a compact view */}
            <Image
              src={resultImage}
              alt="Transformed hair result"
              width={300}
              height={225}
              className="object-contain w-full"
              priority
            />
          </div>
          <CardContent className="pt-2">
            <p className="text-sm text-center font-medium">AI Analysis:</p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              {aiResponse}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={resetForm}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go back
            </Button>
          </CardFooter>
        </Card>
        <div className="flex flex-col sm:flex-row gap-2 justify-center w-full">
          <Button variant="outline" onClick={shareOnTwitter}>
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          <Button variant="outline" onClick={shareOnInstagram}>
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
          </Button>
          <Button variant="outline" onClick={shareResult}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={copyImageLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" onClick={downloadResult}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={resetForm}
          className="w-full"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Try something new
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Three image uploaders in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ImageUploader
          title="Your face"
          description="Upload a clear front-facing photo"
          image={sourceImage}
          setImage={setSourceImage}
          cameraId="source"
          required={true}
        />
        <ImageUploader
          title="Hairstyle"
          description="Upload a hairstyle reference"
          image={shapeImage}
          setImage={setShapeImage}
          cameraId="shape"
          required={true}
        />
        <ImageUploader
          title="Color"
          description="Optional color reference"
          image={colorImage}
          setImage={setColorImage}
          cameraId="color"
        />
      </div>

      {/* Advanced settings section with Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="advanced-settings">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Settings
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="poisson-iters">
                    Poisson Iterations: {poissonIters}
                  </Label>
                </div>
                <Slider
                  id="poisson-iters"
                  min={0}
                  max={20}
                  step={1}
                  value={[poissonIters]}
                  onValueChange={(value) => setPoissonIters(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls the number of iterations for the Poisson blending
                  algorithm. Higher values may improve blending quality.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="poisson-erosion">
                    Poisson Erosion: {poissonErosion}
                  </Label>
                </div>
                <Slider
                  id="poisson-erosion"
                  min={5}
                  max={30}
                  step={1}
                  value={[poissonErosion]}
                  onValueChange={(value) => setPoissonErosion(value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls the erosion parameter for the Poisson blending.
                  Affects how the hairstyle blends with your face.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
            processing...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            transform my hair!
          </>
        )}
      </Button>
    </div>
  );
}
