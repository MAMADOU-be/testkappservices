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
import { Testimonials } from "@/components/Testimonials";
import { BackToTop } from "@/components/BackToTop";
import { AdBanner } from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      <main>
        <Hero />
        <About />
        <AdBanner adSlot="1234567890" adFormat="horizontal" className="max-w-5xl mx-auto px-4" />
        <Services />
        <HowItWorks />
        <AdBanner adSlot="1234567891" adFormat="horizontal" className="max-w-5xl mx-auto px-4" />
        <Agencies />
        <RequestForm />
        <IroningRegistrationForm />
        <AdBanner adSlot="1234567892" adFormat="horizontal" className="max-w-5xl mx-auto px-4" />
        <BlogSection />
        <FAQ />
        <Recruitment />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
