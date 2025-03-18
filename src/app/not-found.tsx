"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { TextAnimate } from "@/components/ui/text-animate";

// Pokemon haikus with corresponding sprite data
const haikuData = [
  {
    pokemon: ["pikachu", "charizard"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", // Pikachu
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png", // Charizard
    ],
    lines: [
      "Pikachu's blonde locks,",
      "Transformed to Charizard's flame,",
      "Fire type hairdo.",
    ],
  },
  {
    pokemon: ["jigglypuff", "geodude"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png", // Jigglypuff
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png", // Geodude
    ],
    lines: [
      "Jigglypuff's pink curls,",
      "Traded for Geodude's stone,",
      "Rock hard styling now.",
    ],
  },
  {
    pokemon: ["eevee", "vaporeon"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png", // Eevee
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png", // Vaporeon
    ],
    lines: [
      "Eevee evolves hair,",
      "From brown to blue, Vaporeon,",
      "Water waves flow free.",
    ],
  },
  {
    pokemon: ["snorlax", "alakazam"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png", // Snorlax
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png", // Alakazam
    ],
    lines: [
      "Snorlax's thick mane,",
      "Swapped with Alakazam's thin,",
      "Psychic styling fails.",
    ],
  },
  {
    pokemon: ["bulbasaur", "vulpix"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", // Bulbasaur
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png", // Vulpix
    ],
    lines: [
      "Bulbasaur's green tufts,",
      "Now adorn Vulpix's head,",
      "Plant and fire blend.",
    ],
  },
  {
    pokemon: ["mewtwo", "rapidash"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png", // Mewtwo
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png", // Rapidash
    ],
    lines: [
      "Mewtwo's bald design,",
      "Takes Rapidash's flames instead,",
      "Mind on fire now.",
    ],
  },
  {
    pokemon: ["squirtle", "jolteon"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", // Squirtle
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png", // Jolteon
    ],
    lines: [
      "Squirtle's sleek blue style,",
      "Traded with Jolteon's spikes,",
      "Electric water.",
    ],
  },
  {
    pokemon: ["gengar", "chansey"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png", // Gengar
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png", // Chansey
    ],
    lines: [
      "Gengar's purple shade,",
      "Onto Chansey's pink texture,",
      "Ghost egg fusion born.",
    ],
  },
  {
    pokemon: ["meowth", "exeggutor"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png", // Meowth
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png", // Exeggutor
    ],
    lines: [
      "Meowth's whiskers gone,",
      "Replaced by Exeggutor's leaves,",
      "Money grows on heads.",
    ],
  },
  {
    pokemon: ["magikarp", "dragonair"],
    spriteUrl: [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png", // Magikarp
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png", // Dragonair
    ],
    lines: [
      "Magikarp's red scales,",
      "Splashing onto Dragonair,",
      "Evolution stalls.",
    ],
  },
];

export default function NotFound() {
  // Select a random haiku at page load
  const [selectedHaiku] = useState(() => {
    const randomIndex = Math.floor(Math.random() * haikuData.length);
    return haikuData[randomIndex];
  });

  const [lineIndex, setLineIndex] = useState(0);

  // Auto-advance through the haiku lines
  useEffect(() => {
    // Handle completion of each line animation
    const handleLineComplete = () => {
      if (lineIndex < selectedHaiku.lines.length - 1) {
        setLineIndex(lineIndex + 1);
      }
    };

    const timer = setTimeout(() => {
      handleLineComplete();
    }, 1500); // Adjust timing as needed

    return () => clearTimeout(timer);
  }, [lineIndex, selectedHaiku.lines.length]);

  return (
    <div
      suppressHydrationWarning
      className="bg-[rgb(19,19,19)] flex flex-col items-center justify-center min-h-svh p-6"
    >
      <div className="max-w-md w-full flex flex-col items-center text-center">
        {/* Pokemon sprites with overlapping circles */}
        <div className="mb-8 relative h-[140px] w-[220px]">
          {/* First Pokemon - positioned left */}
          <div className="absolute left-0 top-0 z-10 p-5 bg-[#1a1a1a] rounded-full border-2 border-[#2a2a2a]">
            <Image
              src={selectedHaiku.spriteUrl[0]}
              alt={selectedHaiku.pokemon[0]}
              width={90}
              height={90}
              className="pixelated"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Second Pokemon - positioned right, overlapping */}
          <div className="absolute right-0 top-0 z-20 p-5 bg-[#1a1a1a] rounded-full border-2 border-[#2a2a2a]">
            <Image
              src={selectedHaiku.spriteUrl[1]}
              alt={selectedHaiku.pokemon[1]}
              width={90}
              height={90}
              className="pixelated"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-medium text-gray-400 mb-8">
          Page Not Found
        </h2>

        {/* Haiku Container with animated text */}
        <div className="bg-[#121212] p-6 rounded-lg border border-[#333] mb-8 w-full">
          <div className="h-32 flex flex-col justify-center">
            {selectedHaiku.lines.map((line, idx) => (
              <p key={idx} className="text-lg my-2 font-light text-white h-8">
                <TextAnimate
                  text={idx <= lineIndex ? line : ""}
                  className="text-sm font-light text-white"
                  type="rollIn"
                />
              </p>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">
              {selectedHaiku.pokemon[0]}
            </span>
            <span className="text-sm text-gray-500">
              {selectedHaiku.pokemon[1]}
            </span>
          </div>
        </div>

        {/* Return Button */}
        <Button asChild size="lg" className="font-medium">
          <Link href="/">Return to tresswap</Link>
        </Button>
      </div>
    </div>
  );
}
