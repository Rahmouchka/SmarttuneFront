// src/components/user/FavorisList.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, Play, User as ArtistIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { ChansonSimple, ChansonResponse } from '@/types/music';
import { useToast } from '@/hooks/use-toast';

interface FavorisListProps {
  userId: number;
  onUpdate: () => void;
  onPlaySong: (song: ChansonResponse) => void;
}

export function FavorisList({ userId, onUpdate, onPlaySong }: FavorisListProps) {
  const [favoriChansons, setFavoriChansons] = useState<ChansonSimple[]>([]);
  const [favoriArtistes, setFavoriArtistes] = useState<any[]>([]);
  const { toast } = useToast();

  // Charger les favoris au montage du composant
  useEffect(() => {
    loadFavoris();
  }, [userId]);

  const loadFavoris = async () => {
    try {
      const chansons = await api.getUserFavoris(userId);
      setFavoriChansons(chansons);
      
      // Charger les artistes favoris si l'API existe
      try {
        const artistes = await api.getUserFavorisArtistes(userId);
        setFavoriArtistes(artistes);
      } catch (error) {
        // Si l'endpoint n'existe pas encore, on ignore
        console.log('Artistes favoris non disponibles');
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      toast({ title: "Erreur", description: "Impossible de charger les favoris", variant: "destructive" });
    }
  };

  const handleRemoveFavoriChanson = async (chansonId: number) => {
    try {
      await api.removeFromFavoris(userId, chansonId);
      setFavoriChansons(prev => prev.filter(c => c.id !== chansonId));
      toast({ title: "Chanson retirée des favoris" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleRemoveFavoriArtiste = async (artisteId: number) => {
    try {
      await api.removeArtisteFromFavoris(userId, artisteId);
      setFavoriArtistes(prev => prev.filter(a => a.id !== artisteId));
      toast({ title: "Artiste retiré des favoris" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Chansons */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          Chansons favorites ({favoriChansons.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favoriChansons.map((chanson) => (
            <Card key={chanson.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                  <div>
                    <p className="font-medium">{chanson.titre}</p>
                    <p className="text-sm text-muted-foreground">Genre: {chanson.musicGenre}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={async () => {
                    const fullSong = await api.getChanson(chanson.id);
                    onPlaySong(fullSong);
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Écouter
                  </Button>
                  <Button variant="destructive" onClick={() => handleRemoveFavoriChanson(chanson.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Retirer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {favoriChansons.length === 0 && (
            <p className="text-center py-8 text-muted-foreground col-span-full">Aucune chanson favorite</p>
          )}
        </div>
      </div>

      {/* Section Artistes */}
      {favoriArtistes.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ArtistIcon className="w-5 h-5 text-primary" />
            Artistes favoris ({favoriArtistes.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriArtistes.map((artiste) => (
              <Card key={artiste.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <ArtistIcon className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">
                        {artiste.nomArtiste || `${artiste.prenom || ''} ${artiste.nom || ''}`.trim() || 'Artiste'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {artiste.bio ? artiste.bio.substring(0, 50) + '...' : 'Artiste favori'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" onClick={() => handleRemoveFavoriArtiste(artiste.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Retirer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}