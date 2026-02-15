import { 
  CreditCard, 
  UserCheck, 
  CalendarCheck, 
  Euro,
  ExternalLink,
  FileText,
  Smartphone,
  ShieldCheck,
  Heart,
  Users,
  Clock,
  BadgeCheck
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/i18n/LanguageContext";

const regions = [
  { key: "wallonia" as const, url: "https://extranet.wallonie-titres-services.be/Public/Users/Registration?lang=fr/" },
  { key: "brussels" as const, url: "https://extranet.titresservices.brussels/Public/Users/Registration?lang=fr" },
  { key: "flanders" as const, url: "https://extranet.dienstencheques-vlaanderen.be/Public/Users/Registration?lang=nl" },
];

const stepIcons = [CreditCard, UserCheck, CalendarCheck, Euro];
const stepKeys = ["s1", "s2", "s3", "s4"] as const;

const userAdvantageIcons = [Euro, ShieldCheck, FileText];
const workerAdvantageIcons = [BadgeCheck, Heart, Clock];

export function HowItWorks() {
  const { t } = useLanguage();
  const [stepsRef, stepsVisible, getStepStyle] = useStaggeredAnimation<HTMLDivElement>(4, 150);

  const steps = stepKeys.map((key, i) => ({
    icon: stepIcons[i],
    step: String(i + 1).padStart(2, '0'),
    title: t.howItWorks.steps[key].title,
    description: t.howItWorks.steps[key].description,
  }));

  return (
    <section id="comment" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-muted-foreground">
            {t.howItWorks.description}
          </p>
        </ScrollAnimation>

        {/* Steps */}
        <div ref={stepsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.step} className="relative" style={getStepStyle(index)}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent -translate-x-8" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Links */}
        <ScrollAnimation animation="fade-up" delay={200} className="bg-card rounded-2xl p-6 mb-12 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            {t.howItWorks.registerTitle}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {regions.map((region) => (
              <a
                key={region.key}
                href={region.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground font-medium transition-colors"
              >
                {t.howItWorks.regions[region.key]}
                <ExternalLink className="w-4 h-4 text-primary" />
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {t.howItWorks.registerHelp} <strong className="text-foreground">{t.howItWorks.registerHelpPhone}</strong> {t.howItWorks.registerHelpEnd}
          </p>
        </ScrollAnimation>

        {/* Detailed Accordion */}
        <ScrollAnimation animation="fade-up" delay={300}>
        <Accordion type="single" collapsible className="mb-12">
          <AccordionItem value="formats" className="bg-card rounded-xl border border-border px-6 mb-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{t.howItWorks.formats.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold text-foreground mb-2">{t.howItWorks.formats.paper.title}</h4>
                  <p className="text-sm">{t.howItWorks.formats.paper.description}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold text-foreground mb-2">{t.howItWorks.formats.electronic.title}</h4>
                  <p className="text-sm">{t.howItWorks.formats.electronic.description}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing" className="bg-card rounded-xl border border-border px-6 mb-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Euro className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{t.howItWorks.pricing.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="font-semibold text-foreground mb-1">{t.howItWorks.pricing.mainPrice}</p>
                  <p className="text-sm">{t.howItWorks.pricing.mainDetail} <strong className="text-primary">{t.howItWorks.pricing.mainHighlight}</strong></p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t.howItWorks.pricing.individual}</h4>
                    <ul className="space-y-1">
                      <li>• 1-175 titres : 10€</li>
                      <li>• 176-400 titres : 11€</li>
                      <li>• 401-500 titres : 12€</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t.howItWorks.pricing.household}</h4>
                    <ul className="space-y-1">
                      <li>• 1-350 titres : 10€</li>
                      <li>• 351-800 titres : 11€</li>
                      <li>• 801-1000 titres : 12€</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm"><strong>{t.howItWorks.pricing.validity}</strong> {t.howItWorks.pricing.validityValue} • <strong>{t.howItWorks.pricing.minOrder}</strong> {t.howItWorks.pricing.minOrderValue}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="special" className="bg-card rounded-xl border border-border px-6 mb-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <span className="font-semibold text-foreground">{t.howItWorks.special.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="mb-3">{t.howItWorks.special.description} <strong className="text-foreground">{t.howItWorks.special.descriptionBold}</strong> :</p>
                <ul className="space-y-2 text-sm">
                  {t.howItWorks.special.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="aide" className="bg-card rounded-xl border border-border px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{t.howItWorks.findMaid.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="mt-4 space-y-3 text-sm">
                <p>{t.howItWorks.findMaid.desc1} <strong className="text-foreground">{t.howItWorks.findMaid.desc1Bold}</strong> {t.howItWorks.findMaid.desc1End}</p>
                <p>{t.howItWorks.findMaid.desc2} <strong className="text-foreground">{t.howItWorks.findMaid.desc2Bold}</strong> {t.howItWorks.findMaid.desc2End}</p>
                <p>{t.howItWorks.findMaid.desc3} <strong className="text-foreground">{t.howItWorks.findMaid.desc3Bold}</strong>{t.howItWorks.findMaid.desc3End}</p>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-4">
                  <p className="text-foreground font-medium">{t.howItWorks.findMaid.warning}</p>
                  <p className="text-sm">{t.howItWorks.findMaid.warningText}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </ScrollAnimation>

        {/* Advantages */}
        <ScrollAnimation animation="fade-up" delay={400} className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t.howItWorks.advantages.forYou}</h3>
            <div className="space-y-3">
              {t.howItWorks.advantages.userItems.map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {(() => { const Icon = userAdvantageIcons[i]; return <Icon className="w-4 h-4 text-primary" />; })()}
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t.howItWorks.advantages.forWorker}</h3>
            <div className="space-y-3">
              {t.howItWorks.advantages.workerItems.map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    {(() => { const Icon = workerAdvantageIcons[i]; return <Icon className="w-4 h-4 text-accent" />; })()}
                  </div>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
