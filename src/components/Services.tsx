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

const homeServices = [
  "Passer l'aspirateur dans la maison ou l'appartement",
  "Dépoussiérer les meubles",
  "Shampouiner la moquette",
  "Nettoyer les sols et cirer le parquet",
  "Laver les vitres",
  "Laver la salle de bain",
  "Ranger le salon, la cuisine et les chambres",
  "Faire la vaisselle",
  "Préparer les repas",
  "Repasser",
  "Petits travaux de couture occasionnels",
];

const externalServices = [
  { icon: Shirt, title: "Repassage en atelier", description: "Dépôt et récupération sous 48h dans nos agences" },
  { icon: ShoppingCart, title: "Les courses", description: "Accompagnement pour vos achats quotidiens" },
  { icon: Car, title: "Transport PMR", description: "Transport de personnes à mobilité réduite" },
];

const guarantees = [
  { icon: Users, text: "Même aide-ménagère à chaque prestation" },
  { icon: CheckCircle2, text: "Remplacement garanti en cas de maladie" },
  { icon: Clock, text: "Encadrantes disponibles pour toute question" },
];

export function Services() {
  return (
    <section id="services" className="section-padding">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Nos services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Des services adaptés à vos besoins
          </h2>
          <p className="text-muted-foreground">
            Toutes nos aides-ménagères sont motivées, encadrées et formées au préalable 
            avant d'être envoyées seules chez nos clients.
          </p>
        </div>

        {/* Home Services */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Home className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Activités à domicile</h3>
              <p className="text-muted-foreground text-sm">Services réalisés chez vous</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {homeServices.map((service) => (
              <div
                key={service}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground text-sm">{service}</span>
              </div>
            ))}
          </div>
        </div>

        {/* External Services */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Activités extérieures</h3>
              <p className="text-muted-foreground text-sm">Services en dehors de votre domicile</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {externalServices.map((service) => (
              <div
                key={service.title}
                className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{service.title}</h4>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ironing Details */}
        <div className="bg-secondary/50 rounded-2xl p-8 mb-16">
          <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-primary" />
            Le repassage en atelier
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <p className="mb-3">Le repassage est effectué par des <strong className="text-foreground">repasseuses professionnelles</strong> et soignées.</p>
              <p className="mb-3">Déposez vos mannes du <strong className="text-foreground">lundi au samedi</strong> dans nos agences de Courcelles, Mont-sur-Marchienne ou Lobbes.</p>
              <p>Le linge doit être préalablement nettoyé et sec.</p>
            </div>
            <div>
              <p className="mb-3">Récupérez votre manne dans un <strong className="text-foreground">délai de 48h</strong>.</p>
              <p className="mb-3">Vêtements pliés ou mis sur cintres selon votre demande.</p>
              <p><strong className="text-foreground">1 titre-service = 1h00 de repassage</strong>. Un ticket vous est remis après chaque prestation.</p>
            </div>
          </div>
        </div>

        {/* Guarantees */}
        <div className="flex flex-wrap justify-center gap-6">
          {guarantees.map((item) => (
            <div key={item.text} className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/10">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-foreground text-sm font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
