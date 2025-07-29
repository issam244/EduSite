import { ChatInterface } from '@/components/chat/ChatInterface';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-8">
            <ChatInterface />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <Sidebar />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center py-2 px-4 text-primary">
            <i className="fas fa-home text-xl mb-1"></i>
            <span className="text-xs">Accueil</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-medium-gray">
            <i className="fas fa-history text-xl mb-1"></i>
            <span className="text-xs">Historique</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-medium-gray">
            <i className="fas fa-book text-xl mb-1"></i>
            <span className="text-xs">Ressources</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4 text-medium-gray">
            <i className="fas fa-user text-xl mb-1"></i>
            <span className="text-xs">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}
