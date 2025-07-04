"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function HomePage() {
  return (
    <div className="bg-[rgb(19,19,19)] flex flex-col min-h-svh">
      {/* Content */}
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-4">
          {/* Simple image without animation */}
          <div className="relative">
            <div className="image-container">
              <Image
                src="/tresswap-montrox.jpg"
                alt="tresswap"
                width={300}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white relative">
              tresswap
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mt-2">
              gotta try &apos;em all
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-8">
          <Button
            className="h-16 text-lg font-medium"
            onClick={() => (window.location.href = "/swap")}
            variant="default"
          >
            give it a spin
          </Button>
          <Button
            className="h-16 text-lg font-medium"
            onClick={() => (window.location.href = "/contact")}
            variant="link"
          >
            wanna collab?
          </Button>
        </div>
      </div>
    </div>
  );
}
