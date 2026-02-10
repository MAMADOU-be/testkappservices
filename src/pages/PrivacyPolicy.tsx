import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Politique de confidentialité</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Responsable du traitement</h2>
            <p>
              <strong>Kap-Services SRL</strong><br />
              Rue Winston Churchill 212A, 6180 Courcelles<br />
              Email : info@kap-services.be
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Données collectées</h2>
            <p>Nous collectons les données suivantes dans le cadre de nos services :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nom, prénom, adresse</li>
              <li>Numéro de téléphone et adresse email</li>
              <li>Données relatives aux demandes de service (type, fréquence, préférences)</li>
              <li>Données de connexion au compte utilisateur</li>
              <li>Candidatures d'emploi (coordonnées, disponibilités)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Finalités du traitement</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestion des demandes de service titres-services</li>
              <li>Traitement des candidatures d'emploi</li>
              <li>Communication avec nos clients et prospects</li>
              <li>Gestion des comptes utilisateurs</li>
              <li>Amélioration de nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Base légale</h2>
            <p>
              Le traitement de vos données est basé sur votre consentement, l'exécution d'un contrat, 
              ou notre intérêt légitime conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Durée de conservation</h2>
            <p>
              Vos données personnelles sont conservées pendant la durée nécessaire aux finalités 
              pour lesquelles elles ont été collectées, et conformément aux obligations légales en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Droit d'accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement (« droit à l'oubli »)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité de vos données</li>
              <li>Droit d'opposition au traitement</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, contactez-nous à : <strong>info@kap-services.be</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
              protéger vos données personnelles contre tout accès non autorisé, modification, 
              divulgation ou destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité, vous pouvez nous 
              contacter à : <strong>info@kap-services.be</strong> ou par courrier à l'adresse 
              mentionnée ci-dessus.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
