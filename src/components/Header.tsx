import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "#accueil", label: "Accueil" },
  { href: "#apropos", label: "Qui sommes-nous" },
  { href: "#services", label: "Nos services" },
  { href: "#comment", label: "Comment ça marche" },
  { href: "#agences", label: "Nos agences" },
  { href: "#jobs", label: "Jobs" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container-narrow mx-auto">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-foreground">Kap-Services</p>
              <p className="text-xs text-muted-foreground">Titres-services agréés</p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline" className="transition-all duration-300 hover:scale-105">
              <Link to={user ? "/profile" : "/auth"}>
                <LogIn className="w-4 h-4 mr-2" />
                {user ? "Mon compte" : "Se connecter"}
              </Link>
            </Button>
            <Button asChild className="btn-accent border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <a href="#demande">Demander un devis</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <nav className="lg:hidden pb-4 px-4 animate-fade-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-2 px-4 rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button asChild variant="outline" className="mt-2 transition-all duration-300 hover:scale-105">
                <Link to={user ? "/profile" : "/auth"} onClick={() => setIsOpen(false)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  {user ? "Mon compte" : "Se connecter"}
                </Link>
              </Button>
              <Button asChild className="btn-accent border-0 mt-2 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <a href="#demande">Demander un devis</a>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
