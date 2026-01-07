// src/components/artist/AlbumsList.tsx
import { AlbumResponse, ChansonResponse } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Trash2, Plus, X, Music } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useState } from 'react';

interface AlbumsListProps {
  albums: AlbumResponse[];
  artisteId: number;
  onUpdate: () => void;
  availableSongs: ChansonResponse[];
  onPlaySong: (song: ChansonResponse) => void;
  currentSongId?: number;
  isPlaying: boolean;
}

export function AlbumsList({
  albums,
  artisteId,
  onUpdate,
  availableSongs,
  onPlaySong,
  currentSongId,
  isPlaying,
}: AlbumsListProps) {
  const [albumToAdd, setAlbumToAdd] = useState<AlbumResponse | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [albumToDelete, setAlbumToDelete] = useState<AlbumResponse | null>(null);

  // Ajouter des chansons
  const handleAdd = async () => {
    if (!albumToAdd || selectedIds.length === 0) return;

    try {
      await api.addSongsToAlbum(artisteId, albumToAdd.id, selectedIds);
      setShowAddDialog(false);
      setSelectedIds([]);
      onUpdate();
    } catch (error) {
      console.error('Erreur ajout chansons:', error);
      onUpdate(); // recharge même en cas d'erreur
    }
  };

  // Retirer une chanson d'un album
  const handleRemoveSong = async (albumId: number, chansonId: number) => {
    try {
      await api.removeSongFromAlbum(artisteId, albumId, chansonId);
      onUpdate(); // recharge les données depuis le serveur
    } catch (error) {
      console.error('Erreur retrait chanson:', error);
      onUpdate(); // recharge quand même pour synchroniser
    }
  };

  // Supprimer l'album
  const handleDeleteAlbum = async () => {
    if (!albumToDelete) return;

    try {
      await api.deleteAlbum(artisteId, albumToDelete.id);
      setAlbumToDelete(null);
      onUpdate();
    } catch (error) {
      console.error('Erreur suppression album:', error);
      onUpdate();
    }
  };

  if (albums.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="w-32 h-32 mx-auto mb-6 opacity-20 bg-gray-200 border-2 border-dashed rounded-xl" />
        <p className="text-lg">Aucun album créé</p>
        <p className="text-sm mt-2">Créez votre premier album pour organiser vos chansons</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => {
          const songCount = album.chansons.length;

          return (
            <Card key={album.id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 group">
              {/* Couverture */}
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
                {album.couvertureUrl ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8082'}${album.couvertureUrl}`}
                    alt={`Couverture de ${album.titre}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-24 h-24 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setAlbumToDelete(album)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>

              <CardHeader>
                <CardTitle className="text-2xl">{album.titre}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {songCount} chanson{songCount !== 1 ? 's' : ''}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                  {songCount > 0 ? (
                    album.chansons.map((song) => {
                      const playing = currentSongId === song.id;

                      return (
                        <div
                          key={song.id}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-pointer ${
                            playing ? 'bg-primary/10 border border-primary/50' : 'hover:bg-accent/5'
                          }`}
                          onClick={() => song.url && onPlaySong(song)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {playing && isPlaying ? (
                              <div className="flex gap-1">
                                <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <div className="w-1 h-4 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </div>
                            ) : (
                              <Play className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="truncate font-medium">{song.titre}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSong(album.id, song.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-6">Aucune chanson</p>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    setAlbumToAdd(album);
                    setSelectedIds([]);
                    setShowAddDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter des chansons
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog ajout chansons */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter à "{albumToAdd?.titre}"</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 py-4">
            {availableSongs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune chanson disponible
              </p>
            ) : (
              availableSongs.map((song) => (
                <div key={song.id} className="flex items-center gap-3 p-3 rounded hover:bg-accent/10">
                  <Checkbox
                    checked={selectedIds.includes(song.id)}
                    onCheckedChange={() =>
                      setSelectedIds((prev) =>
                        prev.includes(song.id)
                          ? prev.filter((id) => id !== song.id)
                          : [...prev, song.id]
                      )
                    }
                  />
                  <Label className="flex-1 cursor-pointer truncate">{song.titre}</Label>
                  {song.url && (
                    <button onClick={() => onPlaySong(song)}>
                      <Play className="w-4 h-4 text-primary" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAdd} disabled={selectedIds.length === 0}>
              Ajouter ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression album */}
      <AlertDialog open={!!albumToDelete} onOpenChange={() => setAlbumToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'album ?</AlertDialogTitle>
            <AlertDialogDescription>
              "{albumToDelete?.titre}" sera supprimé définitivement.
              <br />
              Les chansons resteront dans votre bibliothèque.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAlbum} className="bg-destructive">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
