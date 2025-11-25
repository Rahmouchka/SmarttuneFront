// src/components/admin/AdminNavbar.tsx → VERSION FINALE QUI NE PLANTE JAMAIS
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, UserCheck, FileText, AlertTriangle, LogOut } from 'lucide-react';
import logo from '@/assets/smarttune-logo.png';

export default function AdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();

    // Récupération sécurisée du user
    let user = null;
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (userJson) {
        try {
            const parsed = JSON.parse(userJson);
            user = parsed.user || parsed; // supporte { user: {...} } et { role: "ADMIN" }
        } catch (e) {
            console.warn("localStorage user corrompu, on le supprime");
            localStorage.removeItem('user');
        }
    }

    // Si pas admin → on affiche rien (pas de redirection ici, on laisse les routes gérer)
    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
        { path: '/admin/requests', label: 'Demandes', icon: FileText },
        { path: '/admin/users', label: 'Utilisateurs', icon: Users },
        { path: '/admin/artists', label: 'Artistes', icon: UserCheck },
        { path: '/admin/reports', label: 'Signalements', icon: AlertTriangle },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/admin/dashboard" className="flex items-center gap-4">
                        <img src={logo} alt="SmartTune" className="h-12" />
                        <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hidden md:block">
              Smarttune
            </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-1 p-2 bg-background/70 rounded-full border border-border/50 backdrop-blur-xl shadow-2xl">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all font-medium z-10
                      ${isActive ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full -z-10 animate-pulse" />
                                        )}
                                        <Icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-5 py-3 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline">Déconnexion</span>
                    </button>
                </div>
            </div>
        </header>
    );
}