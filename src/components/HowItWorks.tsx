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

const steps = [
  {
    icon: CreditCard,
    step: "01",
    title: "Inscrivez-vous sur Pluxee",
    description: "Inscription gratuite sur la plateforme de votre région pour obtenir vos titres-services."
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Contactez-nous",
    description: "Appelez-nous au 071 84 01 84 ou remplissez notre formulaire de demande."
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Rencontrez votre aide-ménagère",
    description: "Nos encadrantes sélectionnent une aide-ménagère adaptée à vos besoins."
  },
  {
    icon: Euro,
    step: "04",
    title: "Payez simplement",
    description: "1 titre = 1 heure. Seulement 9€ après déduction fiscale pour les 150 premiers !"
  }
];

const regions = [
  { name: "Wallonie", url: "https://extranet.wallonie-titres-services.be/Public/Users/Registration?lang=fr/" },
  { name: "Bruxelles-Capital", url: "https://extranet.titresservices.brussels/Public/Users/Registration?lang=fr" },
  { name: "Flandre", url: "https://extranet.dienstencheques-vlaanderen.be/Public/Users/Registration?lang=nl" },
];

const userAdvantages = [
  { icon: Euro, text: "Réduction d'impôt de 10% sur les 150 premiers titres" },
  { icon: ShieldCheck, text: "Travailleur couvert en cas d'accident" },
  { icon: FileText, text: "Aucun contrat requis de votre part" },
];

const workerAdvantages = [
  { icon: BadgeCheck, text: "Vrai contrat de travail" },
  { icon: Heart, text: "Protection sociale complète" },
  { icon: Clock, text: "Congés payés et pension" },
];

export function HowItWorks() {
  return (
    <section id="comment" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple et économique
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-muted-foreground">
            Le système des titres-services vous permet de bénéficier d'une aide-ménagère déclarée 
            pour un prix avantageux grâce à la déduction fiscale.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
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
        <div className="bg-card rounded-2xl p-6 mb-12 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Inscrivez-vous sur Pluxee (gratuit)
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {regions.map((region) => (
              <a
                key={region.name}
                href={region.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 text-foreground font-medium transition-colors"
              >
                {region.name}
                <ExternalLink className="w-4 h-4 text-primary" />
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Besoin d'aide ? Appelez-nous au <strong className="text-foreground">071 45 57 45</strong> et nous vous inscrirons.
          </p>
        </div>

        {/* Detailed Accordion */}
        <Accordion type="single" collapsible className="mb-12">
          <AccordionItem value="formats" className="bg-card rounded-xl border border-border px-6 mb-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Formats des titres-services</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold text-foreground mb-2">📄 Titre-service papier</h4>
                  <p className="text-sm">Chèque à dater du jour de la prestation, à signer et à donner à l'aide-ménagère.</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <h4 className="font-semibold text-foreground mb-2">📱 Titre-service électronique</h4>
                  <p className="text-sm">Transmission via internet. Les prestations sont encodées par l'aide-ménagère et validées automatiquement après 10 jours.</p>
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
                <span className="font-semibold text-foreground">Tarifs et quotas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="font-semibold text-foreground mb-1">1 titre-service = 10€ = 1 heure de prestation</p>
                  <p className="text-sm">Réduction d'impôt de 10% pour les 150 premiers titres → <strong className="text-primary">coût réel : 9€/h</strong></p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Quota individuel (max 500/an)</h4>
                    <ul className="space-y-1">
                      <li>• 1-175 titres : 10€</li>
                      <li>• 176-400 titres : 11€</li>
                      <li>• 401-500 titres : 12€</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Quota ménage (max 1000/an)</h4>
                    <ul className="space-y-1">
                      <li>• 1-350 titres : 10€</li>
                      <li>• 351-800 titres : 11€</li>
                      <li>• 801-1000 titres : 12€</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm"><strong>Validité :</strong> 8 mois • <strong>Commande minimum :</strong> 9 titres</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="special" className="bg-card rounded-xl border border-border px-6 mb-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <span className="font-semibold text-foreground">Quotas spéciaux (2000 titres/an)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="mt-4 p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="mb-3">Certaines catégories peuvent commander jusqu'à <strong className="text-foreground">2000 titres-services à 10€/an</strong> :</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Familles monoparentales (déclaration sur l'honneur requise)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Personnes handicapées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Parents d'enfants mineurs handicapés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>Personnes âgées bénéficiant d'une allocation vieillesse</span>
                  </li>
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
                <span className="font-semibold text-foreground">Trouver votre aide-ménagère</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-6">
              <div className="mt-4 space-y-3 text-sm">
                <p>Votre aide-ménagère est <strong className="text-foreground">choisie par nos encadrantes</strong> en fonction de vos besoins spécifiques.</p>
                <p>Un <strong className="text-foreground">entretien préalable</strong> de présentation sera systématiquement organisé avant le début de chaque relation.</p>
                <p>Nos encadrantes gèrent les aléas (congés, maladie) et vous proposent un <strong className="text-foreground">remplacement si nécessaire</strong>.</p>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-4">
                  <p className="text-foreground font-medium">⚠️ Important</p>
                  <p className="text-sm">L'aide-ménagère n'est pas habilitée à accepter un changement d'horaire. Toute modification doit passer par le bureau.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Advantages */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">✨ Avantages pour vous</h3>
            <div className="space-y-3">
              {userAdvantages.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">💼 Avantages pour le travailleur</h3>
            <div className="space-y-3">
              {workerAdvantages.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
