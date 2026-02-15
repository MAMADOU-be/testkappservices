import { 
  Sparkles, 
  Shirt, 
  CookingPot,
  Home,
  ShoppingCart,
  Car,
  CheckCircle2,
  Clock,
  Users,
  Scissors
} from "lucide-react";
import { ScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/i18n/LanguageContext";

export function Services() {
  const { t } = useLanguage();

  const homeServices = t.services.homeItems;

  const externalServices = [
    { icon: Shirt, title: t.services.external.ironing.title, description: t.services.external.ironing.description },
    { icon: ShoppingCart, title: t.services.external.shopping.title, description: t.services.external.shopping.description },
    { icon: Car, title: t.services.external.transport.title, description: t.services.external.transport.description },
  ];

  const guarantees = [
    { icon: Users, text: t.services.guarantees.same },
    { icon: CheckCircle2, text: t.services.guarantees.replacement },
    { icon: Clock, text: t.services.guarantees.supervisors },
  ];

  const ironingArticles = [
    { article: t.ironingArticles.shirt, points: 5 },
    { article: t.ironingArticles.tshirt, points: 3 },
    { article: t.ironingArticles.pants, points: 4 },
    { article: t.ironingArticles.skirt, points: 3 },
    { article: t.ironingArticles.simpleDress, points: 5 },
    { article: t.ironingArticles.fancyDress, points: 8 },
    { article: t.ironingArticles.jacket, points: 6 },
    { article: t.ironingArticles.sweater, points: 3 },
    { article: t.ironingArticles.singleSheet, points: 4 },
    { article: t.ironingArticles.doubleSheet, points: 6 },
    { article: t.ironingArticles.duvetCover, points: 8 },
    { article: t.ironingArticles.tablecloth, points: 5 },
    { article: t.ironingArticles.pillowcase, points: 2 },
    { article: t.ironingArticles.napkin, points: 1 },
  ];

  const [homeServicesRef, homeVisible, getHomeStyle] = useStaggeredAnimation<HTMLDivElement>(homeServices.length, 50);
  const [externalRef, externalVisible, getExternalStyle] = useStaggeredAnimation<HTMLDivElement>(externalServices.length, 100);

  return (
    <section id="services" className="section-padding">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t.services.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.services.title}
          </h2>
          <p className="text-muted-foreground">
            {t.services.description}
          </p>
        </ScrollAnimation>

        {/* Home Services */}
        <ScrollAnimation animation="fade-up" delay={100} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{t.services.homeTitle}</h3>
              <p className="text-muted-foreground text-sm">{t.services.homeSubtitle}</p>
            </div>
          </div>

          <div ref={homeServicesRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {homeServices.map((service, index) => (
              <div
                key={service}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                style={getHomeStyle(index)}
              >
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm">{service}</span>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* External Services */}
        <ScrollAnimation animation="fade-up" delay={200} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{t.services.externalTitle}</h3>
              <p className="text-muted-foreground text-sm">{t.services.externalSubtitle}</p>
            </div>
          </div>

          <div ref={externalRef} className="grid md:grid-cols-3 gap-6">
            {externalServices.map((service, index) => (
              <div
                key={service.title}
                className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
                style={getExternalStyle(index)}
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{service.title}</h4>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* Ironing Details */}
        <ScrollAnimation animation="fade-up" delay={300} className="bg-secondary/50 rounded-2xl p-8 mb-16">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-primary" />
            {t.services.ironingSection.title}
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground mb-8">
            <div>
              <p className="mb-3">{t.services.ironingSection.desc1} <strong className="text-foreground">{t.services.ironingSection.desc1Bold}</strong> {t.services.ironingSection.desc1End}</p>
              <p className="mb-3">{t.services.ironingSection.desc2} <strong className="text-foreground">{t.services.ironingSection.desc2Bold}</strong> {t.services.ironingSection.desc2End}</p>
              <p>{t.services.ironingSection.desc3}</p>
            </div>
            <div>
              <p className="mb-3">{t.services.ironingSection.desc4} <strong className="text-foreground">{t.services.ironingSection.desc4Bold}</strong>{t.services.ironingSection.desc4End}</p>
              <p className="mb-3">{t.services.ironingSection.desc5}</p>
              <p><strong className="text-foreground">{t.services.ironingSection.desc6}</strong>{t.services.ironingSection.desc6End}</p>
            </div>
          </div>

          {/* Barème de points */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              {t.services.ironingSection.scaleTitle}
              <span className="text-xs font-normal text-muted-foreground">{t.services.ironingSection.scaleSubtitle}</span>
            </h4>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="text-left px-4 py-3 font-semibold text-foreground">{t.services.ironingSection.article}</th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">{t.services.ironingSection.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {ironingArticles.map((item, index) => (
                    <tr
                      key={item.article}
                      className={index % 2 === 0 ? "bg-card" : "bg-secondary/30"}
                    >
                      <td className="px-4 py-2.5 text-foreground">{item.article}</td>
                      <td className="px-4 py-2.5 text-center font-medium text-primary">{item.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground italic">
              {t.services.ironingSection.scaleNote}
            </p>
          </div>
        </ScrollAnimation>

        {/* Guarantees */}
        <ScrollAnimation animation="fade-up" delay={400} className="flex flex-wrap justify-center gap-6">
          {guarantees.map((item) => (
            <div key={item.text} className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/10">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-foreground text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </ScrollAnimation>
      </div>
    </section>
  );
}
