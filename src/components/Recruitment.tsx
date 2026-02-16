import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Heart, Users, Send, CheckCircle, Car, Bike, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  emploi: z.string().min(1, "Veuillez sélectionner un type d'emploi"),
  clientele: z.enum(["oui", "non"], { required_error: "Veuillez répondre à cette question" }),
  transport: z.string().min(1, "Veuillez sélectionner un moyen de transport"),
  planImpulsion: z.string().min(1, "Veuillez sélectionner une option"),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const emploiOptions = [
  { value: "temps-partiel", label: "Temps partiel" },
  { value: "temps-plein", label: "Temps plein" },
  { value: "autre", label: "Autre" },
];

const transportOptions = [
  { value: "voiture", label: "Oui, voiture" },
  { value: "scooter", label: "Oui, scooter ou moto" },
  { value: "velo", label: "Oui, vélo" },
  { value: "tec", label: "Oui, transports en commun" },
  { value: "aucun", label: "Non, aucun" },
];

const planImpulsionOptions = [
  { value: "impulsion-12-mois", label: "Impulsion 12 mois +" },
  { value: "impulsion-25-ans", label: "Impulsion -25 ans" },
  { value: "impulsion-55-ans", label: "Impulsion 55 ans +" },
  { value: "inconnu", label: "Je ne sais pas" },
  { value: "aucun", label: "Non, pas de plan Impulsion" },
];

export function Recruitment() {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
      emploi: "",
      clientele: undefined,
      transport: "",
      planImpulsion: "",
      message: "",
    },
  });

  const benefits = [
    { icon: Heart, title: t.recruitment.benefits.stable.title, description: t.recruitment.benefits.stable.description },
    { icon: Users, title: t.recruitment.benefits.team.title, description: t.recruitment.benefits.team.description },
    { icon: Briefcase, title: t.recruitment.benefits.training.title, description: t.recruitment.benefits.training.description },
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke('submit-job-application', {
        body: {
          first_name: data.prenom,
          last_name: data.nom,
          street: data.rue,
          house_number: data.numero,
          postal_code: data.codePostal,
          city: data.localite,
          phone: data.telephone,
          email: data.email,
          employment_type: data.emploi,
          has_clientele: data.clientele,
          transport: data.transport,
          plan_impulsion: data.planImpulsion,
          message: data.message || null,
        },
      });
      if (response.error) throw response.error;
      const result = response.data;
      if (result?.error) throw new Error(result.error);
      setIsSubmitted(true);
      toast({
        title: t.recruitment.successTitle,
        description: t.recruitment.successDescription,
      });
    } catch (error: any) {
      const message = error?.message?.includes("Trop de candidatures")
        ? "Trop de candidatures envoyées. Veuillez réessayer plus tard."
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
      <section id="jobs" className="section-padding">
        <div className="container-narrow mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t.recruitment.successTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t.recruitment.successDescription}
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setShowForm(false);
                form.reset();
              }}
              variant="outline"
            >
              {t.recruitment.back}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!showForm) {
    return (
      <section id="jobs" className="section-padding">
        <div className="container-narrow mx-auto px-4">
          <ScrollAnimation animation="fade-up">
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-12"
              style={{ background: "var(--gradient-hero)" }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <ScrollAnimation animation="fade-right" delay={200}>
                    <div className="text-primary-foreground">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
                        <Briefcase className="w-4 h-4" />
                        {t.recruitment.badge}
                      </span>

                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t.recruitment.title}
                      </h2>

                      <p className="text-primary-foreground/80 mb-8 max-w-lg">
                        {t.recruitment.description}
                      </p>

                      <Button
                        onClick={() => setShowForm(true)}
                        className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        {t.recruitment.applyNow}
                        <Send className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </ScrollAnimation>

                  <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
                    {benefits.map((benefit, index) => (
                      <ScrollAnimation key={benefit.title} animation="fade-left" delay={300 + index * 100}>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <benefit.icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary-foreground">{benefit.title}</h4>
                            <p className="text-sm text-primary-foreground/70">{benefit.description}</p>
                          </div>
                        </div>
                      </ScrollAnimation>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>
    );
  }

  return (
    <section id="jobs" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t.recruitment.formBadge}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.recruitment.formTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.recruitment.formDescription}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Coordonnées */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {t.recruitment.coordinates}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t.recruitment.allFieldsRequired}
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

              {/* Concernant votre candidature */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  {t.recruitment.aboutApplication}
                </h3>

                <div className="space-y-6">
                  <FormField control={form.control} name="emploi" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.recruitment.workType}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t.recruitment.choose} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {emploiOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="clientele" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.recruitment.hasClients}</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="oui" id="clientele-oui" />
                            <label htmlFor="clientele-oui" className="text-sm cursor-pointer">{t.recruitment.yes}</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non" id="clientele-non" />
                            <label htmlFor="clientele-non" className="text-sm cursor-pointer">{t.recruitment.no}</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="transport" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.recruitment.transportLabel}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t.recruitment.choose} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transportOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="planImpulsion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.recruitment.planImpulsion}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t.recruitment.choose} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {planImpulsionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              {/* Message */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">{t.recruitment.messageOptional}</h3>

                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contact.yourMessage}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t.recruitment.messagePlaceholder} className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="px-8">
                  {t.recruitment.back}
                </Button>
                <Button type="submit" size="lg" className="btn-accent border-0 px-12" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t.recruitment.submitting}</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" />{t.recruitment.submit}</>
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
