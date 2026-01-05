// src/components/artist/SongsList.tsx
import { Chanson } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Play, Pause, Trash2, Music } from 'lucide-react';
import { api } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface SongsListProps {
  songs: Chanson[];
  artisteId: number;
  onUpdate: () => void;
  onPlaySong: (song: Chanson) => void;
  currentSongId?: number;
  isPlaying: boolean;
}

export function SongsList({ songs, artisteId, onUpdate, onPlaySong, currentSongId, isPlaying }: SongsListProps) {
  const [songToDelete, setSongToDelete] = useState<Chanson | null>(null);

  const handleDelete = async () => {
    if (!songToDelete) return;
    await api.deleteSong(artisteId, songToDelete.id);
    onUpdate();
    setSongToDelete(null);
  };

  if (songs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Music className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Aucune chanson</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {songs.map((song) => {
          const isCurrentSong = currentSongId === song.id;
          return (
            <div
              key={song.id}
              className={`group relative flex items-center justify-between p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isCurrentSong 
                  ? 'bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border-primary shadow-glow' 
                  : 'bg-card/50 hover:bg-card/80 hover:shadow-lg hover:border-primary/30'
              }`}
              onClick={() => song.url && onPlaySong(song)}
            >
              {/* Effet de fond animé pour la chanson en cours */}
              {isCurrentSong && isPlaying && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse" />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isCurrentSong 
                    ? 'bg-gradient-primary shadow-glow' 
                    : 'bg-gradient-to-br from-primary/20 to-accent/20'
                }`}>
                  {isCurrentSong && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-6">
                      <div className="w-1 bg-white rounded-full animate-[wave_0.8s_ease-in-out_infinite] h-3"></div>
                      <div className="w-1 bg-white rounded-full animate-[wave_0.8s_ease-in-out_infinite_0.15s] h-5"></div>
                      <div className="w-1 bg-white rounded-full animate-[wave_0.8s_ease-in-out_infinite_0.3s] h-4"></div>
                    </div>
                  ) : (
                    <Music className={`w-6 h-6 ${isCurrentSong ? 'text-white' : 'text-primary'}`} />
                  )}
                </div>
                <div>
                  <p className={`font-semibold text-base transition-colors ${isCurrentSong ? 'text-primary' : ''}`}>
                    {song.titre}
                  </p>
                  {song.albumTitre && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                      {song.albumTitre}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                {song.url && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => { e.stopPropagation(); onPlaySong(song); }}
                  >
                    {isCurrentSong && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); setSongToDelete(song); }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!songToDelete} onOpenChange={() => setSongToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{songToDelete?.titre}" ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
