import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background">
      <div className="container-narrow mx-auto section-padding">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">K</span>
              </div>
              <div>
                <p className="font-semibold">Kap-Services</p>
                <p className="text-xs text-background/60">SRL</p>
              </div>
            </div>
            <p className="text-background/70 text-sm mb-4">{t.footer.description}</p>
            <LanguageSwitcher variant="footer" />
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.navigation}</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#accueil" className="hover:text-primary transition-colors">{t.nav.home}</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">{t.nav.services}</a></li>
              <li><a href="#comment" className="hover:text-primary transition-colors">{t.nav.howItWorks}</a></li>
              <li><a href="#agences" className="hover:text-primary transition-colors">{t.nav.agencies}</a></li>
              <li><a href="#jobs" className="hover:text-primary transition-colors">{t.nav.jobs}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+3271840184" className="hover:text-primary transition-colors">071 84 01 84</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:info@kap-services.be" className="hover:text-primary transition-colors">info@kap-services.be</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-1" />
                <span>Rue Winston Churchill 212A<br />6180 Courcelles</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t.footer.info}</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/mentions-legales" className="hover:text-primary transition-colors">{t.footer.legalMentions}</Link></li>
              <li><Link to="/confidentialite" className="hover:text-primary transition-colors">{t.footer.privacy}</Link></li>
              <li><Link to="/conditions-generales" className="hover:text-primary transition-colors">{t.footer.terms}</Link></li>
              <li className="pt-2 border-t border-background/10 mt-2">
                <a href="/auth" className="hover:text-primary transition-colors">{t.footer.employeeArea}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>© 2012-{new Date().getFullYear()} {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
