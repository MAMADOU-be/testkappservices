import { ArrowRight, Sparkles, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section id="accueil" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-background" />
      <div 
        className="absolute top-20 right-0 w-1/2 h-1/2 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, hsl(175 65% 40% / 0.2) 0%, transparent 70%)" }}
      />
      
      <div className="container-narrow mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {t.hero.title}{" "}
              <span className="text-gradient-primary">{t.hero.titleHighlight}</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg">
              {t.hero.description}{" "}
              <strong className="text-foreground">{t.hero.priceHighlight}</strong>.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="btn-primary border-0 text-base px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <a href="#demande">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button asChild variant="outline" className="text-base px-8 py-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <a href="#jobs">{t.hero.ctaSecondary}</a>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.hero.trustDeclared}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.hero.trustFlexible}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.hero.trustExperience}</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-float" />
              <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-accent/20 to-transparent animate-float" style={{ animationDelay: "1s" }} />
              
              <div className="absolute inset-16 rounded-3xl bg-card shadow-lg overflow-hidden border border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{t.hero.visualTitle}</h3>
                    <p className="text-muted-foreground">{t.hero.visualSubtitle}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-card shadow-md border border-border animate-float" style={{ animationDelay: "2s" }}>
                <p className="text-sm font-semibold text-primary">Courcelles</p>
              </div>
              <div className="absolute bottom-12 -left-4 px-4 py-2 rounded-xl bg-card shadow-md border border-border animate-float" style={{ animationDelay: "1.5s" }}>
                <p className="text-sm font-semibold text-primary">Lobbes</p>
              </div>
              <div className="absolute top-1/2 -right-8 px-4 py-2 rounded-xl bg-card shadow-md border border-border animate-float" style={{ animationDelay: "0.5s" }}>
                <p className="text-sm font-semibold text-primary">Mont-sur-Marchienne</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
