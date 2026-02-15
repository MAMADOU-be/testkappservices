import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Phone, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

const formSchema = z.object({
  nom: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  prenom: z.string().trim().min(2, "Le prénom doit contenir au moins 2 caractères").max(100),
  rue: z.string().trim().min(2, "La rue est requise").max(200),
  numero: z.string().trim().min(1, "Le numéro est requis").max(20),
  codePostal: z.string().regex(/^\d{4}$/, "Code postal invalide (4 chiffres)"),
  localite: z.string().trim().min(2, "La localité est requise").max(100),
  telephone: z.string().regex(/^[\d\s\+\-\.]{9,20}$/, "Numéro de téléphone invalide"),
  email: z.string().trim().email("Adresse email invalide").max(255),
  inscritPluxee: z.enum(["oui", "non"], { required_error: "Veuillez indiquer si vous êtes inscrit" }),
  numeroPluxee: z.string().optional(),
  heuresParSemaine: z.string().min(1, "Veuillez sélectionner le nombre d'heures"),
  joursPreference: z.array(z.string()).min(1, "Veuillez sélectionner au moins un jour"),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const heuresOptions = [
  { value: "3", label: "3 heures" },
  { value: "4", label: "4 heures" },
  { value: "5", label: "5 heures" },
  { value: "6", label: "6 heures" },
  { value: "7", label: "7 heures" },
  { value: "8", label: "8 heures" },
  { value: "9", label: "9 heures" },
  { value: "10", label: "10 heures" },
  { value: "11", label: "11 heures" },
  { value: "12", label: "12 heures" },
  { value: "+12", label: "Plus de 12 heures" },
];

const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

export function RequestForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const joursOptions = dayKeys.map(key => ({
    id: key,
    label: t.requestForm.days[key],
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      rue: "",
      numero: "",
      codePostal: "",
      localite: "",
      telephone: "",
      email: "",
      inscritPluxee: undefined,
      numeroPluxee: "",
      heuresParSemaine: "",
      joursPreference: [],
      message: "",
    },
  });

  const inscritPluxee = form.watch("inscritPluxee");
  const [honeypot, setHoneypot] = useState("");

  const onSubmit = async (data: FormData) => {
    if (honeypot) {
      setIsSubmitted(true);
      return;
    }
    setIsSubmitting(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('submit-service-request', {
        body: {
          first_name: data.prenom,
          last_name: data.nom,
          email: data.email,
          phone: data.telephone,
          street: `${data.rue} ${data.numero}`,
          city: data.localite,
          postal_code: data.codePostal,
          service_type: data.inscritPluxee === 'oui' ? `Pluxee: ${data.numeroPluxee || 'N/A'}` : 'Standard',
          frequency: `${data.heuresParSemaine}h/semaine`,
          preferred_day: data.joursPreference.join(', '),
          comments: data.message || null,
          website: honeypot,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setIsSubmitted(true);
      setTimeout(() => {
        document.getElementById('demande')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      toast({
        title: t.requestForm.successTitle,
        description: t.requestForm.successDescription,
      });
    } catch (error) {
      const message = error instanceof Error && error.message.includes('Trop de demandes')
        ? error.message
        : "Une erreur est survenue. Veuillez réessayer.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="demande" className="section-padding bg-secondary/30">
        <div className="container-narrow mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t.requestForm.successTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t.requestForm.successDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => { setIsSubmitted(false); form.reset(); }} className="btn-accent border-0">
                <Send className="w-4 h-4 mr-2" />
                {t.requestForm.newRequest}
              </Button>
              <Button variant="outline" asChild>
                <a href="#ironing-registration">
                  {t.requestForm.signContract}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="demande" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t.requestForm.badge}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.requestForm.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.requestForm.description}
            <br />
            {t.requestForm.callUs}{" "}
            <a href="tel:+3271455745" className="text-primary font-semibold hover:underline">
              071 45 57 45
            </a>
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Coordonnées */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  {t.requestForm.coordinates}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t.requestForm.allFieldsRequired}
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="nom" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.lastName}</FormLabel>
                      <FormControl><Input placeholder={t.contact.lastNamePlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="prenom" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.firstName}</FormLabel>
                      <FormControl><Input placeholder={t.contact.firstNamePlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="rue" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.street}</FormLabel>
                      <FormControl><Input placeholder={t.common.street} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="numero" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.number}</FormLabel>
                      <FormControl><Input placeholder="N°" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="codePostal" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.postalCode}</FormLabel>
                      <FormControl><Input placeholder="6000" maxLength={4} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="localite" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.city}</FormLabel>
                      <FormControl><Input placeholder={t.common.city} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telephone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.phone}</FormLabel>
                      <FormControl><Input placeholder={t.contact.phonePlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.common.email}</FormLabel>
                      <FormControl><Input type="email" placeholder={t.contact.emailPlaceholder} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Concernant votre demande */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {t.requestForm.aboutRequest}
                </h3>

                <div className="space-y-6">
                  <FormField control={form.control} name="inscritPluxee" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.requestForm.registeredPluxee}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="oui" id="pluxee-oui" />
                            <label htmlFor="pluxee-oui" className="text-sm cursor-pointer">{t.requestForm.yes}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non" id="pluxee-non" />
                            <label htmlFor="pluxee-non" className="text-sm cursor-pointer">{t.requestForm.no}</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {inscritPluxee === "oui" && (
                    <FormField control={form.control} name="numeroPluxee" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.requestForm.pluxeeNumber}</FormLabel>
                        <FormControl><Input placeholder={t.requestForm.pluxeePlaceholder} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  <FormField control={form.control} name="heuresParSemaine" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.requestForm.hoursPerWeek}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t.requestForm.choose} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {heuresOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="joursPreference" render={() => (
                    <FormItem>
                      <FormLabel>{t.requestForm.preferredDays}</FormLabel>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {joursOptions.map((jour) => (
                          <FormField
                            key={jour.id}
                            control={form.control}
                            name="joursPreference"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(jour.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, jour.id])
                                        : field.onChange(field.value?.filter((value) => value !== jour.id));
                                    }}
                                  />
                                </FormControl>
                                <label className="text-sm cursor-pointer">{jour.label}</label>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Message */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  {t.requestForm.messageOptional}
                </h3>

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contact.yourMessage}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.requestForm.messagePlaceholder} className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Honeypot anti-spam field */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="text-center">
                <Button
                  type="submit" 
                  size="lg" 
                  className="btn-accent border-0 px-12 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t.requestForm.submitting}</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" />{t.requestForm.submit}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
