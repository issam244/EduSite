import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, mode: initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName || !schoolLevel) {
          toast({
            title: "Erreur",
            description: "Veuillez remplir tous les champs",
            variant: "destructive"
          });
          return;
        }
        await signUp(email, password, displayName, schoolLevel);
        toast({
          title: "Inscription réussie!",
          description: "Votre compte a été créé avec succès"
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Connexion réussie!",
          description: "Vous êtes maintenant connecté"
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setSchoolLevel("");
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Connectez-vous pour accéder à des questions illimitées'
              : 'Inscrivez-vous pour bénéficier de questions illimitées'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom complet</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Votre nom complet"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolLevel">Niveau scolaire</Label>
                <Select value={schoolLevel} onValueChange={setSchoolLevel} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="college">Collège</SelectItem>
                    <SelectItem value="lycee">Lycée</SelectItem>
                    <SelectItem value="bac">Baccalauréat</SelectItem>
                    <SelectItem value="superieur">Études supérieures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading 
                ? (mode === 'login' ? 'Connexion...' : 'Inscription...')
                : (mode === 'login' ? 'Se connecter' : "S'inscrire")
              }
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={switchMode}
              className="w-full"
            >
              {mode === 'login' 
                ? "Pas de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}