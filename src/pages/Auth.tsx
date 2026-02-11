import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, ArrowLeft, User, Gift, Eye, EyeOff, Check, X } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Email invalide');
const passwordSchema = z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères');
const displayNameSchema = z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne peut pas dépasser 50 caractères');

function getPasswordStrength(password: string) {
  let score = 0;
  const checks = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    isLong: password.length >= 10,
  };
  if (checks.minLength) score++;
  if (checks.hasUppercase) score++;
  if (checks.hasLowercase) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;
  if (checks.isLong) score++;
  return { score, checks };
}

function getStrengthLabel(score: number) {
  if (score <= 2) return { label: 'Faible', color: 'bg-destructive' };
  if (score <= 4) return { label: 'Moyen', color: 'bg-yellow-500' };
  return { label: 'Fort', color: 'bg-green-500' };
}

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});
  
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const { hasAnyRole, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const redirectTo = searchParams.get('redirect') || '/';
  const referralCode = searchParams.get('ref');

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthInfo = useMemo(() => getStrengthLabel(strength.score), [strength.score]);

  useEffect(() => {
    if (!authLoading && !profileLoading && user) {
      if (hasAnyRole(['admin', 'employee'])) {
        navigate('/admin');
      } else {
        navigate(redirectTo);
      }
    }
  }, [user, authLoading, profileLoading, hasAnyRole, navigate, redirectTo]);

  const validateForm = (isSignUp = false) => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};
    
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    try { passwordSchema.parse(password); } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
    }
    if (isSignUp) {
      try { displayNameSchema.parse(displayName); } catch (e) {
        if (e instanceof z.ZodError) newErrors.displayName = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de connexion',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect'
          : error.message,
      });
    } else {
      toast({ title: 'Connexion réussie', description: 'Bienvenue !' });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    setIsSubmitting(true);
    const { error, data } = await signUp(email, password, displayName);
    
    if (error) {
      setIsSubmitting(false);
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'Un compte existe déjà avec cet email';
      }
      toast({ variant: 'destructive', title: 'Erreur d\'inscription', description: message });
    } else {
      if (referralCode && data?.user) {
        try {
          await supabase.rpc('process_referral', {
            _referred_user_id: data.user.id,
            _referral_code: referralCode,
          });
        } catch (err) {
          console.error('Error processing referral:', err);
        }
      }
      setIsSubmitting(false);
      toast({
        title: 'Inscription réussie',
        description: referralCode 
          ? 'Votre compte a été créé avec succès via parrainage !' 
          : 'Votre compte a été créé avec succès',
      });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const passwordInputType = showPassword ? 'text' : 'password';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-muted/30 p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au site
        </Button>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xl">K</span>
            </div>
            <CardTitle className="text-2xl">Connexion</CardTitle>
            <CardDescription>Connectez-vous ou créez un compte</CardDescription>
            {referralCode && (
              <Badge variant="secondary" className="mt-2 gap-1">
                <Gift className="h-3 w-3" />
                Code parrain : {referralCode}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={referralCode ? "register" : "login"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-password" type={passwordInputType} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion...</>) : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="register-name" type="text" placeholder="Jean Dupont" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10" />
                    </div>
                    {errors.displayName && <p className="text-sm text-destructive">{errors.displayName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="register-email" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="register-password" type={passwordInputType} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Force du mot de passe</span>
                        <span className={`text-xs font-medium ${strength.score <= 2 ? 'text-destructive' : strength.score <= 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {strengthInfo.label}
                        </span>
                      </div>
                      <Progress value={(strength.score / 6) * 100} className="h-1.5" />
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <PasswordCheck ok={strength.checks.minLength} label="6 caractères min." />
                        <PasswordCheck ok={strength.checks.hasUppercase} label="Majuscule" />
                        <PasswordCheck ok={strength.checks.hasLowercase} label="Minuscule" />
                        <PasswordCheck ok={strength.checks.hasNumber} label="Chiffre" />
                        <PasswordCheck ok={strength.checks.hasSpecial} label="Caractère spécial" />
                        <PasswordCheck ok={strength.checks.isLong} label="10+ caractères" />
                      </div>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscription...</>) : 'S\'inscrire'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function PasswordCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1 ${ok ? 'text-green-600' : 'text-muted-foreground'}`}>
      {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );
}

export default Auth;
