import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthModal } from "@/components/auth/AuthModal";
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  User, 
  LogIn, 
  BookOpen,
  Calculator,
  HelpCircle 
} from "lucide-react";

export function Sidebar() {
  const { appUser: user, firebaseUser } = useAuth();
  const { conversations, createConversation, setCurrentConversationId } = useChat();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleNewConversation = async () => {
    try {
      await createConversation();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="space-y-6">
      {/* User Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            {user ? `Bonjour ${user.displayName}` : 'Utilisateur anonyme'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-2">
              <div className="text-sm text-medium-gray">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="text-sm text-medium-gray">
                <strong>Niveau:</strong> {user.schoolLevel}
              </div>
              <div className="text-sm text-medium-gray">
                <strong>Questions posées:</strong> {user.freeQuestionsUsed || 0}
              </div>
              {user.isAdmin && (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Administrateur
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-medium-gray">
                <strong>Questions gratuites:</strong> 2 restantes
              </div>
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Inscrivez-vous pour des questions illimitées !
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => handleAuthClick('signup')}
                  className="flex-1"
                >
                  S'inscrire
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleAuthClick('login')}
                  className="flex-1"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Connexion
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Conversation */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </CardContent>
      </Card>

      {/* Recent Conversations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {conversations.slice(0, 10).map((conversation: any) => (
                <button
                  key={conversation.id}
                  onClick={() => setCurrentConversationId(conversation.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="font-medium text-sm truncate">
                    {conversation.title || `Conversation ${conversation.id.slice(0, 8)}`}
                  </div>
                  <div className="text-xs text-medium-gray flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(conversation.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <MessageSquare className="h-8 w-8 text-medium-gray mx-auto mb-2" />
              <p className="text-sm text-medium-gray">
                Aucune conversation pour le moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Help */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Aide rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Calculator className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <strong>Formats supportés:</strong>
                <br />
                Texte, Image, PDF, Audio
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <strong>Langues:</strong>
                <br />
                Français, العربية, Tunisien
              </div>
            </div>
          </div>
          
          <div className="text-xs text-medium-gray bg-blue-50 p-2 rounded">
            💡 <strong>Astuce:</strong> Posez des questions précises pour obtenir de meilleures réponses !
          </div>
        </CardContent>
      </Card>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
        />
      )}
    </div>
  );
}