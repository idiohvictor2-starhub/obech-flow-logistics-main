import React from "react";
import HeroSection from "@/components/home/HeroSection";
import ServicesGrid from "@/components/home/ServicesGrid";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import GlobalReach from "@/components/home/GlobalReach";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesGrid />
      <GlobalReach />
      <WhyChooseUs />
    </>
  );
}