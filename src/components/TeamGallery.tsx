import { ScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/i18n/LanguageContext";
import encadrante1 from "@/assets/team/encadrante-1.jpeg";
import encadrante1Work from "@/assets/team/encadrante-1-work.jpeg";
import encadrante2Desk from "@/assets/team/encadrante-2-desk.jpeg";
import encadrante2Work from "@/assets/team/encadrante-2-work.jpeg";
import encadrante2Ironing from "@/assets/team/encadrante-2-ironing.jpeg";

const teamImages = [
  { src: encadrante1, alt: "Encadrante Kap Services au bureau", span: "md:col-span-1 md:row-span-2" },
  { src: encadrante2Desk, alt: "Encadrante Kap Services à l'accueil", span: "md:col-span-1 md:row-span-1" },
  { src: encadrante1Work, alt: "Encadrante Kap Services au repassage", span: "md:col-span-1 md:row-span-1" },
  { src: encadrante2Ironing, alt: "Repassage professionnel Kap Services", span: "md:col-span-1 md:row-span-2" },
  { src: encadrante2Work, alt: "Encadrante Kap Services en action", span: "md:col-span-1 md:row-span-1" },
];

export function TeamGallery() {
  const { t } = useLanguage();

  return (
    <ScrollAnimation animation="fade-up" delay={300} className="my-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t.about?.teamGallery?.title ?? "Notre équipe à votre service"}
        </h3>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t.about?.teamGallery?.description ?? "Des encadrantes dévouées qui veillent à la qualité de nos prestations au quotidien."}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
        {teamImages.map((img, index) => (
          <div
            key={index}
            className={`${img.span} rounded-2xl overflow-hidden group relative`}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </ScrollAnimation>
  );
}
