import { Building2, Users, Award, Heart } from "lucide-react";
import { ScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";

const timeline = [
  { year: "2008", title: "Création", description: "Naissance de Kap-Services SPRL, continuité de l'activité du membre fondateur." },
  { year: "2012", title: "Expansion", description: "Achat du bâtiment du siège administratif et agrandissement des bureaux." },
  { year: "2020", title: "Évolution", description: "Kap-Services SPRL devient Kap-Services SRL." },
  { year: "Aujourd'hui", title: "100+ employés", description: "Une équipe solide au service de votre confort quotidien." },
];

const values = [
  {
    icon: Users,
    title: "Équipe d'encadrement",
    description: "Nos \"Encadrantes\" supervisent et forment continuellement nos aides-ménagères.",
  },
  {
    icon: Award,
    title: "Formation continue",
    description: "Chaque aide-ménagère est formée avant d'intervenir seule et suivie tout au long de l'année.",
  },
  {
    icon: Heart,
    title: "Approche personnalisée",
    description: "Nous prenons le temps de vous rencontrer pour comprendre vos besoins spécifiques.",
  },
  {
    icon: Building2,
    title: "Ancrage local",
    description: "Présents dans le Grand Charleroi, Thuin, Nivelles, Binche et bien d'autres communes.",
  },
];

export function About() {
  const [valuesRef, valuesVisible, getStaggeredStyle] = useStaggeredAnimation<HTMLDivElement>(values.length, 100);

  return (
    <section id="apropos" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <ScrollAnimation animation="fade-up" className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Notre histoire
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Qui sommes-nous ?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Depuis 2008, Kap-Services s'engage à offrir un service de qualité, 
            de confort et de proximité adapté à vos besoins.
          </p>
        </ScrollAnimation>

        {/* Timeline */}
        <ScrollAnimation animation="fade-up" delay={200} className="mb-20">
          <div className="relative">
            {/* Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-primary -translate-x-1/2 z-10" />
                  
                  {/* Content */}
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

        {/* Values */}
        <div ref={valuesRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="bg-card rounded-2xl p-6 card-hover text-center"
              style={getStaggeredStyle(index)}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <value.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Coverage */}
        <ScrollAnimation animation="fade-up" delay={400} className="mt-16 text-center">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Zone desservie :</span>{" "}
            Courcelles, Lobbes, Mont-sur-Marchienne, Grand Charleroi, Nalinnes, Ham-sur-Heure, 
            Viesville, Thuin, Biercée, Anderlues, Nivelles, Binche...
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
}
