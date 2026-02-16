import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const LegalMentions = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: "Mentions légales | Kap Services – Titres-Services Belgique",
    description: "Mentions légales de Kap Services SRL, agence agréée de titres-services. Informations sur l'hébergement, les droits d'auteur et les conditions d'utilisation.",
    canonical: "/mentions-legales",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Mentions légales</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Hébergement</h2>
            <p>
              L'hébergement est assuré par Gandi SAS<br />
              63 - 65 Boulevard Massena<br />
              75013 Paris<br />
              <a href="https://www.gandi.net/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.gandi.net/</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">La société</h2>

            <h3 className="text-lg font-medium text-foreground mt-4">Siège social</h3>
            <p>
              Kap-Services SRL<br />
              Rue de la Corderie 3<br />
              6061 Montignies-sur-Sambre
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">Siège administratif</h3>
            <p>
              Kap-Services SRL<br />
              Rue Winston Churchill 212A<br />
              6180 Courcelles
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">Administrateur de la société</h3>
            <p>Monsieur Burgeon Patrick</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Propriété intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation belge et internationale sur les droits d'auteur 
              et les droits de propriété littéraire et artistique.
            </p>
            <p>
              L'accès par l'utilisateur aux informations du site ne peut être interprété comme lui conférant 
              une licence ou un droit autre que celui de consulter le site.
            </p>
            <p>Tous les droits de reproduction sont réservés, y compris les représentations iconographiques et photographiques.</p>
            <p>
              En accord avec les lois régissant la propriété intellectuelle, la reproduction ou l'utilisation 
              des éléments se trouvant dans ce site internet, en totalité ou en partie est strictement interdite. 
              Ainsi, tous les textes, photos, logos, marques et autres éléments reproduits sur ce site sont réservés 
              et protégés par le droit de la propriété intellectuelle (droit d'auteur, droit voisin, droit des marques…).
            </p>
            <p>
              Le non-respect de cette interdiction est susceptible de constituer un acte de contrefaçon engageant 
              les responsabilités civiles et pénales de tout contrevenant. Kap-Services SRL prévient qu'elle fera 
              respecter ses droits de propriété intellectuelle par tous les moyens légaux mis à sa disposition.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Liens hypertexte</h2>
            <p>
              Les liens hypertextes présents sur le site internet « www.kap-services.be » orientant les internautes 
              vers d'autres sites internet n'engagent pas la responsabilité de Kap-Services SRL, quant au contenu 
              de ces sites et des sites vers lesquels de nouveaux liens pourraient renvoyer.
            </p>
            <p>
              Toute personne physique ou morale souhaitant établir un lien hypertexte pointant vers le site internet 
              « www.kap-services.be » doit préalablement obtenir l'autorisation expresse et préalable de Kap-Services SRL.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Confidentialité</h2>
            <p>
              Kap-Services SRL n'enregistre pas d'informations personnelles permettant l'identification, à l'exception 
              des formulaires que l'utilisateur est libre de remplir. Ces informations ne seront pas utilisées sans 
              votre accord, nous les utiliserons seulement pour vous adresser des courriers, des brochures, des devis 
              ou vous contacter.
            </p>
            <p>
              Les informations recueillies sur les sites bénéficient de la protection de la loi « Informatique et 
              Libertés » n° 78-17 du 06 janvier 1978. Elles bénéficient d'un droit d'accès, de rectification, 
              d'opposition à communication et de suppression sur simple demande à Kap-Services SRL, rue Winston 
              Churchill 212A, 6180 Courcelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Responsabilité</h2>
            <p>
              Kap-Services SRL décline toute garantie, expresse ou tacite, concernant tout ou partie de son site 
              internet « www.kap-services.be ». Kap-Services fera ses meilleurs efforts afin de présenter sur le 
              site des informations précises et à jour mais ne donne aucune garantie sur ce point ; elle ne pourra 
              être tenue responsable de quelque erreur ou omission que ce soit affectant le contenu du site.
            </p>
            <p>
              En aucun cas, Kap-Services SRL ne peut être tenue pour responsable d'un quelconque dommage direct ou 
              indirect, quelle qu'en soit la nature, découlant de l'utilisation de son site internet 
              « www.kap-services.be », ou au contraire de l'impossibilité d'y accéder.
            </p>
            <p>
              Kap-Services SRL décline toute responsabilité concernant l'accès et le contenu des sites internet liés 
              au site internet « www.kap-services.be », et des sites internet vers lesquels de nouveaux liens 
              pourraient renvoyer.
            </p>
            <p>
              Kap-Services SRL se réserve le droit de modifier sans préavis tout élément du site et ne peut être 
              tenue responsable des conséquences potentielles de ces changements. Elle ne peut non plus être tenue 
              responsable en cas de difficultés d'accès au site ou d'interruptions de connexion.
            </p>
            <p>
              Kap-Services SRL se réserve le droit de suspendre et/ou arrêter la diffusion du site internet 
              « www.kap-services.be », de façon unilatérale, sans préavis, et sans que sa responsabilité puisse 
              être recherchée de quelque manière et pour quelque cause que ce soient.
            </p>
            <p>
              D'une manière générale, Kap-Services SRL décline toute responsabilité en cas de dommages directs ou 
              indirects, quelles qu'en soient les causes, origines, nature ou conséquences, provoqués à raison de 
              l'accès au site ou de l'utilisation des informations de ce site et l'utilisateur assume la pleine 
              responsabilité et les risques qui peuvent en résulter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Modification des mentions légales</h2>
            <p>
              Kap-Services SRL se réserve le droit de modifier de façon unilatérale et sans préavis, les présentes 
              mentions légales.
            </p>
            <p>
              Kap-Services SRL invite donc les internautes à consulter régulièrement les présentes mentions légales 
              afin de se tenir informés des éventuelles modifications apportées.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalMentions;
