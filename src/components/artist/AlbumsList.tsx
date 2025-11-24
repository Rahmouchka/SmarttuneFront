// src/components/artist/AlbumsList.tsx
import { Album, Chanson } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Trash2, Plus, X, Music } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { useState } from 'react';

interface AlbumsListProps {
  albums: Album[];
  artisteId: number;
  onUpdate: () => void;
  availableSongs: Chanson[];
  onPlaySong: (song: Chanson) => void;
  currentSongId?: number;
  isPlaying: boolean;
}

export function AlbumsList({ 
  albums, artisteId, onUpdate, availableSongs, 
  onPlaySong, currentSongId, isPlaying 
}: AlbumsListProps) {

  // États pour les dialogs
  const [albumToAdd, setAlbumToAdd] = useState<Album | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [albumToManage, setAlbumToManage] = useState<Album | null>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);

  const [albumToDelete, setAlbumToDelete] = useState<Album | null>(null);

  // Ajouter des chansons
  const handleAdd = async () => {
    if (!albumToAdd || selectedIds.length === 0) return;
    await api.addSongsToAlbum(artisteId, albumToAdd.id, selectedIds);
    setShowAddDialog(false);
    setSelectedIds([]);
    onUpdate();
  };

  // Supprimer une chanson de l'album
  const handleRemoveSong = async (songId: number) => {
    if (!albumToManage) return;
    const remainingIds = albumToManage.chansons
      ?.filter(s => s.id !== songId)
      .map(s => s.id) || [];
    await api.addSongsToAlbum(artisteId, albumToManage.id, remainingIds);
    onUpdate();
  };

  // Supprimer l'album
  const handleDeleteAlbum = async () => {
    if (!albumToDelete) return;
    await api.deleteAlbum(artisteId, albumToDelete.id);
    setAlbumToDelete(null);
    onUpdate();
  };

  if (albums.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="w-24 h-24 mx-auto mb-4 opacity-20 bg-gray-200 border-2 border-dashed rounded-xl" />
        <p className="text-lg">Aucun album créé</p>
      </div>
    );
  }

  return (
    <>
      {/* Liste des albums */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <Card 
            key={album.id} 
            className="group hover:shadow-glow transition-all duration-300 hover:border-primary/50 bg-card/80 backdrop-blur overflow-hidden"
          >
            <CardHeader className="relative">
              {/* Effet gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent group-hover:text-foreground transition-all">
                    {album.titre}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <span className="font-medium text-primary">{album.chansons?.length || 0}</span>
                    <span>chanson{album.chansons?.length !== 1 ? 's' : ''}</span>
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:bg-destructive/10 flex-shrink-0" 
                  onClick={() => setAlbumToDelete(album)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Liste des chansons dans l'album */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto custom-scrollbar">
                {album.chansons?.length ? (
                  album.chansons.map((song) => {
                    const playing = currentSongId === song.id;
                    return (
                      <div
                        key={song.id}
                        className={`group/song flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                          playing 
                            ? 'bg-gradient-to-r from-primary/15 to-accent/10 border border-primary/30' 
                            : 'bg-card/50 hover:bg-card/80 border border-transparent hover:border-primary/20'
                        }`}
                        onClick={() => song.url && onPlaySong(song)}
                      >
                        <span className={`text-sm font-medium truncate pr-2 ${playing ? 'text-primary' : ''}`}>
                          {song.titre}
                        </span>
                        {song.url && (
                          <div className={`flex-shrink-0 ${playing ? '' : 'opacity-0 group-hover/song:opacity-100'} transition-opacity`}>
                            {playing && isPlaying ? (
                              <div className="flex gap-0.5 items-end h-4">
                                <div className="w-0.5 bg-primary rounded-full animate-[wave_0.8s_ease-in-out_infinite] h-2"></div>
                                <div className="w-0.5 bg-primary rounded-full animate-[wave_0.8s_ease-in-out_infinite_0.15s] h-4"></div>
                                <div className="w-0.5 bg-primary rounded-full animate-[wave_0.8s_ease-in-out_infinite_0.3s] h-3"></div>
                              </div>
                            ) : (
                              <Play className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Music className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>Aucune chanson</p>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                  onClick={() => {
                    setAlbumToAdd(album);
                    setSelectedIds([]);
                    setShowAddDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-all"
                  onClick={() => {
                    setAlbumToManage(album);
                    setShowManageDialog(true);
                  }}
                  disabled={!album.chansons?.length}
                >
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog : Ajouter des chansons */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter à "{albumToAdd?.titre}"</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 py-4">
            {availableSongs.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Aucune chanson disponible</p>
            ) : (
              availableSongs.map((song) => (
                <div key={song.id} className="flex items-center gap-3 p-3 rounded hover:bg-accent/30">
                  <Checkbox
                    checked={selectedIds.includes(song.id)}
                    onCheckedChange={() => setSelectedIds(prev =>
                      prev.includes(song.id)
                        ? prev.filter(id => id !== song.id)
                        : [...prev, song.id]
                    )}
                  />
                  <Label className="flex-1 cursor-pointer">{song.titre}</Label>
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
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={selectedIds.length === 0}>
              Ajouter ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog : Gérer (supprimer des chansons) */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gérer "{albumToManage?.titre}"</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto space-y-3 py-4">
            {albumToManage?.chansons?.map((song) => {
              const playing = currentSongId === song.id;
              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-4 rounded transition ${
                    playing ? 'bg-accent/50' : 'bg-card/50 hover:bg-accent/30'
                  }`}
                  onClick={() => song.url && onPlaySong(song)}
                >
                  <span className="font-medium truncate pr-4">{song.titre}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSong(song.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>
              Fermer
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