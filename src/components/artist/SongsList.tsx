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
              className={`group flex items-center justify-between p-4 rounded-lg border transition cursor-pointer ${
                isCurrentSong ? 'bg-accent/50 border-primary' : 'bg-card/50 hover:bg-accent/30'
              }`}
              onClick={() => song.url && onPlaySong(song)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded flex items-center justify-center">
                  {isCurrentSong && isPlaying ? (
                    <div className="flex gap-1 items-end h-6">
                      <div className="w-1 bg-primary animate-[wave_1s_ease-in-out_infinite] h-3"></div>
                      <div className="w-1 bg-primary animate-[wave_1s_ease-in-out_infinite_0.2s] h-5"></div>
                      <div className="w-1 bg-primary animate-[wave_1s_ease-in-out_infinite_0.4s] h-4"></div>
                    </div>
                  ) : (
                    <Music className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${isCurrentSong ? 'text-primary' : ''}`}>{song.titre}</p>
                  {song.albumTitre && <p className="text-xs text-muted-foreground">Dans • {song.albumTitre}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                {song.url && (
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onPlaySong(song); }}>
                    {isCurrentSong && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
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
