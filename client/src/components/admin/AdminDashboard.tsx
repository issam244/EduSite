import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, Users, MessageCircle, Brain, Book, Settings, 
  X, Plus, Edit, Trash2, Shield 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  aiAccuracy: number;
  avgResponseTime: number;
}

interface AdminContent {
  id: string;
  type: string;
  title: string;
  content: any;
  isPublished: boolean;
  createdAt: string;
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<AdminContent | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock stats - in real app, these would come from API
  const stats: AdminStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalQuestions: 5892,
    aiAccuracy: 94.3,
    avgResponseTime: 2.1
  };

  const { data: adminContent } = useQuery({
    queryKey: ['/api/admin/content'],
  });

  const createContentMutation = useMutation({
    mutationFn: async (content: Partial<AdminContent>) => {
      const response = await apiRequest('POST', '/api/admin/content', content);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowContentModal(false);
      setEditingContent(null);
      toast({
        title: "Succès",
        description: "Contenu créé avec succès"
      });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, ...content }: Partial<AdminContent> & { id: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/content/${id}`, content);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      setShowContentModal(false);
      setEditingContent(null);
      toast({
        title: "Succès",
        description: "Contenu mis à jour avec succès"
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/content/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Succès",
        description: "Contenu supprimé avec succès"
      });
    },
  });

  const StatCard = ({ icon: Icon, title, value, subtitle }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Icon className="text-primary text-xl" />
          </div>
          <div>
            <p className="text-2xl font-bold text-dark-gray">{value}</p>
            <p className="text-sm text-medium-gray">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ContentForm = () => {
    const [formData, setFormData] = useState({
      type: editingContent?.type || 'article',
      title: editingContent?.title || '',
      content: editingContent?.content ? JSON.stringify(editingContent.content) : '',
      isPublished: editingContent?.isPublished || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const contentData = {
        ...formData,
        content: formData.content ? JSON.parse(formData.content) : null
      };

      if (editingContent) {
        updateContentMutation.mutate({ id: editingContent.id, ...contentData });
      } else {
        createContentMutation.mutate(contentData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="article">Article</SelectItem>
              <SelectItem value="solution_template">Modèle de solution</SelectItem>
              <SelectItem value="category">Catégorie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Titre</label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contenu (JSON)</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-32"
            placeholder={'{"text": "Contenu de l\'article..."}'}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.isPublished}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
          />
          <label htmlFor="published" className="text-sm font-medium">Publié</label>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setShowContentModal(false);
              setEditingContent(null);
            }}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createContentMutation.isPending || updateContentMutation.isPending}>
            {editingContent ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="fixed inset-0 bg-light-bg z-40">
      <div className="flex h-full">
        {/* Admin Sidebar */}
        <div className="w-64 bg-dark-gray text-white p-6">
          <div className="flex items-center mb-8">
            <Shield className="text-2xl text-primary mr-3" />
            <h2 className="text-xl font-bold">Admin Panel</h2>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-primary' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'users' ? 'bg-primary' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="mr-3 h-4 w-4" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'conversations' ? 'bg-primary' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <MessageCircle className="mr-3 h-4 w-4" />
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'ai' ? 'bg-primary' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Brain className="mr-3 h-4 w-4" />
              IA Supervision
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'content' ? 'bg-primary' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Book className="mr-3 h-4 w-4" />
              Contenu
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center w-full px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'settings' ? 'bg-primary' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Settings className="mr-3 h-4 w-4" />
              Paramètres
            </button>
          </nav>
        </div>
        
        {/* Admin Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-dark-gray">
              {activeTab === 'dashboard' && 'Tableau de Bord Admin'}
              {activeTab === 'users' && 'Gestion des Utilisateurs'}
              {activeTab === 'conversations' && 'Historique des Conversations'}
              {activeTab === 'ai' && 'Supervision IA'}
              {activeTab === 'content' && 'Gestion du Contenu'}
              {activeTab === 'settings' && 'Paramètres'}
            </h1>
            <Button onClick={onClose} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Fermer
            </Button>
          </div>
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  title="Utilisateurs"
                  value={stats.totalUsers.toLocaleString()}
                  subtitle="Utilisateurs actifs"
                />
                <StatCard
                  icon={MessageCircle}
                  title="Questions"
                  value={stats.totalQuestions.toLocaleString()}
                  subtitle="Questions traitées"
                />
                <StatCard
                  icon={Brain}
                  title="Précision"
                  value={`${stats.aiAccuracy}%`}
                  subtitle="Précision IA"
                />
                <StatCard
                  icon={Settings}
                  title="Performance"
                  value={`${stats.avgResponseTime}s`}
                  subtitle="Temps de réponse"
                />
              </div>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Activité Récente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-4">
                          A
                        </div>
                        <div>
                          <p className="font-medium text-dark-gray">Ahmed Ben Ali</p>
                          <p className="text-sm text-medium-gray">Question sur les dérivées - Résolue automatiquement</p>
                        </div>
                      </div>
                      <span className="text-sm text-medium-gray">Il y a 2 min</span>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center mr-4">
                          F
                        </div>
                        <div>
                          <p className="font-medium text-dark-gray">Fatma Trabelsi</p>
                          <p className="text-sm text-medium-gray">Question complexe - Scraping web effectué</p>
                        </div>
                      </div>
                      <span className="text-sm text-medium-gray">Il y a 5 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Content Management Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestion du Contenu</h2>
                <Button onClick={() => setShowContentModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Contenu
                </Button>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {(adminContent as any)?.content?.map((item: AdminContent) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <h3 className="font-medium text-dark-gray">{item.title}</h3>
                          <p className="text-sm text-medium-gray">
                            Type: {item.type} | 
                            Statut: {item.isPublished ? 'Publié' : 'Brouillon'} |
                            Créé: {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingContent(item);
                              setShowContentModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteContentMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-medium-gray py-8">
                        Aucun contenu créé pour le moment
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== 'dashboard' && activeTab !== 'content' && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-medium-gray">
                  Fonctionnalité "{activeTab}" en cours de développement
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Content Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Modifier le contenu' : 'Nouveau contenu'}
            </DialogTitle>
          </DialogHeader>
          <ContentForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
