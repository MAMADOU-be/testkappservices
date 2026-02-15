import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useActiveSection } from "@/hooks/useActiveSection";

const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#apropos", label: "À propos" },
  { href: "#services", label: "Nos services" },
  { href: "#comment", label: "Comment ça marche" },
  { href: "#agences", label: "Nos agences" },
  { href: "#faq", label: "FAQ" },
  { href: "#jobs", label: "Jobs" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const activeSection = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card shadow-sm' : 'bg-transparent'}`}>
        <div className="container-narrow mx-auto">
          <div className="flex items-center justify-between h-16 md:h-20 px-4">
            {/* Logo */}
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">K</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-foreground">Kap-Services</p>
                <p className="text-xs text-muted-foreground">Titres-services agréés</p>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-3">
              {navLinks.map((link) => {
                const sectionId = link.href.replace('#', '');
                const isActive = activeSection === sectionId;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                    className={`text-[13px] xl:text-sm font-medium transition-colors relative py-1 px-2 rounded-md ${
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-primary rounded-full animate-scale-in" />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                    <Link to="/profile">
                      <UserCircle className="w-4 h-4 mr-1.5" />
                      Mon compte
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" size="sm" className="transition-all duration-300 hover:scale-105">
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Se connecter
                  </Link>
                </Button>
              )}
              <Button asChild size="sm" className="btn-accent border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <a href="#demande" onClick={(e) => { e.preventDefault(); handleNavClick('#demande'); }}>Demander un devis</a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 relative z-50"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay + menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Slide-in panel */}
        <nav
          className={`absolute top-0 right-0 w-4/5 max-w-sm h-full bg-card shadow-xl transition-transform duration-300 ease-out overflow-y-auto ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-1 pt-20 px-6 pb-8">
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-4 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-primary'
                  }`}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                >
                  {link.label}
                </a>
              );
            })}

            <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2">
              {user ? (
                <>
                  <Button asChild variant="outline">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <UserCircle className="w-4 h-4 mr-2" />
                      Mon compte
                    </Link>
                  </Button>
                  <Button variant="ghost" className="text-muted-foreground" onClick={() => { handleLogout(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Link>
                </Button>
              )}
              <Button asChild className="btn-accent border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <a href="#demande" onClick={(e) => { e.preventDefault(); handleNavClick('#demande'); }}>Demander un devis</a>
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
