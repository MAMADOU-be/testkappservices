import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Agencies } from "@/components/Agencies";
import { RequestForm } from "@/components/RequestForm";
import { Recruitment } from "@/components/Recruitment";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { IroningRegistrationForm } from "@/components/IroningRegistrationForm";
import { BlogSection } from "@/components/BlogSection";
import { BackToTop } from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <Agencies />
        <RequestForm />
        <IroningRegistrationForm />
        <BlogSection />
        <FAQ />
        <Recruitment />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
