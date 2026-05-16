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
import { usePageMeta } from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "Kap Services | Titres-Services Charleroi & Liège",
    description: "Agence agréée de titres-services à Courcelles, Mont-sur-Marchienne et Lobbes. Aide ménagère et repassage à domicile, service fiable et professionnel.",
    canonical: "/",
  });
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
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
