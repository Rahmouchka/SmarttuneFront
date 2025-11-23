// src/components/artist/AlbumsList.tsx
import { Album, Chanson } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Trash2, Plus, X } from 'lucide-react';
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
          <Card key={album.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{album.titre}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {album.chansons?.length || 0} chanson{album.chansons?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive" 
                  onClick={() => setAlbumToDelete(album)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Liste des chansons dans l'album */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {album.chansons?.length ? (
                  album.chansons.map((song) => {
                    const playing = currentSongId === song.id;
                    return (
                      <div
                        key={song.id}
                        className={`flex items-center justify-between p-3 rounded transition cursor-pointer ${
                          playing ? 'bg-accent/50' : 'bg-card/50 hover:bg-accent/30'
                        }`}
                        onClick={() => song.url && onPlaySong(song)}
                      >
                        <span className="text-sm font-medium truncate pr-2">
                          {song.titre}
                        </span>
                        {song.url && (
                          playing && isPlaying 
                            ? <Pause className="w-4 h-4 text-primary flex-shrink-0" />
                            : <Play className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-6">
                    Aucune chanson
                  </p>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
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
                  className="flex-1"
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