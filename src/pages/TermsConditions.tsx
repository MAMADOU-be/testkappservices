import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const TermsConditions = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: "Conditions générales | Kap Services – Titres-Services",
    description: "Conditions générales d'utilisation de Kap Services. Tarifs, prestations, annulations et obligations pour les services de titres-services.",
    canonical: "/conditions-generales",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Conditions générales</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 1 – Objet</h2>
            <p>
              Les présentes conditions générales régissent l'utilisation du site web de Kap-Services SRL 
              et les services proposés dans le cadre du système des titres-services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 2 – Services</h2>
            <p>
              Kap-Services SRL propose des services d'aide-ménagère à domicile et de repassage en 
              atelier dans le cadre du système des titres-services agréé par la Région Wallonne.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 3 – Titres-services</h2>
            <p>
              Le paiement des prestations s'effectue exclusivement par le biais de titres-services. 
              Le client doit être inscrit auprès d'une société émettrice agréée (Pluxee, anciennement Sodexo).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 4 – Annulation</h2>
            <p>
              Toute annulation d'une prestation doit être communiquée au minimum 24 heures à l'avance. 
              En cas d'annulation tardive ou d'absence non signalée, Kap-Services se réserve le droit 
              de facturer la prestation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 5 – Responsabilité</h2>
            <p>
              Kap-Services SRL est assurée en responsabilité civile pour les dommages causés lors 
              des prestations. Le client doit signaler tout dommage dans les 24 heures suivant la 
              prestation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 6 – Compte utilisateur</h2>
            <p>
              La création d'un compte sur le site est gratuite. L'utilisateur est responsable de la 
              confidentialité de ses identifiants de connexion. Kap-Services se réserve le droit de 
              suspendre ou supprimer tout compte en cas d'utilisation abusive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Article 7 – Modification</h2>
            <p>
              Kap-Services SRL se réserve le droit de modifier les présentes conditions générales 
              à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
