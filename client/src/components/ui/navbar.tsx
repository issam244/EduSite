import { Link, useLocation } from "wouter";
import { Calculator, Settings, Home, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [location] = useLocation();
  const { appUser: user, signOut: logout } = useAuth();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Calculator className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-dark-gray dark:text-white">
                MathTunis
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Accueil</span>
              </Button>
            </Link>

            {user?.isAdmin && (
              <Link href="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-sm text-medium-gray dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            ) : (
              <div className="text-sm text-medium-gray dark:text-gray-300">
                Utilisateur anonyme
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}