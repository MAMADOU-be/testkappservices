import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Agencies } from "@/components/Agencies";
import { RequestForm } from "@/components/RequestForm";
import { FAQ } from "@/components/FAQ";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { IroningRegistrationForm } from "@/components/IroningRegistrationForm";
import { BlogSection } from "@/components/BlogSection";
import { Testimonials } from "@/components/Testimonials";
import { BackToTop } from "@/components/BackToTop";
import { Recruitment } from "@/components/Recruitment";
import { AdBanner } from "@/components/AdBanner";

const Index = () => {
  return (
    <div className="min-h-screen scroll-smooth">
      <Header />
      <main>
        <Hero />
        <About />
        <AdBanner adSlot="SLOT_1" />
        <Services />
        <HowItWorks />
        <AdBanner adSlot="SLOT_2" />
        <Agencies />
        <RequestForm />
        <IroningRegistrationForm />
        <AdBanner adSlot="SLOT_3" />
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
