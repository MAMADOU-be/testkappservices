import { MapPin, Clock, Phone } from "lucide-react";

const agencies = [
  {
    name: "Courcelles",
    address: "Rue Winston Churchill 212A",
    postalCode: "6180 Courcelles",
    phone: "071 84 01 84",
    hours: "Lun-Ven: 8h30-12h00 / 13h00-17h00"
  },
  {
    name: "Mont-sur-Marchienne",
    address: "Rue de la Station 55",
    postalCode: "6032 Mont-sur-Marchienne",
    phone: "071 84 01 84",
    hours: "Lun-Ven: 8h30-12h00 / 13h00-17h00"
  },
  {
    name: "Lobbes",
    address: "Place Communale 12",
    postalCode: "6540 Lobbes",
    phone: "071 84 01 84",
    hours: "Lun-Ven: 8h30-12h00 / 13h00-17h00"
  }
];

export function Agencies() {
  return (
    <section id="agences" className="section-padding bg-secondary/50">
      <div className="container-narrow mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Proximité
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Nos agences
          </h2>
          <p className="text-muted-foreground">
            Présents dans la région de Charleroi, nous sommes proches de vous pour mieux vous servir.
          </p>
        </div>

        {/* Agencies Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {agencies.map((agency) => (
            <div
              key={agency.name}
              className="p-6 rounded-2xl bg-card card-hover border border-border/50"
            >
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {agency.name}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-1 text-primary" />
                  <div>
                    <p>{agency.address}</p>
                    <p>{agency.postalCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <a href={`tel:${agency.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                    {agency.phone}
                  </a>
                </div>
                
                <div className="flex items-start gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4 mt-1 text-primary" />
                  <p>{agency.hours}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
