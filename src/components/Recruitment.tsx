import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, Heart, Users, Send, CheckCircle, Car, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const benefits = [
  {
    icon: Heart,
    title: "Contrat stable",
    description: "CDI avec horaires flexibles",
  },
  {
    icon: Users,
    title: "Équipe soudée",
    description: "Ambiance familiale et bienveillante",
  },
  {
    icon: Briefcase,
    title: "Formation",
    description: "Accompagnement et encadrement",
  },
];

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
  const { toast } = useToast();

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

  const onSubmit = (data: FormData) => {
    console.log("Job application submitted:", data);
    setIsSubmitted(true);
    toast({
      title: "Candidature envoyée !",
      description: "Nous vous contacterons dans les plus brefs délais.",
    });
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
              Candidature envoyée avec succès !
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Merci pour votre candidature. Notre équipe vous contactera dans les plus brefs délais.
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setShowForm(false);
                form.reset();
              }}
              variant="outline"
            >
              Retour
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
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ background: "var(--gradient-hero)" }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div className="text-primary-foreground">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-sm font-medium mb-6">
                    <Briefcase className="w-4 h-4" />
                    Nous recrutons
                  </span>

                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Rejoignez notre équipe !
                  </h2>

                  <p className="text-primary-foreground/80 mb-8 max-w-lg">
                    Nous recherchons des aides-ménagères motivées pour rejoindre notre équipe
                    dynamique. Bénéficiez d'un encadrement professionnel et d'une ambiance de
                    travail conviviale.
                  </p>

                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Postuler maintenant
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                {/* Benefits */}
                <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit.title}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-foreground">{benefit.title}</h4>
                        <p className="text-sm text-primary-foreground/70">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="jobs" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Jobs - Candidature
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Postulez chez Kap-Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Actuellement, nous sommes à la recherche d'aides-ménagères. Si un emploi chez nous vous
            intéresse, remplissez ce formulaire.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Coordonnées */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Vos coordonnées
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Tous les champs sont obligatoires.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rue</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de la rue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro</FormLabel>
                        <FormControl>
                          <Input placeholder="N°" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codePostal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="6000" maxLength={4} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="localite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localité</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre ville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="0471 23 45 67" {...field} />
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
                          <Input type="email" placeholder="votre@email.be" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Concernant votre candidature */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Concernant votre candidature
                </h3>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="emploi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vous souhaitez travailler à :</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {emploiOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="clientele"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avez-vous déjà une clientèle ?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="oui" id="clientele-oui" />
                              <label htmlFor="clientele-oui" className="text-sm cursor-pointer">
                                Oui
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="non" id="clientele-non" />
                              <label htmlFor="clientele-non" className="text-sm cursor-pointer">
                                Non
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disposez-vous d'un moyen de transport ?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transportOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="planImpulsion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bénéficiez-vous du plan Impulsion ?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {planImpulsionOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Message (facultatif)</h3>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Votre message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Si vous avez des informations supplémentaires à nous communiquer..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="px-8"
                >
                  Annuler
                </Button>
                <Button type="submit" size="lg" className="btn-accent border-0 px-12">
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer ma candidature
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
