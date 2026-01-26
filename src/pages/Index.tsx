import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Agencies } from "@/components/Agencies";
import { Recruitment } from "@/components/Recruitment";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <Agencies />
        <Recruitment />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
