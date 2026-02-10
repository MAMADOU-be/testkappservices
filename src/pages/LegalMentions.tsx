import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LegalMentions = () => {
  const navigate = useNavigate();

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
            <h2 className="text-xl font-semibold text-foreground">Éditeur du site</h2>
            <p>
              <strong>Kap-Services SRL</strong><br />
              Rue Winston Churchill 212A<br />
              6180 Courcelles, Belgique<br />
              Tél : 071 45 57 45<br />
              Email : info@kap-services.be<br />
              N° d'entreprise : BE 0847.632.505
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Agrément</h2>
            <p>
              Kap-Services SRL est une société agréée titres-services en Région Wallonne depuis 2012.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Responsabilité</h2>
            <p>
              Kap-Services SRL s'efforce de fournir des informations exactes et à jour sur ce site. 
              Toutefois, la société ne peut garantir l'exactitude, la complétude ou l'actualité des 
              informations publiées. Kap-Services SRL ne pourra être tenue responsable des dommages 
              résultant de l'utilisation des informations contenues sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, etc.) 
              est la propriété exclusive de Kap-Services SRL, sauf mention contraire. Toute 
              reproduction, distribution ou utilisation sans autorisation préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Droit applicable</h2>
            <p>
              Le présent site et ses mentions légales sont régis par le droit belge. En cas de 
              litige, les tribunaux de l'arrondissement judiciaire de Charleroi seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalMentions;
