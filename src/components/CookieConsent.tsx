import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Cookie, Shield } from "lucide-react";

export type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
};

const STORAGE_KEY = "cookie_consent";

export function getCookieConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
}

function saveConsent(prefs: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: prefs }));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true });
    setVisible(false);
  };

  const rejectOptional = () => {
    saveConsent({ necessary: true, analytics: false });
    setVisible(false);
  };

  if (!visible) return null;

  const ct = t.cookies;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" />

      <div className="relative pointer-events-auto w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">{ct.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{ct.description}</p>

            {showDetails && (
              <div className="space-y-3 mb-4 p-4 bg-muted/50 rounded-xl text-sm">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{ct.necessaryTitle}</p>
                    <p className="text-muted-foreground">{ct.necessaryDesc}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{ct.analyticsTitle}</p>
                    <p className="text-muted-foreground">{ct.analyticsDesc}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button onClick={acceptAll} className="btn-accent border-0">
                {ct.acceptAll}
              </Button>
              <Button onClick={rejectOptional} variant="outline">
                {ct.rejectOptional}
              </Button>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {showDetails ? ct.hideDetails : ct.showDetails}
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              {ct.learnMore}{" "}
              <Link to="/confidentialite" className="text-primary hover:underline">
                {ct.privacyLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
