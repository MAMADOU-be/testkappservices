import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Phone, Mail, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";
import { useLanguage } from "@/i18n/LanguageContext";

const formSchema = z.object({
  nom: z.string().trim().min(2).max(100),
  prenom: z.string().trim().min(2).max(100),
  telephone: z.string().regex(/^[\d\s\+\-\.]{9,20}$/),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(1000),
});

type FormData = z.infer<typeof formSchema>;

export function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { nom: "", prenom: "", telephone: "", email: "", message: "" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-contact-message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error");
      setIsSubmitted(true);
      toast({ title: t('contact.successTitle'), description: t('contact.successDescription') });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Erreur", description: err.message || "Error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-narrow mx-auto px-4">
        <ScrollAnimation animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            {t('contact.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('contact.description')}</p>
        </ScrollAnimation>

        <div className="grid lg:grid-cols-2 gap-12">
          <ScrollAnimation animation="fade-right" delay={100}>
            <div className="glass-card rounded-2xl p-6 md:p-8 h-full">
              <h3 className="text-xl font-semibold text-foreground mb-6">{t('contact.hqTitle')}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t('contact.address')}</h4>
                    <p className="text-muted-foreground">Rue Winston Churchill 212A<br />6180 Courcelles</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t('contact.phone')}</h4>
                    <a href="tel:+3271455745" className="text-primary hover:underline font-medium text-lg">071 45 57 45</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{t('contact.email')}</h4>
                    <a href="mailto:info@kap-services.be" className="text-primary hover:underline">info@kap-services.be</a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground"><strong>{t('contact.companyNumber')}</strong> BE 0847.632.505</p>
                <p className="text-sm text-muted-foreground mt-2"><strong>{t('contact.approval')}</strong> {t('contact.approvalRegion')}</p>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation animation="fade-left" delay={200}>
            {isSubmitted ? (
              <div className="glass-card rounded-2xl p-6 md:p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-8 h-8 text-primary" /></div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('contact.successTitle')}</h3>
                <p className="text-muted-foreground mb-6">{t('contact.successDescription')}</p>
                <Button onClick={() => { setIsSubmitted(false); form.reset(); }} variant="outline">{t('contact.sendAnother')}</Button>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">{t('contact.formTitle')}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t('contact.allFieldsRequired')}</p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="nom" render={({ field }) => (
                        <FormItem><FormLabel>{t('contact.lastName')}</FormLabel><FormControl><Input placeholder={t('contact.lastNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="prenom" render={({ field }) => (
                        <FormItem><FormLabel>{t('contact.firstName')}</FormLabel><FormControl><Input placeholder={t('contact.firstNamePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="telephone" render={({ field }) => (
                      <FormItem><FormLabel>{t('contact.phone')}</FormLabel><FormControl><Input placeholder={t('contact.phonePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>{t('contact.email')}</FormLabel><FormControl><Input type="email" placeholder={t('contact.emailPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem><FormLabel>{t('contact.yourMessage')}</FormLabel><FormControl><Textarea placeholder={t('contact.messagePlaceholder')} className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" size="lg" className="btn-accent border-0 w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                      {isSubmitting ? t('contact.sending') : t('contact.send')}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
