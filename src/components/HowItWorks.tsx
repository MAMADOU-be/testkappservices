import { CreditCard, UserCheck, CalendarCheck, Euro } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    step: "01",
    title: "Commandez vos titres-services",
    description: "Inscrivez-vous sur la plateforme Pluxee (anciennement Sodexo) et commandez vos titres-services."
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Contactez-nous",
    description: "Appelez-nous ou remplissez notre formulaire pour demander une aide-ménagère."
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Planifiez vos prestations",
    description: "Nous organisons ensemble un planning adapté à vos besoins et disponibilités."
  },
  {
    icon: Euro,
    step: "04",
    title: "Payez simplement",
    description: "Un titre = 1 heure de service. Seulement 9€ après déduction fiscale !"
  }
];

export function HowItWorks() {
  return (
    <section id="comment" className="section-padding">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Simple et économique
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground">
            Le système des titres-services vous permet de bénéficier d'une aide-ménagère déclarée 
            pour un prix avantageux grâce à la déduction fiscale.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connector line */}
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

        {/* Price highlight */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Un titre-service = 10€
              </h3>
              <p className="text-muted-foreground">
                Après déduction fiscale, il ne vous coûtera que <strong className="text-primary">9€ par heure</strong> de service.
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground mb-1">Économie réelle</p>
              <p className="text-4xl font-bold text-primary">-10%</p>
            </div>
          </div>
        </div>

        {/* Who can apply */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Qui peut en bénéficier ?
            </h3>
            <p className="text-muted-foreground">
              Toute personne physique majeure domiciliée en Belgique peut faire appel au système 
              des titres-services pour des prestations de travaux à domicile.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-accent/10 border border-accent/20">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              🤱 Jeune maman indépendante ?
            </h3>
            <p className="text-muted-foreground">
              Après votre repos de maternité, vous avez droit à <strong>105 titres-services gratuits</strong> via 
              votre Caisse d'Assurances Sociales !
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
