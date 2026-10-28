import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { FleetShowcase } from "@/components/FleetShowcase";
import { HowItWorks } from "@/components/HowItWorks";
import { Stats } from "@/components/Stats";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div id="home">
        <Hero />
      </div>
      <Features />
      <div id="fleet">
        <FleetShowcase />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Stats />
      <div id="contact">
        <CTA />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
