import { Metadata } from "next";
import SwapInterface from "@/components/swap/swap-interface";

export default function SwapPage() {
  return (
    <main className="container py-6 md:py-10 mx-auto">
      <div className="grid gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Transform Your Look
          </h1>
          <p className="mt-3 text-muted-foreground">
            See your wildest hair dreams... kinda!
          </p>
        </div>

        <SwapInterface />
      </div>
    </main>
  );
}
