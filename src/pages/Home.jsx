import React from "react";
import HeroSlider from "@/components/home/HeroSlider";
import ServicesGrid from "@/components/home/ServicesGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import GetQuoteSection from "@/components/home/GetQuoteSection";
import StatsCounter from "@/components/home/StatsCounter";
import CtaSection from "@/components/home/CtaSection";

export default function Home() {
  return (
    <>
      <HeroSlider />
      <ServicesGrid />
      <WhyChooseUs />
      <TestimonialsSection />
      <GetQuoteSection />
      <StatsCounter />
      <CtaSection />
    </>
  );
}