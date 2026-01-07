// src/pages/admin/Reports.tsx → VERSION FINALE PROPRE & SIMPLE
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Music, User, Headphones } from 'lucide-react';
import { api } from '@/lib/api';

interface ChansonSignalee {
  id: number;
  titre: string;
nomArtiste: string;
  signalements: number;
  musicGenre?: string;
  duree?: string;
}

export default function Reports() {
  const [chansons, setChansons] = useState<ChansonSignalee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        // Utilisation de la méthode claire ajoutée dans api.ts
        const data = await api.getReportedSongs();

        // Si le backend renvoie directement un tableau → parfait
        // Si jamais il renvoie { data: [...] }, on gère aussi (sécurité)
        const chansonsArray = Array.isArray(data) ? data : data?.data || [];

        setChansons(chansonsArray as ChansonSignalee[]);
      } catch (err) {
        console.error('Erreur chargement signalements:', err);
        setError('Impossible de charger les signalements');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center mb-12">
            Signalements
          </h1>
          <div className="text-center py-32">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Chargement des signalements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center py-32">
          <AlertTriangle className="w-16 h-16 mx-auto text-destructive mb-4" />
          <p className="text-destructive text-xl mb-2">Erreur</p>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center mb-12">
          Signalements
        </h1>

        {chansons.length === 0 ? (
          <div className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-16 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
            <p className="text-2xl text-muted-foreground">Aucun signalement pour le moment</p>
            <p className="text-muted-foreground mt-4">Tout est calme sur SmartTune 🎉</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="text-right mb-4">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {chansons.length} chanson{chansons.length > 1 ? 's' : ''} signalée{chansons.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {chansons.map((chanson, index) => (
              <Card key={chanson.id} className="hover:shadow-xl transition-shadow border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 flex-1">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20">
                        <Music className="w-9 h-9 text-red-600" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold flex items-center gap-3">
                          <span className="text-lg text-primary">#{index + 1}</span>
                          {chanson.titre}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {chanson.nomArtiste || 'Artiste inconnu'}
                          </span>
                          {chanson.musicGenre && (
                            <span className="flex items-center gap-1">
                              <Headphones className="w-4 h-4" />
                              {chanson.musicGenre}
                            </span>
                          )}
                          {chanson.duree && <span>{chanson.duree}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="destructive" className="text-2xl px-6 py-3">
                        <AlertTriangle className="w-6 h-6 mr-2" />
                        {chanson.signalements} signalement{chanson.signalements > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}