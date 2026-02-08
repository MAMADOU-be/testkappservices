import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollAnimation } from '@/hooks/useScrollAnimation';
import { Receipt, UserCheck, Ticket, Sparkles } from 'lucide-react';

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
    title: 'Titres-services',
    icon: Ticket,
    items: [
      {
        question: "Qu'est-ce qu'un titre-service ?",
        answer:
          "Le titre-service est un moyen de paiement subventionne par la Region qui vous permet de beneficier d'une aide-menagere agreee a un tarif avantageux. Chaque titre correspond a une heure de prestation. Vous pouvez les commander en format papier ou electronique via Pluxee (anciennement Sodexo).",
      },
      {
        question: "Comment commander des titres-services ?",
        answer:
          "Vous devez d'abord vous inscrire aupres de Pluxee via le site de votre Region. En Wallonie, rendez-vous sur le portail Pluxee Wallonie. Une fois inscrit(e), vous pouvez commander vos titres en ligne ou par virement. Le quota annuel est de 500 titres par personne.",
      },
      {
        question: "Quel est le prix d'un titre-service ?",
        answer:
          "En Wallonie, le prix est de 10\u20AC par titre-service. Grace a l'avantage fiscal, vous recuperez jusqu'a 1,80\u20AC par titre, ce qui ramene le cout reel a environ 8,20\u20AC de l'heure. A Bruxelles, le prix est de 9\u20AC avec un avantage fiscal similaire.",
      },
      {
        question: "Titres papier ou electroniques, quelle difference ?",
        answer:
          "Les titres papier doivent etre remis physiquement a votre aide-menagere a chaque visite. Les titres electroniques (e-titres) sont plus pratiques : ils sont debites automatiquement apres chaque prestation. Nous recommandons le format electronique pour simplifier vos demarches.",
      },
    ],
  },
  {
    title: 'Services proposes',
    icon: Sparkles,
    items: [
      {
        question: "Quels services sont couverts par les titres-services ?",
        answer:
          "Les titres-services couvrent le menage a domicile (aspirateur, nettoyage, vaisselle, rangement...), le repassage en atelier ou a domicile, les courses menageres et la preparation de repas. Le transport de personnes a mobilite reduite est egalement couvert.",
      },
      {
        question: "Comment fonctionne le repassage en atelier ?",
        answer:
          "Deposez votre linge propre et sec dans l'une de nos agences (Courcelles, Mont-sur-Marchienne ou Lobbes) du lundi au samedi. Nos repasseuses professionnelles s'en occupent et vous le recuperez sous 48h, plie ou sur cintres selon vos preferences. 1 titre-service = 1h de repassage.",
      },
      {
        question: "Puis-je choisir mon aide-menagere ?",
        answer:
          "Nous attribuons une aide-menagere fixe a chaque client pour garantir un service personnalise et de confiance. Si le courant ne passe pas, vous pouvez demander un changement et nous trouverons une personne plus adaptee a vos attentes.",
      },
      {
        question: "Quelles sont les zones desservies ?",
        answer:
          "Nous intervenons dans la region de Charleroi et ses environs, via nos agences de Courcelles, Mont-sur-Marchienne et Lobbes. Contactez-nous pour verifier que votre adresse est bien dans notre zone de couverture.",
      },
    ],
  },
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
        question: 'Quand dois-je payer mes factures ?',
        answer:
          "Les factures sont envoyees mensuellement et doivent etre reglees dans un delai de 15 jours a reception. Vous pouvez payer par virement bancaire. Les titres-services (papier ou electroniques) doivent etre remis a l'aide-menagere a chaque prestation.",
      },
      {
        question: "Que se passe-t-il si je n'ai plus de titres-services disponibles ?",
        answer:
          "Si vous avez epuise votre quota annuel de titres-services, les heures supplementaires seront facturees au tarif complementaire. Nous vous informerons a l'avance si vous approchez de votre limite pour eviter toute surprise.",
      },
      {
        question: "Quel est l'avantage fiscal des titres-services ?",
        answer:
          "En Wallonie, vous beneficiez d'une deduction fiscale de 1,80\u20AC par titre (sur les 150 premiers titres). A Bruxelles, l'avantage est de 1,35\u20AC par titre. Ces montants sont automatiquement pris en compte lors de votre declaration fiscale annuelle.",
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
