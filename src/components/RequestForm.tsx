import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Phone, CheckCircle } from "lucide-react";
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

const joursOptions = [
  { id: "lundi", label: "Lundi" },
  { id: "mardi", label: "Mardi" },
  { id: "mercredi", label: "Mercredi" },
  { id: "jeudi", label: "Jeudi" },
  { id: "vendredi", label: "Vendredi" },
];

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

export function RequestForm() {
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
      inscritPluxee: undefined,
      numeroPluxee: "",
      heuresParSemaine: "",
      joursPreference: [],
      message: "",
    },
  });

  const inscritPluxee = form.watch("inscritPluxee");

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    setIsSubmitted(true);
    toast({
      title: "Demande envoyée !",
      description: "Nous vous contacterons dans les 24 heures ouvrables.",
    });
  };

  if (isSubmitted) {
    return (
      <section id="demande" className="section-padding bg-secondary/30">
        <div className="container-narrow mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Demande envoyée avec succès !
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Merci pour votre demande. Notre équipe vous contactera dans les 24 heures ouvrables.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Faire une nouvelle demande
            </Button>
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
            Demande d'aide-ménagère
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trouvez votre aide-ménagère
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Remplissez ce formulaire et nous vous contacterons dans les 24 heures ouvrables.
            <br />
            Vous pouvez également nous téléphoner au{" "}
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

              {/* Concernant votre demande */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Concernant votre demande
                </h3>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="inscritPluxee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Êtes-vous inscrit chez Pluxee ?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="oui" id="pluxee-oui" />
                              <label htmlFor="pluxee-oui" className="text-sm cursor-pointer">
                                Oui
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="non" id="pluxee-non" />
                              <label htmlFor="pluxee-non" className="text-sm cursor-pointer">
                                Non
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {inscritPluxee === "oui" && (
                    <FormField
                      control={form.control}
                      name="numeroPluxee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro d'identification Pluxee</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre numéro Pluxee" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="heuresParSemaine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre d'heures souhaitées par semaine</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {heuresOptions.map((option) => (
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
                    name="joursPreference"
                    render={() => (
                      <FormItem>
                        <FormLabel>Jour(s) de préférence</FormLabel>
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
                                          : field.onChange(
                                              field.value?.filter((value) => value !== jour.id)
                                            );
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
                    )}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">
                  Message (facultatif)
                </h3>

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

              <div className="text-center">
                <Button type="submit" size="lg" className="btn-accent border-0 px-12 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer ma demande
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
