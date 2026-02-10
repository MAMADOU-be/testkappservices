import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";

const agencies = [
  {
    name: "Courcelles",
    address: "Rue Winston Churchill 212A",
    postalCode: "6180 Courcelles",
    phone: "071 45 57 45",
    mapsQuery: "Rue+Winston+Churchill+212A,+6180+Courcelles,+Belgium",
    hours: [
      { day: "Lundi", time: "07h30 - 18h" },
      { day: "Mardi", time: "07h30 - 18h" },
      { day: "Mercredi", time: "07h30 - 18h" },
      { day: "Jeudi", time: "07h30 - 18h" },
      { day: "Vendredi", time: "07h30 - 17h" },
      { day: "Samedi", time: "08h - 12h15" },
      { day: "Dimanche", time: "Fermé", closed: true },
    ]
  },
  {
    name: "Lobbes",
    address: "Place Communale 8",
    postalCode: "6540 Lobbes",
    phone: "071 45 57 45",
    mapsQuery: "Place+Communale+8,+6540+Lobbes,+Belgium",
    hours: [
      { day: "Lundi", time: "07h30 - 18h" },
      { day: "Mardi", time: "07h30 - 18h" },
      { day: "Mercredi", time: "07h30 - 18h" },
      { day: "Jeudi", time: "07h30 - 18h" },
      { day: "Vendredi", time: "07h30 - 17h" },
      { day: "Samedi", time: "08h - 12h15" },
      { day: "Dimanche", time: "Fermé", closed: true },
    ]
  },
  {
    name: "Mont-sur-Marchienne",
    address: "Avenue Paul Pastur 179, cellule F",
    postalCode: "6032 Mont-sur-Marchienne",
    note: "Près du Carrefour Market",
    phone: "071 45 57 45",
    mapsQuery: "Avenue+Paul+Pastur+179,+6032+Mont-sur-Marchienne,+Belgium",
    hours: [
      { day: "Lundi", time: "08h30 - 12h45 / 13h45 - 18h" },
      { day: "Mardi", time: "08h30 - 12h45 / 13h45 - 18h" },
      { day: "Mercredi", time: "08h30 - 12h45 / 13h45 - 18h" },
      { day: "Jeudi", time: "08h30 - 12h45 / 13h45 - 18h" },
      { day: "Vendredi", time: "08h30 - 17h" },
      { day: "Samedi", time: "08h30 - 12h45" },
      { day: "Dimanche", time: "Fermé", closed: true },
    ]
  }
];

export function Agencies() {
  const [agenciesRef, agenciesVisible, getAgencyStyle] = useStaggeredAnimation<HTMLDivElement>(agencies.length, 150);

  return (
    <section id="agences" className="section-padding bg-secondary/50">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Proximité
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Nos agences
          </h2>
          <p className="text-muted-foreground">
            Présents dans la région de Charleroi, nous sommes proches de vous pour mieux vous servir.
          </p>
        </ScrollAnimation>

        <div ref={agenciesRef} className="grid lg:grid-cols-3 gap-8">
          {agencies.map((agency, index) => (
            <div
              key={agency.name}
              className="rounded-2xl bg-card card-hover border border-border/50 overflow-hidden"
              style={getAgencyStyle(index)}
            >
              <div className="bg-primary p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-foreground">
                    {agency.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{agency.address}</p>
                      <p>{agency.postalCode}</p>
                      {agency.note && (
                        <p className="text-sm italic mt-1">{agency.note}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a 
                    href={`tel:${agency.phone.replace(/\s/g, '')}`} 
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {agency.phone}
                  </a>
                </div>

                {/* Google Maps Link */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${agency.mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur Google Maps
                  </a>
                </Button>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-sm uppercase tracking-wider">Horaires</span>
                  </div>
                  
                  <Table>
                    <TableBody>
                      {agency.hours.map((schedule) => (
                        <TableRow key={schedule.day} className="border-border/30">
                          <TableCell className="py-2 px-0 font-medium text-foreground">
                            {schedule.day}
                          </TableCell>
                          <TableCell 
                            className={`py-2 px-0 text-right ${
                              schedule.closed 
                                ? 'text-destructive font-medium' 
                                : 'text-muted-foreground'
                            }`}
                          >
                            {schedule.time}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
