// src/pages/admin/Dashboard.tsx → VERSION CORRIGÉE ET FONCTIONNELLE
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, Music, AlertTriangle, FileText, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';

interface ArtistRequest {
  id: number;
  nomArtiste: string;
  email: string;
  hoursElapsed: number;
  isUrgent: boolean;
}

interface Stats {
  totalUsers: number;
  totalArtists: number;
  totalSongs: number;
  pendingRequests: number;
  urgentRequests: number;
  reports: number;
}

export default function AdminDashboard() {
    const [reportsCount, setReportsCount] = useState<number | null>(null); // null = chargement
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalArtists: 0,
    totalSongs: 0,
    pendingRequests: 0,
    urgentRequests: 0,
    reports: 0,
  });

  const [recentRequests, setRecentRequests] = useState<ArtistRequest[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    // Chargement des demandes artistes
    const loadRequests = async () => {
      try {
        const data = await api.get<ArtistRequest[]>('/admin/artist-requests');
        setRecentRequests(data.slice(0, 5));
        // Mise à jour des stats liées aux demandes
        const pending = data.length;
        const urgent = data.filter(r => r.isUrgent).length;
        setStats(prev => ({ ...prev, pendingRequests: pending, urgentRequests: urgent }));
      } catch (err) {
        console.error('Erreur chargement demandes artistes:', err);
      }
    };

    // Chargement du nombre de signalements
    const loadReports = async () => {
      try {
        const chansons = await api.getReportedSongs();
        const count = Array.isArray(chansons) ? chansons.length : 0;
        setReportsCount(count);
      } catch (err) {
        console.error('Erreur chargement signalements:', err);
        setReportsCount(0);
      }
    };

    // Optionnel : stats globales si l'endpoint existe
    const loadGlobalStats = async () => {
      try {
        const global = await api.get<Partial<Stats>>('/admin/global-stats');
        setStats(prev => ({ ...prev, ...global }));
      } catch (err) {
        console.warn('Endpoint /admin/global-stats non disponible');
      }
    };

    // Exécution des chargements
    loadRequests();
    loadReports();
    loadGlobalStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Administration SmartTune
          </h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble complète de la plateforme</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Artistes', value: stats.totalArtists, icon: UserCheck, color: 'from-purple-500 to-pink-500' },
            { label: 'Chansons totales', value: stats.totalSongs, icon: Music, color: 'from-green-500 to-emerald-500' },
            { label: 'Demandes en attente', value: stats.pendingRequests, icon: FileText, color: 'from-yellow-500 to-orange-500' },
            { label: 'Urgentes (>48h)', value: stats.urgentRequests, icon: AlertTriangle, color: 'from-red-500 to-rose-500', urgent: true },
            { 
              label: 'Signalements', 
              value: reportsCount === null ? '...' : reportsCount,
              icon: AlertTriangle, 
              color: reportsCount > 0 ? 'from-red-600 to-orange-600' : 'from-gray-500 to-gray-600' 
            },
          ].map((stat) => (
            <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-2xl`}>
              <CardContent className="p-6 text-center">
                <stat.icon className="w-10 h-10 mx-auto mb-3 opacity-90" />
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
                {stat.urgent && <Badge className="mt-2 bg-red-600">URGENT</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions + Recent Requests */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Requests */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  Dernières demandes
                </span>
                <Link to="/admin/requests">
                  <Button variant="outline" size="sm">Voir toutes</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune demande en attente</p>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-semibold">{req.nomArtiste}</p>
                        <p className="text-sm text-muted-foreground">{req.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={req.isUrgent ? 'destructive' : 'secondary'}>
                          {req.hoursElapsed}h
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
{/* Reports */}
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                  Signalements
                </span>
                <Link to="/admin/reports">
                  <Button variant="outline" size="sm">
                    Voir tous
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportsCount === null ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-destructive border-t-transparent"></div>
                  <p className="mt-4 text-muted-foreground">Chargement...</p>
                </div>
              ) : reportsCount === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Aucun signalement pour le moment</p>
                  <p className="text-sm text-muted-foreground mt-2">Tout est calme sur SmartTune</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Badge variant="destructive" className="text-3xl px-8 py-4">
                    <AlertTriangle className="w-8 h-8 mr-3" />
                    {reportsCount} signalement{reportsCount > 1 ? 's' : ''}
                  </Badge>
                  <p className="text-muted-foreground mt-4">
                    {reportsCount} chanson{reportsCount > 1 ? 's' : ''} à modérer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}