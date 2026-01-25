import { Briefcase, Heart, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Heart,
    title: "Contrat stable",
    description: "CDI avec horaires flexibles"
  },
  {
    icon: Users,
    title: "Équipe soudée",
    description: "Ambiance familiale et bienveillante"
  },
  {
    icon: Briefcase,
    title: "Formation",
    description: "Accompagnement et encadrement"
  }
];

export function Recruitment() {
  return (
    <section id="jobs" className="section-padding">
      <div className="container-narrow mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: "var(--gradient-hero)" }}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div className="text-primary-foreground">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
                  <Briefcase className="w-4 h-4" />
                  Nous recrutons
                </span>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Rejoignez notre équipe !
                </h2>
                
                <p className="text-primary-foreground/80 mb-8 max-w-lg">
                  Nous recherchons des aides-ménagères motivées pour rejoindre notre équipe dynamique. 
                  Bénéficiez d'un encadrement professionnel et d'une ambiance de travail conviviale.
                </p>

                <Button className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold">
                  Postuler maintenant
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              {/* Benefits */}
              <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary-foreground">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-primary-foreground/70">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
