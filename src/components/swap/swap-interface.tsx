"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { swapHair } from "@/lib/hairswap";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SwapInterface() {
  // Image states
  const [sourceImage, setSourceImage] = useState<{
    file: File | null;
    preview: string | null;
  }>({
    file: null,
    preview: null,
  });
  const [shapeImage, setShapeImage] = useState<{
    file: File | null;
    preview: string | null;
  }>({
    file: null,
    preview: null,
  });
  const [colorImage, setColorImage] = useState<{
    file: File | null;
    preview: string | null;
  }>({
    file: null,
    preview: null,
  });

  // Camera refs - fix the type to handle null
  const sourceCameraRef = useRef<HTMLInputElement>(null);
  const shapeCameraRef = useRef<HTMLInputElement>(null);
  const colorCameraRef = useRef<HTMLInputElement>(null);

  // Result states
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Advanced settings
  const [poissonIters, setPoissonIters] = useState(0);
  const [poissonErosion, setPoissonErosion] = useState(15);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    setImage: React.Dispatch<
      React.SetStateAction<{ file: File | null; preview: string | null }>
    >
  ) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.match("image.*")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImage({
              file,
              preview: e.target.result as string,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<
      React.SetStateAction<{ file: File | null; preview: string | null }>
    >
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage({
            file,
            preview: e.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
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
    if (!sourceImage.file || !shapeImage.file) {
      toast.error("Missing required images", {
        description:
          "Please upload both a face photo and a hairstyle reference.",
      });
      return;
    }

    setLoading(true);
    try {
      toast.info("Processing your images", {
        description: "This may take a moment as we transform your hairstyle...",
        duration: 5000,
      });

      const imageUrl = await swapHair(
        sourceImage.file,
        shapeImage.file,
        colorImage.file,
        "Article",
        poissonIters,
        poissonErosion
      );

      setResultImage(imageUrl);

      // Use the new AI critique function with the swapped image URL
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
    cameraRef,
    required = false,
  }: {
    title: string;
    description: string;
    image: { file: File | null; preview: string | null };
    setImage: React.Dispatch<
      React.SetStateAction<{ file: File | null; preview: string | null }>
    >;
    cameraRef: React.RefObject<HTMLInputElement>;
    required?: boolean;
  }) => (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {title} {required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent
        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/20 rounded-md cursor-pointer flex-grow"
        onDrop={(e) => handleDrop(e, setImage)}
        onDragOver={handleDragOver}
        style={{ minHeight: "200px" }} // Ensure minimum height for consistency
      >
        {image.preview ? (
          <div className="relative w-full aspect-square h-full">
            <Image
              src={image.preview}
              alt={`${title} Preview`}
              fill
              className="object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 p-4 h-full">
            <div className="rounded-full p-3 bg-muted">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Drag & drop or upload
              </p>
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, setImage)}
          id={`${title.toLowerCase()}-upload`}
        />

        <input
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          ref={cameraRef}
          onChange={(e) => handleFileChange(e, setImage)}
        />
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-2 pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            document.getElementById(`${title.toLowerCase()}-upload`)?.click()
          }
          className="h-8 text-xs px-2"
        >
          <Upload className="h-3 w-3 mr-1" />
          Upload
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => cameraRef.current?.click()}
          className="h-8 text-xs px-2"
        >
          <Camera className="h-3 w-3 mr-1" />
          Camera
        </Button>
        {image.preview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImage({ file: null, preview: null })}
            className="h-8 text-xs px-2"
          >
            Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );

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
          cameraRef={sourceCameraRef as React.RefObject<HTMLInputElement>}
          required={true}
        />
        <ImageUploader
          title="Hairstyle"
          description="Upload a hairstyle reference"
          image={shapeImage}
          setImage={setShapeImage}
          cameraRef={shapeCameraRef as React.RefObject<HTMLInputElement>}
          required={true}
        />
        <ImageUploader
          title="Color"
          description="Optional color reference"
          image={colorImage}
          setImage={setColorImage}
          cameraRef={colorCameraRef as React.RefObject<HTMLInputElement>}
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
