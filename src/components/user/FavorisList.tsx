import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ChansonSimple, ChansonResponse } from '@/types/music';
import { Play, Heart, Music, Clock, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FavorisListProps {
  userId: number;
  onUpdate: () => void;
  onPlaySong: (song: ChansonResponse) => void;
}

export function FavorisList({ userId, onUpdate, onPlaySong }: FavorisListProps) {
  const [favoris, setFavoris] = useState<ChansonSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadFavoris = async () => {
      try {
        const userFavoris = await api.getUserFavoris(userId);
        setFavoris(userFavoris);
      } catch (error) {
        toast({ title: "Erreur", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    loadFavoris();
  }, [userId, toast]);

  const handlePlay = async (song: ChansonSimple) => {
    try {
      const fullSong = await api.getChanson(song.id);
      onPlaySong(fullSong);
    } catch (error) {
      toast({ title: "Erreur de lecture", variant: "destructive" });
    }
  };

  const handleRemove = async (chansonId: number) => {
    try {
      await api.removeFavori(userId, chansonId);
      setFavoris(prev => prev.filter(f => f.id !== chansonId));
      toast({ title: "Retiré des favoris" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
          <Heart className="w-10 h-10 text-white fill-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Mes Favoris</h2>
          <p className="text-muted-foreground">{favoris.length} chanson{favoris.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border/50">
        <span className="w-10">#</span>
        <span>Titre</span>
        <span className="w-16 text-right"><Clock className="w-4 h-4 inline" /></span>
        <span className="w-10"></span>
      </div>

      <div className="space-y-1">
        {favoris.map((song, index) => (
          <div
            key={song.id}
            className="group grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors items-center"
          >
            <div className="w-10 flex items-center justify-center">
              <span className="group-hover:hidden text-muted-foreground">{index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="hidden group-hover:flex h-8 w-8"
                onClick={() => handlePlay(song)}
              >
                <Play className="w-4 h-4 fill-current" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{song.titre}</p>
                {song.artiste && (
                  <p className="text-sm text-muted-foreground truncate">{song.artiste}</p>
                )}
              </div>
            </div>
            
            <span className="w-16 text-right text-sm text-muted-foreground">
              {song.duree}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemove(song.id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}

        {favoris.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun favori</p>
            <p className="text-sm mt-1">Ajoutez des chansons à vos favoris pour les retrouver ici</p>
          </div>
        )}
      </div>
    </div>
  );
}
