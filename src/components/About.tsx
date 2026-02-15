import { Building2, Users, Award, Heart } from "lucide-react";
import { ScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/i18n/LanguageContext";

export function About() {
  const { t } = useLanguage();

  const timeline = [
    { year: "2008", title: t('about.timeline.t2008.title'), description: t('about.timeline.t2008.description') },
    { year: "2012", title: t('about.timeline.t2012.title'), description: t('about.timeline.t2012.description') },
    { year: "2020", title: t('about.timeline.t2020.title'), description: t('about.timeline.t2020.description') },
    { year: t('about.timeline.today.year'), title: t('about.timeline.today.title'), description: t('about.timeline.today.description') },
  ];

  const values = [
    { icon: Users, title: t('about.values.team.title'), description: t('about.values.team.description') },
    { icon: Award, title: t('about.values.training.title'), description: t('about.values.training.description') },
    { icon: Heart, title: t('about.values.personalized.title'), description: t('about.values.personalized.description') },
    { icon: Building2, title: t('about.values.local.title'), description: t('about.values.local.description') },
  ];

  const [valuesRef, valuesVisible, getStaggeredStyle] = useStaggeredAnimation<HTMLDivElement>(values.length, 100);

  return (
    <section id="apropos" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('about.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('about.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('about.description')}
          </p>
        </ScrollAnimation>

        <ScrollAnimation animation="fade-up" delay={200} className="mb-20">
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={item.year} className={`relative flex items-center gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary -translate-x-1/2 z-10" />
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="glass-card p-6 rounded-2xl card-hover">
                      <span className="text-primary font-bold text-lg">{item.year}</span>
                      <h3 className="font-semibold text-foreground mt-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mt-2">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        <div ref={valuesRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div key={value.title} className="bg-card rounded-2xl p-6 card-hover text-center" style={getStaggeredStyle(index)}>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm">{value.description}</p>
            </div>
          ))}
        </div>

        <ScrollAnimation animation="fade-up" delay={400} className="mt-16 text-center">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{t('about.coverage')}</span>{" "}
            {t('about.coverageList')}
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
}
