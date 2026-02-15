import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollAnimation } from '@/hooks/useScrollAnimation';
import { Receipt, UserCheck, Ticket, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

// FAQ content per language
const faqData = {
  fr: [
    {
      categoryKey: 'titresServices',
      icon: Ticket,
      items: [
        { question: "Qu'est-ce qu'un titre-service ?", answer: "Le titre-service est un moyen de paiement subventionné par la Région qui vous permet de bénéficier d'une aide-ménagère agréée à un tarif avantageux. Chaque titre correspond à une heure de prestation. Vous pouvez les commander en format papier ou électronique via Pluxee (anciennement Sodexo)." },
        { question: "Comment commander des titres-services ?", answer: "Vous devez d'abord vous inscrire auprès de Pluxee via le site de votre Région. En Wallonie, rendez-vous sur le portail Pluxee Wallonie. Une fois inscrit(e), vous pouvez commander vos titres en ligne ou par virement. Le quota annuel est de 500 titres par personne." },
        { question: "Quel est le prix d'un titre-service ?", answer: "En Wallonie, le prix est de 10€ par titre-service. Grâce à l'avantage fiscal, vous récupérez jusqu'à 1,80€ par titre, ce qui ramène le coût réel à environ 8,20€ de l'heure. À Bruxelles, le prix est de 9€ avec un avantage fiscal similaire." },
        { question: "Titres papier ou électroniques, quelle différence ?", answer: "Les titres papier doivent être remis physiquement à votre aide-ménagère à chaque visite. Les titres électroniques (e-titres) sont plus pratiques : ils sont débités automatiquement après chaque prestation. Nous recommandons le format électronique pour simplifier vos démarches." },
      ],
    },
    {
      categoryKey: 'servicesOffered',
      icon: Sparkles,
      items: [
        { question: "Quels services sont couverts par les titres-services ?", answer: "Les titres-services couvrent le ménage à domicile (aspirateur, nettoyage, vaisselle, rangement...), le repassage en atelier ou à domicile, les courses ménagères et la préparation de repas. Le transport de personnes à mobilité réduite est également couvert." },
        { question: "Comment fonctionne le repassage en atelier ?", answer: "Déposez votre linge propre et sec dans l'une de nos agences (Courcelles, Mont-sur-Marchienne ou Lobbes) du lundi au samedi. Nos repasseuses professionnelles s'en occupent et vous le récupérez sous 48h, plié ou sur cintres selon vos préférences. 1 titre-service = 1h de repassage." },
        { question: "Puis-je choisir mon aide-ménagère ?", answer: "Nous attribuons une aide-ménagère fixe à chaque client pour garantir un service personnalisé et de confiance. Si le courant ne passe pas, vous pouvez demander un changement et nous trouverons une personne plus adaptée à vos attentes." },
        { question: "Quelles sont les zones desservies ?", answer: "Nous intervenons dans la région de Charleroi et ses environs, via nos agences de Courcelles, Mont-sur-Marchienne et Lobbes. Contactez-nous pour vérifier que votre adresse est bien dans notre zone de couverture." },
      ],
    },
    {
      categoryKey: 'billing',
      icon: Receipt,
      items: [
        { question: "Comment fonctionne la facturation avec les titres-services ?", answer: "Chaque heure de prestation correspond à un titre-service. Vous recevez une facture mensuelle récapitulant les prestations effectuées. Le montant à payer est la différence entre le coût total et la valeur des titres-services que vous avez fournis." },
        { question: "Quand dois-je payer mes factures ?", answer: "Les factures sont envoyées mensuellement et doivent être réglées dans un délai de 15 jours à réception. Vous pouvez payer par virement bancaire. Les titres-services (papier ou électroniques) doivent être remis à l'aide-ménagère à chaque prestation." },
        { question: "Que se passe-t-il si je n'ai plus de titres-services disponibles ?", answer: "Si vous avez épuisé votre quota annuel de titres-services, les heures supplémentaires seront facturées au tarif complémentaire. Nous vous informerons à l'avance si vous approchez de votre limite pour éviter toute surprise." },
        { question: "Quel est l'avantage fiscal des titres-services ?", answer: "En Wallonie, vous bénéficiez d'une déduction fiscale de 1,80€ par titre (sur les 150 premiers titres). À Bruxelles, l'avantage est de 1,35€ par titre. Ces montants sont automatiquement pris en compte lors de votre déclaration fiscale annuelle." },
      ],
    },
    {
      categoryKey: 'replacement',
      icon: UserCheck,
      items: [
        { question: "Que se passe-t-il si mon aide-ménagère est malade ?", answer: "En cas de maladie de votre aide-ménagère, nous vous proposons systématiquement un remplacement. Notre équipe d'encadrantes organise la substitution le plus rapidement possible pour que votre prestation soit maintenue." },
        { question: "Le remplacement est-il garanti ?", answer: "Oui, le remplacement est garanti. C'est l'un de nos engagements qualité. Si, dans de rares cas, aucun remplacement n'est possible le jour même, nous reprogrammons la prestation dans les meilleurs délais sans frais supplémentaires." },
        { question: "La remplaçante connaîtra-t-elle mes préférences ?", answer: "Nous transmettons à la remplaçante toutes vos consignes et préférences enregistrées dans votre dossier (produits à utiliser, zones prioritaires, habitudes de rangement). Cela permet d'assurer une continuité de service optimale." },
        { question: "Comment suis-je prévenu(e) du remplacement ?", answer: "Vous êtes contacté(e) par téléphone ou WhatsApp dès que nous sommes informés de l'absence de votre aide-ménagère. Nous vous communiquons le nom de la remplaçante et confirmons l'horaire de la prestation." },
      ],
    },
  ],
  nl: [
    {
      categoryKey: 'titresServices',
      icon: Ticket,
      items: [
        { question: "Wat is een dienstencheque?", answer: "De dienstencheque is een door het Gewest gesubsidieerd betaalmiddel waarmee u kunt profiteren van een erkende huishoudhulp tegen een voordelig tarief. Elke cheque komt overeen met één uur dienstverlening. U kunt ze bestellen in papieren of elektronisch formaat via Pluxee (voorheen Sodexo)." },
        { question: "Hoe bestel ik dienstencheques?", answer: "U moet zich eerst inschrijven bij Pluxee via de website van uw Gewest. In Wallonië gaat u naar het Pluxee Wallonië-portaal. Eenmaal ingeschreven kunt u uw cheques online of per overschrijving bestellen. Het jaarlijkse quotum is 500 cheques per persoon." },
        { question: "Wat is de prijs van een dienstencheque?", answer: "In Wallonië is de prijs 10€ per dienstencheque. Dankzij het belastingvoordeel recupereert u tot 1,80€ per cheque, wat de werkelijke kost op ongeveer 8,20€ per uur brengt. In Brussel is de prijs 9€ met een vergelijkbaar belastingvoordeel." },
        { question: "Papieren of elektronische cheques, wat is het verschil?", answer: "Papieren cheques moeten fysiek aan uw huishoudhulp worden overhandigd bij elk bezoek. Elektronische cheques (e-cheques) zijn praktischer: ze worden automatisch afgeschreven na elke prestatie. Wij raden het elektronische formaat aan om uw administratie te vereenvoudigen." },
      ],
    },
    {
      categoryKey: 'servicesOffered',
      icon: Sparkles,
      items: [
        { question: "Welke diensten worden gedekt door dienstencheques?", answer: "Dienstencheques dekken huishoudelijk werk aan huis (stofzuigen, schoonmaken, afwassen, opruimen...), strijken in het atelier of aan huis, boodschappen en maaltijdbereiding. Vervoer van personen met beperkte mobiliteit is ook gedekt." },
        { question: "Hoe werkt het strijken in het atelier?", answer: "Breng uw schoon en droog wasgoed naar een van onze agentschappen (Courcelles, Mont-sur-Marchienne of Lobbes) van maandag tot zaterdag. Onze professionele strijksters zorgen ervoor en u haalt het op binnen 48u, gevouwen of op hangers naar uw voorkeur. 1 dienstencheque = 1u strijken." },
        { question: "Kan ik mijn huishoudhulp kiezen?", answer: "Wij wijzen een vaste huishoudhulp toe aan elke klant om een gepersonaliseerde en betrouwbare service te garanderen. Als het niet klikt, kunt u om een wijziging vragen en wij zoeken een persoon die beter bij uw verwachtingen past." },
        { question: "Wat zijn de bediende zones?", answer: "Wij zijn actief in de regio Charleroi en omgeving, via onze agentschappen in Courcelles, Mont-sur-Marchienne en Lobbes. Neem contact met ons op om te controleren of uw adres in ons dekkingsgebied valt." },
      ],
    },
    {
      categoryKey: 'billing',
      icon: Receipt,
      items: [
        { question: "Hoe werkt de facturering met dienstencheques?", answer: "Elk uur prestatie komt overeen met een dienstencheque. U ontvangt een maandelijkse factuur met een overzicht van de uitgevoerde prestaties. Het te betalen bedrag is het verschil tussen de totale kost en de waarde van de door u verstrekte dienstencheques." },
        { question: "Wanneer moet ik mijn facturen betalen?", answer: "Facturen worden maandelijks verstuurd en moeten binnen 15 dagen na ontvangst worden betaald. U kunt betalen via overschrijving. De dienstencheques (papier of elektronisch) moeten bij elke prestatie aan de huishoudhulp worden overhandigd." },
        { question: "Wat gebeurt er als ik geen dienstencheques meer heb?", answer: "Als u uw jaarlijks quotum aan dienstencheques hebt opgebruikt, worden de extra uren gefactureerd tegen het aanvullende tarief. Wij informeren u vooraf als u uw limiet nadert om verrassingen te voorkomen." },
        { question: "Wat is het belastingvoordeel van dienstencheques?", answer: "In Wallonië geniet u een fiscale aftrek van 1,80€ per cheque (op de eerste 150 cheques). In Brussel is het voordeel 1,35€ per cheque. Deze bedragen worden automatisch verrekend bij uw jaarlijkse belastingaangifte." },
      ],
    },
    {
      categoryKey: 'replacement',
      icon: UserCheck,
      items: [
        { question: "Wat gebeurt er als mijn huishoudhulp ziek is?", answer: "Bij ziekte van uw huishoudhulp bieden wij u systematisch een vervanging aan. Ons team van begeleidsters organiseert de vervanging zo snel mogelijk zodat uw prestatie gehandhaafd blijft." },
        { question: "Is de vervanging gegarandeerd?", answer: "Ja, de vervanging is gegarandeerd. Het is een van onze kwaliteitsbeloften. Als er in zeldzame gevallen geen vervanging mogelijk is op dezelfde dag, plannen wij de prestatie zo snel mogelijk opnieuw in zonder extra kosten." },
        { question: "Kent de vervangster mijn voorkeuren?", answer: "Wij bezorgen de vervangster al uw instructies en voorkeuren die in uw dossier zijn geregistreerd (te gebruiken producten, prioritaire zones, opruimgewoonten). Dit zorgt voor een optimale continuïteit van de service." },
        { question: "Hoe word ik op de hoogte gebracht van de vervanging?", answer: "U wordt telefonisch of via WhatsApp gecontacteerd zodra wij op de hoogte zijn van de afwezigheid van uw huishoudhulp. Wij delen u de naam van de vervangster mee en bevestigen het uur van de prestatie." },
      ],
    },
  ],
  en: [
    {
      categoryKey: 'titresServices',
      icon: Ticket,
      items: [
        { question: "What is a service voucher?", answer: "A service voucher is a subsidised payment method by the Region that allows you to benefit from an approved housekeeper at an advantageous rate. Each voucher corresponds to one hour of service. You can order them in paper or electronic format via Pluxee (formerly Sodexo)." },
        { question: "How do I order service vouchers?", answer: "You must first register with Pluxee via your Region's website. In Wallonia, go to the Pluxee Wallonia portal. Once registered, you can order your vouchers online or by bank transfer. The annual quota is 500 vouchers per person." },
        { question: "What is the price of a service voucher?", answer: "In Wallonia, the price is €10 per service voucher. Thanks to the tax advantage, you recover up to €1.80 per voucher, bringing the real cost to around €8.20 per hour. In Brussels, the price is €9 with a similar tax advantage." },
        { question: "Paper or electronic vouchers, what's the difference?", answer: "Paper vouchers must be physically handed to your housekeeper at each visit. Electronic vouchers (e-vouchers) are more practical: they are automatically debited after each service. We recommend the electronic format to simplify your procedures." },
      ],
    },
    {
      categoryKey: 'servicesOffered',
      icon: Sparkles,
      items: [
        { question: "What services are covered by service vouchers?", answer: "Service vouchers cover home cleaning (vacuuming, cleaning, dishes, tidying...), workshop or home ironing, grocery shopping and meal preparation. Transport for persons with reduced mobility is also covered." },
        { question: "How does workshop ironing work?", answer: "Drop off your clean, dry laundry at one of our agencies (Courcelles, Mont-sur-Marchienne or Lobbes) Monday to Saturday. Our professional ironers take care of it and you pick it up within 48h, folded or on hangers as you prefer. 1 service voucher = 1h of ironing." },
        { question: "Can I choose my housekeeper?", answer: "We assign a regular housekeeper to each client to ensure a personalised and trustworthy service. If it doesn't work out, you can request a change and we'll find someone better suited to your expectations." },
        { question: "What areas are served?", answer: "We operate in the Charleroi region and surroundings, through our agencies in Courcelles, Mont-sur-Marchienne and Lobbes. Contact us to check that your address is within our coverage area." },
      ],
    },
    {
      categoryKey: 'billing',
      icon: Receipt,
      items: [
        { question: "How does billing work with service vouchers?", answer: "Each hour of service corresponds to one service voucher. You receive a monthly invoice summarising the services performed. The amount payable is the difference between the total cost and the value of the service vouchers you have provided." },
        { question: "When should I pay my invoices?", answer: "Invoices are sent monthly and must be settled within 15 days of receipt. You can pay by bank transfer. Service vouchers (paper or electronic) must be given to the housekeeper at each service." },
        { question: "What happens if I run out of service vouchers?", answer: "If you have used up your annual quota of service vouchers, additional hours will be invoiced at the supplementary rate. We will inform you in advance if you are approaching your limit to avoid any surprises." },
        { question: "What is the tax advantage of service vouchers?", answer: "In Wallonia, you benefit from a tax deduction of €1.80 per voucher (on the first 150 vouchers). In Brussels, the advantage is €1.35 per voucher. These amounts are automatically taken into account in your annual tax return." },
      ],
    },
    {
      categoryKey: 'replacement',
      icon: UserCheck,
      items: [
        { question: "What happens if my housekeeper is ill?", answer: "In case of illness of your housekeeper, we systematically offer you a replacement. Our team of supervisors organises the substitution as quickly as possible to maintain your service." },
        { question: "Is the replacement guaranteed?", answer: "Yes, the replacement is guaranteed. It is one of our quality commitments. If, in rare cases, no replacement is possible on the same day, we reschedule the service as soon as possible at no extra charge." },
        { question: "Will the replacement know my preferences?", answer: "We pass on to the replacement all your instructions and preferences recorded in your file (products to use, priority areas, tidying habits). This ensures optimal service continuity." },
        { question: "How am I informed of the replacement?", answer: "You are contacted by phone or WhatsApp as soon as we are informed of your housekeeper's absence. We communicate the replacement's name and confirm the service schedule." },
      ],
    },
  ],
};

export function FAQ() {
  const { t, language } = useLanguage();
  const categories = faqData[language] || faqData.fr;

  return (
    <section id="faq" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">{t('faq.badge')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('faq.title')}</h2>
          <p className="text-muted-foreground">{t('faq.description')}</p>
        </ScrollAnimation>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {categories.map((category, catIndex) => (
            <ScrollAnimation key={category.categoryKey} animation="fade-up" delay={catIndex * 150}>
              <div className="bg-card rounded-2xl border border-border/50 p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground font-sans">{t(`faq.categories.${category.categoryKey}`)}</h3>
                </div>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.items.map((item, index) => (
                    <AccordionItem key={index} value={`${category.categoryKey}-${index}`} className="border border-border/30 rounded-xl px-4 data-[state=open]:bg-primary/5 transition-colors">
                      <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-3">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">{item.answer}</AccordionContent>
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
