import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  usePageMeta({
    title: "Politique de confidentialité | Kap Services – Titres-Services",
    description: "Politique de confidentialité de Kap Services. Découvrez comment nous protégeons vos données personnelles conformément au RGPD.",
    canonical: "/confidentialite",
  });

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
            <h2 className="text-xl font-semibold text-foreground">Identité et coordonnées du responsable du traitement</h2>
            <p>
              KAP-SERVICES SRL est une société de titres-services représentée par son Administrateur, 
              Monsieur Burgeon Patrick. Kap-Services SRL est responsable de certains traitements de données 
              à caractère personnel qu'elle effectue dans le cadre de ses activités.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kap-Services SRL ayant son siège social : rue de la Corderie 3 à 6061 Montignies-sur-Sambre et inscrite à la Banque Carrefour des Entreprises sous le numéro 0898.409.644.</li>
              <li>Kap-Services SRL ayant son siège administratif : rue Winston Churchill 212A à 6180 Courcelles et inscrite à la BCE sous le numéro 0898.409.644.</li>
              <li>Kap-Services SRL, agence de repassage de Lobbes : place Communale 8 à 6540 Lobbes et inscrite à la BCE sous le numéro 0898.409.644.</li>
              <li>Kap-Services SRL, agence de repassage de Mont-sur-Marchienne : avenue Paul Pastur 179F à 6032 Mont-sur-Marchienne et inscrite à la BCE sous le numéro 0898.409.644.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Politique de confidentialité</h2>
            <p>
              Nous respectons votre vie privée et accordons de l'importance à la protection de vos données à caractère personnel.
            </p>
            <p>De manière générale, Kap-Services SRL traite des données à caractère personnel :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>des utilisateurs du site internet « https://www.kap-services.be »</li>
              <li>de toutes personnes entrant en contact avec Kap-Services SRL en utilisant les différents canaux proposés</li>
              <li>lorsque vous manifestez un intérêt pour une fonction au sein de notre société ou encore suite aux relations que vous entretenez avec l'un de nos clients/partenaires</li>
            </ul>
            <p className="mt-3">Cette politique s'applique :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>dans les relations avec les clients (ou personnes de contact) et prospects</li>
              <li>avec les fournisseurs ou partenaires</li>
              <li>avec les visiteurs de notre site internet</li>
              <li>avec les postulants dans le cadre de notre recrutement de personnel</li>
            </ul>
            <p className="mt-3">Cette politique décrit également l'utilisation que nous faisons des cookies.</p>
            <p>
              En parcourant notre site internet et/ou en sollicitant nos services et/ou en posant votre candidature pour un emploi, 
              vous déclarez avoir pris connaissance de notre politique et acceptez expressément la collecte et le traitement de vos 
              données personnelles de la manière décrite dans ce document.
            </p>
            <p>
              Cette politique peut être amenée à évoluer. Chaque nouvelle version sera automatiquement mise à jour sur notre site internet. 
              Nous vous invitons dès lors à le consulter fréquemment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Provenance et catégories des données</h2>
            <p>
              Lorsque vous entrez en contact avec Kap-Services SRL, vous serez à même de nous fournir certaines données 
              à caractère personnel et ce de différentes manières :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Les données de contact privées : nom, prénom, adresse, email, GSM, téléphone</li>
              <li>Les données de contact professionnel : nom, employeur, titre de la fonction</li>
              <li>Votre parcours professionnel, formation académique, connaissances, intérêts, etc. au cas où vous postulez pour un emploi</li>
              <li>Le statut professionnel, le cas échéant</li>
              <li>Données de facturation : n° de compte bancaire, n° Sodexo</li>
              <li>Informations techniques : adresse IP, localisation, navigateur, données relatives à l'appareil</li>
              <li>Détails de votre visite sur notre site</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Comment sont-elles obtenues ?</h2>
            <p>Nous pouvons obtenir vos données via les canaux suivants :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Interaction directe :</strong> données transmises directement par téléphone ou en agence avec l'un de nos collaborateurs, 
                par le biais du formulaire en ligne, par email, lorsque vous complétez la convention afin de bénéficier d'un(e) aide-ménager(e), 
                en remettant votre carte de visite ou encore via la remise d'un CV
              </li>
              <li>
                <strong>Site, cookies, réseaux sociaux :</strong> en visitant notre site internet
              </li>
              <li>
                <strong>Via des tiers :</strong> nous recevons des données techniques via un prestataire de services statistiques tel que 
                Google basé hors UE. Informations accessibles publiquement par exemple via Google, LinkedIn, Facebook ou autres.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Pourquoi les utilisons-nous ?</h2>

            <h3 className="text-lg font-medium text-foreground mt-4">Prestation de service</h3>
            <p>
              Nous collectons, traitons et conservons des données à caractère personnel dans le cadre des prestations de service. 
              La collecte et le traitement de ces données est en effet nécessaire pour la mise à disposition d'un(e) aide-ménager(e) 
              ainsi que pour nous permettre de veiller à la qualité du service rendu. Cela implique également de traiter les données 
              nécessaires à la facturation de la prestation.
            </p>
            <p>
              Dans ce même cadre, la collecte et le traitement des données à caractère personnel des postulants est nécessaire pour 
              pouvoir contacter, rencontrer et procéder au recrutement de nouveaux collaborateurs et pour analyser et gérer des candidatures.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">Site internet</h3>
            <p>
              Lorsque vous utilisez notre site internet, nous obtenons des informations à votre sujet. Ces informations sont 
              exclusivement traitées pour les prestations de services et leur bonne organisation et pour pouvoir gérer les demandes, 
              candidatures et plaintes éventuellement reçues via notre site, recueillir des statistiques sur l'utilisation de notre site.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">Cookies</h3>
            <p>
              Nous obtenons également des informations sur la manière dont vous utilisez notre site par le biais de cookies. 
              Un cookie est un petit fichier texte enregistré par le serveur d'un site internet dans le navigateur de votre appareil 
              lorsque vous consultez ce site. Les cookies peuvent être placés par le serveur de notre site internet que vous visitez. 
              Le serveur de notre site internet ne peut lire que les cookies qu'il a lui-même placés. Il n'a accès à aucune autre 
              information se trouvant sur votre appareil. Les cookies sont stockés sur votre appareil, dans le répertoire de votre navigateur.
            </p>
            <p>
              Les cookies assurent une interaction généralement plus aisée et plus rapide entre le visiteur et le site internet. 
              De plus, ils aident le visiteur à naviguer entre les différentes parties du site.
            </p>
            <p>
              Vous pouvez configurer les paramètres de votre navigateur pour recevoir un message dès qu'un cookie est installé ou 
              pour désactiver l'utilisation des cookies. Si vous refusez les cookies, vous ne pourrez cependant pas, dans certains cas, 
              profiter de toutes les fonctionnalités du site internet. Vous pouvez en outre indiquer que vous acceptez ou non que le 
              site internet installe des cookies de suivi sur votre ordinateur et vous pouvez modifier ce choix à tout moment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Durée de conservation</h2>
            <p>
              La durée de conservation de vos données dépend de la catégorie à laquelle elles appartiennent. Ces périodes de 
              conservation sont déterminées en tenant compte des lois et règlements applicables en matière de protection des données 
              ainsi que de la finalité pour laquelle ces données sont traitées.
            </p>
            <p>En règle générale, voici les principes applicables en matière de durée de conservation de vos données :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pas de conservation plus longtemps que nécessaire au regard de la finalité poursuivie</li>
              <li>5 ans pour les données obtenues via notre site internet et pour les données des clients à partir de la dernière prestation</li>
              <li>3 ans à partir de la communication des données pour les données d'un candidat postulant</li>
            </ul>
            <p className="mt-3">
              La durée de conservation effective des données à caractère personnel pourra être supérieure aux délais mentionnés 
              ci-dessus uniquement dans les cas où la loi nous impose un délai de conservation plus long.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Qui a accès aux données que nous collectons ?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nos employés ont accès aux données de contact que vous nous avez communiquées.</li>
              <li>Nos aide-ménager(ère)s ont accès à vos données de contact uniquement s'il est prévu qu'ils interviennent à votre domicile.</li>
              <li>
                Des tiers ont accès à certaines données uniquement si ces derniers sont intéressés à la réalisation du contrat. 
                Il s'agit par exemple des avocats, agences de recouvrement, huissiers de justice, compagnies d'assurances et banques. 
                Le cas échéant, seules les données strictement nécessaires au but poursuivi seront transmises.
              </li>
            </ul>
            <p className="mt-3">
              Ces données ne seront jamais vendues, partagées ou communiquées à des tiers en dehors des cas prévus par la présente 
              politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Quels droits pouvez-vous exercer ?</h2>
            <p>Vous pouvez demander :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>un aperçu des données personnelles que nous conservons à votre sujet ;</li>
              <li>de faire corriger les données erronées et/ou supprimer également les données qui ne sont plus pertinentes ;</li>
              <li>
                de limiter l'utilisation des données à caractère personnel ou vous opposer à une utilisation de ces données 
                (pour autant évidemment que cela ne rende pas impossible l'exécution du contrat qui nous lierait).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Nous contacter</h2>
            <p>
              Pour exercer ces droits, vous pouvez nous contacter via l'adresse{" "}
              <a href="mailto:direction@kap-services.be" className="text-primary hover:underline font-medium">
                direction@kap-services.be
              </a>{" "}
              en nous communiquant une copie du recto de votre carte d'identité.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
