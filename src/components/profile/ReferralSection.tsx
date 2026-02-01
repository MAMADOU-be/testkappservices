import { useState } from 'react';
import { useReferral } from '@/hooks/useReferral';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Copy, 
  Link, 
  CheckCircle, 
  Clock, 
  Gift,
  Share2,
  Loader2
} from 'lucide-react';

const ReferralSection = () => {
  const { 
    referralCode, 
    referralLink, 
    stats, 
    referrals, 
    isLoading, 
    copyToClipboard 
  } = useReferral();
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    if (!referralCode) return;
    const success = await copyToClipboard(referralCode);
    if (success) {
      setCopiedCode(true);
      toast({
        title: 'Code copié !',
        description: 'Votre code de parrainage a été copié dans le presse-papiers',
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopiedLink(true);
      toast({
        title: 'Lien copié !',
        description: 'Votre lien de parrainage a été copié dans le presse-papiers',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez-nous !',
          text: `Inscrivez-vous avec mon code de parrainage : ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or share failed
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Parrainage
        </CardTitle>
        <CardDescription>
          Invitez vos proches et gagnez des avantages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Confirmés</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">En attente</div>
          </div>
        </div>

        <Separator />

        {/* Referral Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Votre code de parrainage</label>
          <div className="flex gap-2">
            <Input 
              value={referralCode || ''} 
              readOnly 
              className="font-mono text-lg font-bold text-center tracking-wider"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopyCode}
              className="shrink-0"
            >
              {copiedCode ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Lien de parrainage</label>
          <div className="flex gap-2">
            <Input 
              value={referralLink} 
              readOnly 
              className="text-sm text-muted-foreground"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copiedLink ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Link className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Share Button */}
        <Button onClick={handleShare} className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          Partager mon lien
        </Button>

        {/* Recent Referrals */}
        {referrals.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Mes filleuls
              </h4>
              <div className="space-y-2">
                {referrals.slice(0, 5).map((referral) => (
                  <div 
                    key={referral.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {referral.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-sm">
                        {referral.referred_email || 'Utilisateur inscrit'}
                      </span>
                    </div>
                    <Badge 
                      variant={referral.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {referral.status === 'completed' ? 'Confirmé' : 'En attente'}
                    </Badge>
                  </div>
                ))}
              </div>
              {referrals.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  Et {referrals.length - 5} autre(s)...
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
