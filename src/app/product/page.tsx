"use client";

import Header from "@/components/landingpage/Header";
import { GradientSection } from "@/components/GradientSection";
import ProductPage from "@/components/landingpage/ProductPage";

export default function Product() {
  return (
    <GradientSection className="min-h-screen">
      <Header />
      <main>
        <ProductPage />
      </main>
    </GradientSection>
  );
}
