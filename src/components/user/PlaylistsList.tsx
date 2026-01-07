// src/components/user/PlaylistsList.tsx

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Music, Trash2, Edit, Plus, Eye, EyeOff, Play, ArrowLeft, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { Playlist, ChansonSimple, ChansonResponse } from '@/types/music';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PlaylistsListProps {
  userId: number;
  chansons: ChansonSimple[];
  onUpdate: () => void;
  onPlaySong: (song: ChansonResponse) => void;
}

export function PlaylistsList({ userId, chansons, onUpdate, onPlaySong }: PlaylistsListProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddSongsDialog, setShowAddSongsDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistVisible, setPlaylistVisible] = useState(true);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewingPlaylist, setViewingPlaylist] = useState<Playlist | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const userPlaylists = await api.getUserPlaylists(userId);
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error('Erreur lors du chargement des playlists:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les playlists",
          variant: "destructive"
        });
      }
    };
    loadPlaylists();
  }, [userId, toast]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const newPlaylist = await api.createPlaylist(userId, playlistTitle, playlistVisible);
      setPlaylists(prev => [...prev, newPlaylist]);
      setShowCreateDialog(false);
      setPlaylistTitle('');
      setPlaylistVisible(true);
      toast({ title: "Playlist créée !" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPlaylist) return;
    setLoading(true);
    try {
      const updated = await api.updatePlaylist(userId, selectedPlaylist.id, playlistTitle, playlistVisible);
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updated : p));
      if (viewingPlaylist?.id === selectedPlaylist.id) {
        setViewingPlaylist(updated);
      }
      setShowEditDialog(false);
      toast({ title: "Playlist mise à jour !" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!playlistToDelete) return;
    setLoading(true);
    try {
      await api.deletePlaylist(userId, playlistToDelete.id);
      setPlaylists(prev => prev.filter(p => p.id !== playlistToDelete.id));
      if (viewingPlaylist?.id === playlistToDelete.id) {
        setViewingPlaylist(null);
      }
      setPlaylistToDelete(null);
      toast({ title: "Playlist supprimée" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSongs = async (chansonIds: number[]) => {
    if (!selectedPlaylist) return;
    setLoading(true);
    try {
      const updated = await api.addSongsToPlaylist(userId, selectedPlaylist.id, chansonIds);
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updated : p));
      if (viewingPlaylist?.id === selectedPlaylist.id) {
        setViewingPlaylist(updated);
      }
      toast({ title: "Chanson ajoutée !" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = async (chansonId: number) => {
    if (!viewingPlaylist) return;
    setLoading(true);
    try {
      const updated = await api.removeSongFromPlaylist(userId, viewingPlaylist.id, chansonId);
      setPlaylists(prev => prev.map(p => p.id === viewingPlaylist.id ? updated : p));
      setViewingPlaylist(updated);
      toast({ title: "Chanson supprimée de la playlist" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = async (song: ChansonSimple) => {
    try {
      const fullSong = await api.getChanson(song.id);
      onPlaySong(fullSong);
    } catch (error) {
      toast({ title: "Erreur de lecture", variant: "destructive" });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Vue détaillée d'une playlist
  if (viewingPlaylist) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header de la playlist */}
        <div className="flex items-start gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewingPlaylist(null)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="w-32 h-32 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow shrink-0">
            <Music className="w-16 h-16 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <Badge variant={viewingPlaylist.visible ? "default" : "secondary"} className="mb-2">
              {viewingPlaylist.visible ? <><Eye className="w-3 h-3 mr-1" /> Publique</> : <><EyeOff className="w-3 h-3 mr-1" /> Privée</>}
            </Badge>
            <h2 className="text-3xl font-bold truncate">{viewingPlaylist.titre}</h2>
            <p className="text-muted-foreground mt-1">{viewingPlaylist.chansons.length} chansons</p>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPlaylist(viewingPlaylist);
                  setPlaylistTitle(viewingPlaylist.titre);
                  setPlaylistVisible(viewingPlaylist.visible);
                  setShowEditDialog(true);
                }}
                variant="secondary"
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedPlaylist(viewingPlaylist);
                  setShowAddSongsDialog(true);
                }}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter des chansons
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlaylistToDelete(viewingPlaylist);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Liste des chansons */}
        <div className="space-y-1">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border/50">
            <span className="w-10">#</span>
            <span>Titre</span>
            <span className="w-16 text-right"><Clock className="w-4 h-4 inline" /></span>
            <span className="w-10"></span>
          </div>

          {viewingPlaylist.chansons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Cette playlist est vide</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlaylist(viewingPlaylist);
                  setShowAddSongsDialog(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter des chansons
              </Button>
            </div>
          ) : (
            viewingPlaylist.chansons.map((song, index) => (
              <div
                key={song.id}
                className="group grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 flex items-center justify-center">
                  <span className="group-hover:hidden text-muted-foreground">{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden group-hover:flex h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song);
                    }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
                
                <div className="min-w-0">
                  <p className="font-medium truncate">{song.titre}</p>
                  {song.artiste && (
                    <p className="text-sm text-muted-foreground truncate">{song.artiste}</p>
                  )}
                </div>
                
                <span className="w-16 text-right text-sm text-muted-foreground">
                  {song.duree}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSong(song.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
          {/* Dialog Modifier */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Nom de la playlist</Label>
              <Input
                id="edit-title"
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-visible">Playlist publique</Label>
              <Switch
                id="edit-visible"
                checked={playlistVisible}
                onCheckedChange={setPlaylistVisible}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={loading || !playlistTitle.trim()}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ajouter des chansons */}
      <Dialog open={showAddSongsDialog} onOpenChange={setShowAddSongsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter des chansons</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chansons.map((song) => {
              const isInPlaylist = selectedPlaylist?.chansons.some(s => s.id === song.id);
              return (
                <div
                  key={song.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isInPlaylist ? "bg-primary/10 opacity-60" : "bg-secondary/50 hover:bg-secondary"
                  )}
                >
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
                  <Button
                    size="sm"
                    variant={isInPlaylist ? "outline" : "default"}
                    disabled={isInPlaylist || loading}
                    onClick={() => handleAddSongs([song.id])}
                  >
                    {isInPlaylist ? 'Ajoutée' : 'Ajouter'}
                  </Button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSongsDialog(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!playlistToDelete} onOpenChange={() => setPlaylistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{playlistToDelete?.titre}" ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La playlist et ses données seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </div>
      </div>
      
    );
     
  }

  // Vue liste des playlists
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={() => {
          setShowCreateDialog(true);
          setPlaylistTitle('');
          setPlaylistVisible(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Créer une playlist
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {playlists.map((playlist) => (
          <Card
            key={playlist.id}
            className={cn(
              "group cursor-pointer bg-gradient-card border-border/50 overflow-hidden",
              "hover:shadow-glow hover:border-primary/50 transition-all duration-300"
            )}
            onClick={() => setViewingPlaylist(playlist)}
          >
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-primary flex items-center justify-center relative">
                <Music className="w-16 h-16 text-white/80" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{playlist.titre}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {playlist.chansons.length} chanson{playlist.chansons.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {playlist.visible ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {playlist.visible ? 'Publique' : 'Privée'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {playlists.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune playlist</p>
            <p className="text-sm mt-1">Créez votre première playlist pour commencer</p>
          </div>
        )}
      </div>

      {/* Dialog Créer */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une playlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Nom de la playlist</Label>
              <Input
                id="title"
                placeholder="Ma nouvelle playlist..."
                value={playlistTitle}
                onChange={(e) => setPlaylistTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="visible">Playlist publique</Label>
              <Switch
                id="visible"
                checked={playlistVisible}
                onCheckedChange={setPlaylistVisible}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={loading || !playlistTitle.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

     
    </div>
  );
}
