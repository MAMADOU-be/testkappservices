import { 
  Sparkles, 
  Wind, 
  Shirt, 
  CookingPot,
  Home,
  Waves
} from "lucide-react";

const services = [
  {
    icon: Sparkles,
    title: "Nettoyage",
    description: "Entretien complet de votre intérieur avec des produits de qualité"
  },
  {
    icon: Wind,
    title: "Lavage de vitres",
    description: "Des vitres impeccables pour une luminosité optimale"
  },
  {
    icon: Waves,
    title: "Lessive",
    description: "Prise en charge complète de votre linge"
  },
  {
    icon: Shirt,
    title: "Repassage",
    description: "Vêtements parfaitement repassés et pliés"
  },
  {
    icon: Home,
    title: "Tâches domestiques",
    description: "Petits travaux ménagers quotidiens"
  },
  {
    icon: CookingPot,
    title: "Préparation de repas",
    description: "Préparation de plats simples et équilibrés"
  }
];

export function Services() {
  return (
    <section id="services" className="section-padding bg-secondary/50">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Nos services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Des services adaptés à vos besoins
          </h2>
          <p className="text-muted-foreground">
            Nous proposons une gamme complète de services à domicile pour vous simplifier la vie quotidienne.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group p-6 rounded-2xl bg-card card-hover border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
