import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Shirt, FileSignature, ListChecks, User, Download, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const formSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(100),
  lastName: z.string().trim().min(1, "Nom requis").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(1, "Téléphone requis").max(20),
  street: z.string().trim().min(1, "Adresse requise").max(200),
  city: z.string().trim().min(1, "Ville requise").max(100),
  postalCode: z.string().trim().min(1, "Code postal requis").max(10),
  agency: z.string().min(1, "Choisissez une agence"),
  foldingPreference: z.string().min(1, "Choisissez une préférence"),
  starchPreference: z.string().min(1, "Choisissez une option"),
  specialCare: z.string().max(500).optional(),
  fragileItems: z.string().max(500).optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions" }),
  }),
});

type FormData = z.infer<typeof formSchema>;

const agencies = [
  { value: "courcelles", label: "Courcelles" },
  { value: "mont-sur-marchienne", label: "Mont-sur-Marchienne" },
  { value: "lobbes", label: "Lobbes" },
];

const foldingOptions = [
  { value: "folded", label: "Plié" },
  { value: "hangers", label: "Sur cintres" },
  { value: "mixed", label: "Mixte (chemises sur cintres, reste plié)" },
];

const starchOptions = [
  { value: "none", label: "Sans amidon" },
  { value: "light", label: "Amidon léger" },
  { value: "medium", label: "Amidon moyen" },
  { value: "strong", label: "Amidon fort" },
];

export function IroningRegistrationForm() {
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
      agency: "",
      foldingPreference: "",
      starchPreference: "",
      specialCare: "",
      fragileItems: "",
    },
  });

  // Pre-fill form with user profile data when available
  useEffect(() => {
    if (user && profile) {
      const nameParts = (profile.display_name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      if (firstName && !form.getValues("firstName")) {
        form.setValue("firstName", firstName);
      }
      if (lastName && !form.getValues("lastName")) {
        form.setValue("lastName", lastName);
      }
      if (user.email && !form.getValues("email")) {
        form.setValue("email", user.email);
      }
      if (profile.phone && !form.getValues("phone")) {
        form.setValue("phone", profile.phone);
      }
    }
  }, [user, profile, form]);

  // Scroll to first error on validation failure
  useEffect(() => {
    const errors = form.formState.errors;
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      const el = document.querySelector(`[name="${firstErrorKey}"]`) 
        || document.getElementById(firstErrorKey);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        (el as HTMLElement).focus?.();
      }
    }
  }, [form.formState.submitCount]);

  const onSubmit = async (data: FormData) => {
    setIsSuccess(false);
    if (!signature) {
      toast.error("Veuillez signer le formulaire avant de soumettre.");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        "Inscription repassage envoyée ! Nous vous contacterons sous 48h."
      );
      // Only reset desiderata + signature, keep personal info
      form.setValue("agency", "");
      form.setValue("foldingPreference", "");
      form.setValue("starchPreference", "");
      form.setValue("specialCare", "");
      form.setValue("fragileItems", "");
      form.setValue("acceptTerms", false as any);
      setSignature(null);
      setIsSuccess(true);
    } catch {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="ironing-registration" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Inscription repassage
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Contrat de repassage en atelier
          </h2>
          <p className="text-muted-foreground">
            Remplissez ce formulaire pour vous inscrire au service de repassage.
            Précisez vos préférences et signez numériquement votre contrat.
          </p>
        </ScrollAnimation>

        <ScrollAnimation animation="fade-up" delay={100}>
          <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border/50 p-6 md:p-8">
            {/* Contract download links */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 p-4 rounded-xl bg-secondary/40 border border-border/50">
              <div className="text-sm text-muted-foreground mb-2 sm:mb-0 sm:mr-auto flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Télécharger les contrats :</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="/contrats/convention-repassage-2025.docx"
                  download
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Convention repassage
                </a>
                <a
                  href="/contrats/convention-titres-services-2025.docx"
                  download
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Convention titres-services
                </a>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Coordonnées */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground font-sans">
                      Vos coordonnées
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Marie" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="marie@exemple.be"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+32 4XX XX XX XX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Rue de la Station 12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input placeholder="6180" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Courcelles" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Section 2: Agence et Desiderata */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <ListChecks className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground font-sans">
                      Vos préférences (Desiderata)
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="agency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agence de dépôt</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir une agence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {agencies.map((a) => (
                                <SelectItem key={a.value} value={a.value}>
                                  {a.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="foldingPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Préférence de pliage</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {foldingOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="starchPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amidon</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {starchOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="fragileItems"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Articles délicats</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: chemises en soie, nappes brodées..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialCare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions spéciales</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ex: ne pas repasser les logos, température basse sur le lin..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Section 3: Signature */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground font-sans">
                      Signature du contrat
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    En signant ci-dessous, vous acceptez les conditions du service de
                    repassage en atelier et confirmez l'exactitude des informations
                    fournies. Le contrat signé sera envoyé à notre bureau central pour
                    validation.
                  </p>

                  <SignatureCanvas onSignatureChange={setSignature} />

                  {!signature && form.formState.isSubmitted && (
                    <p className="text-sm text-destructive mt-2">
                      La signature est requise
                    </p>
                  )}
                </div>

                {/* Conditions */}
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/50 p-4 bg-secondary/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          J'accepte les conditions générales du service de repassage
                          et j'autorise le traitement de mes données personnelles
                          conformément au RGPD.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Error indicator */}
                {!isSuccess && form.formState.isSubmitted && (Object.keys(form.formState.errors).length > 0 || (!signature)) && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>
                      Des erreurs ont été détectées dans le formulaire. Veuillez vérifier et corriger les champs indiqués en rouge ci-dessus.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-8 py-3 text-base"
                  >
                    <Shirt className="w-5 h-5 mr-2" />
                    {isSubmitting
                      ? "Envoi en cours..."
                      : "Soumettre mon inscription"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
