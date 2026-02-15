import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/i18n/LanguageContext";

const agenciesData = [
  {
    name: "Courcelles",
    address: "Rue Winston Churchill 212A",
    postalCode: "6180 Courcelles",
    phone: "071 45 57 45",
    mapsQuery: "Rue+Winston+Churchill+212A,+6180+Courcelles,+Belgium",
    hours: [
      { dayKey: "monday", time: "07h30 - 18h" },
      { dayKey: "tuesday", time: "07h30 - 18h" },
      { dayKey: "wednesday", time: "07h30 - 18h" },
      { dayKey: "thursday", time: "07h30 - 18h" },
      { dayKey: "friday", time: "07h30 - 17h" },
      { dayKey: "saturday", time: "08h - 12h15" },
      { dayKey: "sunday", time: null, closed: true },
    ]
  },
  {
    name: "Lobbes",
    address: "Place Communale 8",
    postalCode: "6540 Lobbes",
    phone: "071 45 57 45",
    mapsQuery: "Place+Communale+8,+6540+Lobbes,+Belgium",
    hours: [
      { dayKey: "monday", time: "07h30 - 18h" },
      { dayKey: "tuesday", time: "07h30 - 18h" },
      { dayKey: "wednesday", time: "07h30 - 18h" },
      { dayKey: "thursday", time: "07h30 - 18h" },
      { dayKey: "friday", time: "07h30 - 17h" },
      { dayKey: "saturday", time: "08h - 12h15" },
      { dayKey: "sunday", time: null, closed: true },
    ]
  },
  {
    name: "Mont-sur-Marchienne",
    address: "Avenue Paul Pastur 179, cellule F",
    postalCode: "6032 Mont-sur-Marchienne",
    noteKey: "nearCarrefour",
    phone: "071 45 57 45",
    mapsQuery: "Avenue+Paul+Pastur+179,+6032+Mont-sur-Marchienne,+Belgium",
    hours: [
      { dayKey: "monday", time: "08h30 - 12h45 / 13h45 - 18h" },
      { dayKey: "tuesday", time: "08h30 - 12h45 / 13h45 - 18h" },
      { dayKey: "wednesday", time: "08h30 - 12h45 / 13h45 - 18h" },
      { dayKey: "thursday", time: "08h30 - 12h45 / 13h45 - 18h" },
      { dayKey: "friday", time: "08h30 - 17h" },
      { dayKey: "saturday", time: "08h30 - 12h45" },
      { dayKey: "sunday", time: null, closed: true },
    ]
  }
];

export function Agencies() {
  const { t } = useLanguage();
  const [agenciesRef, agenciesVisible, getAgencyStyle] = useStaggeredAnimation<HTMLDivElement>(agenciesData.length, 150);

  return (
    <section id="agences" className="section-padding bg-secondary/50">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">{t('agencies.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">{t('agencies.title')}</h2>
          <p className="text-muted-foreground">{t('agencies.description')}</p>
        </ScrollAnimation>

        <div ref={agenciesRef} className="grid lg:grid-cols-3 gap-8">
          {agenciesData.map((agency, index) => (
            <div key={agency.name} className="rounded-2xl bg-card card-hover border border-border/50 overflow-hidden" style={getAgencyStyle(index)}>
              <div className="bg-primary p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary-foreground">{agency.name}</h3>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{agency.address}</p>
                      <p>{agency.postalCode}</p>
                      {agency.noteKey && <p className="text-sm italic mt-1">Près du Carrefour Market</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href={`tel:${agency.phone.replace(/\s/g, '')}`} className="font-medium text-foreground hover:text-primary transition-colors">{agency.phone}</a>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${agency.mapsQuery}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />{t('agencies.viewOnMaps')}
                  </a>
                </Button>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-sm uppercase tracking-wider">{t('agencies.schedule')}</span>
                  </div>
                  <Table>
                    <TableBody>
                      {agency.hours.map((schedule) => (
                        <TableRow key={schedule.dayKey} className="border-border/30">
                          <TableCell className="py-2 px-0 font-medium text-foreground">
                            {t(`agencies.days.${schedule.dayKey}`)}
                          </TableCell>
                          <TableCell className={`py-2 px-0 text-right ${schedule.closed ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            {schedule.closed ? t('agencies.closed') : schedule.time}
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
