import { ConsoleStrip } from "@/components/landing/ConsoleStrip";
import { FooterTag } from "@/components/landing/FooterTag";
import { HeroSection } from "@/components/landing/HeroSection";
import { Progression } from "@/components/landing/Progression";
import { TypesGrid } from "@/components/landing/TypesGrid";
import { WhatHappens } from "@/components/landing/WhatHappens";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <HeroSection />
      <ConsoleStrip />
      <WhatHappens />
      <TypesGrid />
      <Progression />
      <FooterTag />
    </main>
  );
}
