import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollAnimation } from '@/hooks/useScrollAnimation';
import { Receipt, UserCheck } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  icon: React.ElementType;
  items: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    title: 'Facturation',
    icon: Receipt,
    items: [
      {
        question: 'Comment fonctionne la facturation avec les titres-services ?',
        answer:
          "Chaque heure de prestation correspond a un titre-service. Vous recevez une facture mensuelle recapitulant les prestations effectuees. Le montant a payer est la difference entre le cout total et la valeur des titres-services que vous avez fournis.",
      },
      {
        question: "Quel est le prix d'un titre-service ?",
        answer:
          "Le prix d'un titre-service varie entre 10\u20AC et 12\u20AC selon votre region. En Wallonie, il est de 10\u20AC par titre. De plus, vous beneficiez d'un avantage fiscal pouvant aller jusqu'a 1,80\u20AC par titre, ce qui reduit le cout reel de la prestation.",
      },
      {
        question: 'Quand dois-je payer mes factures ?',
        answer:
          "Les factures sont envoyees mensuellement et doivent etre reglees dans un delai de 15 jours a reception. Vous pouvez payer par virement bancaire. Les titres-services (papier ou electroniques) doivent etre remis a l'aide-menagere a chaque prestation.",
      },
      {
        question: "Que se passe-t-il si je n'ai plus de titres-services disponibles ?",
        answer:
          "Si vous avez epuise votre quota annuel de titres-services, les heures supplementaires seront facturees au tarif complementaire. Nous vous informerons a l'avance si vous approchez de votre limite pour eviter toute surprise.",
      },
    ],
  },
  {
    title: 'Remplacement en cas de maladie',
    icon: UserCheck,
    items: [
      {
        question: "Que se passe-t-il si mon aide-menagere est malade ?",
        answer:
          "En cas de maladie de votre aide-menagere, nous vous proposons systematiquement un remplacement. Notre equipe d'encadrantes organise la substitution le plus rapidement possible pour que votre prestation soit maintenue.",
      },
      {
        question: 'Le remplacement est-il garanti ?',
        answer:
          "Oui, le remplacement est garanti. C'est l'un de nos engagements qualite. Si, dans de rares cas, aucun remplacement n'est possible le jour meme, nous reprogrammons la prestation dans les meilleurs delais sans frais supplementaires.",
      },
      {
        question: "La remplacante connaitra-t-elle mes preferences ?",
        answer:
          "Nous transmettons a la remplacante toutes vos consignes et preferences enregistrees dans votre dossier (produits a utiliser, zones prioritaires, habitudes de rangement). Cela permet d'assurer une continuite de service optimale.",
      },
      {
        question: "Comment suis-je prevenu(e) du remplacement ?",
        answer:
          "Vous etes contacte(e) par telephone ou WhatsApp des que nous sommes informes de l'absence de votre aide-menagere. Nous vous communiquons le nom de la remplacante et confirmons l'horaire de la prestation.",
      },
    ],
  },
];

export function FAQ() {
  return (
    <section id="faq" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions frequentes
          </h2>
          <p className="text-muted-foreground">
            Retrouvez les reponses aux questions les plus courantes sur nos services.
          </p>
        </ScrollAnimation>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {faqCategories.map((category, catIndex) => (
            <ScrollAnimation key={category.title} animation="fade-up" delay={catIndex * 150}>
              <div className="bg-card rounded-2xl border border-border/50 p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-sans">{category.title}</h3>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`${category.title}-${index}`}
                      className="border border-border/30 rounded-xl px-4 data-[state=open]:bg-primary/5 transition-colors"
                    >
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
