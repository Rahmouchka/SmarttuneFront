import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
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
import { Music, Trash2, Edit, Plus, Eye, EyeOff, ListMusic,AlertCircle  } from 'lucide-react';
import { api } from '@/lib/api';
import { Playlist, ChansonSimple } from '@/types/music';
import { useToast } from '@/hooks/use-toast';
interface PlaylistsListProps {
  userId: number;
  chansons: ChansonSimple[];
  onUpdate: () => void;
}

export function PlaylistsList({ userId, chansons, onUpdate }: PlaylistsListProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistVisible, setPlaylistVisible] = useState(true);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // AJOUT : Charger les playlists au montage du composant
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
      setSelectedPlaylist(updated);
      toast({ title: "Chansons ajoutées !" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = async (chansonId: number) => {
    if (!selectedPlaylist) return;
    setLoading(true);
    try {
      const updated = await api.removeSongFromPlaylist(userId, selectedPlaylist.id, chansonId);
      setPlaylists(prev => prev.map(p => p.id === selectedPlaylist.id ? updated : p));
      setSelectedPlaylist(updated);
      toast({ title: "Chanson supprimée de la playlist" });
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button onClick={() => {
          setShowCreateDialog(true);
          setPlaylistTitle('');
          setPlaylistVisible(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Créer playlist
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <Card key={playlist.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/10 to-accent/10 border-primary/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{playlist.titre}</h3>
                  <p className="text-sm text-muted-foreground"> {playlist.chansons.length} chansons</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setSelectedPlaylist(playlist);
                  setShowDetailDialog(true);
                }}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedPlaylist(playlist);
                  setPlaylistTitle(playlist.titre);
                  setPlaylistVisible(playlist.visible);
                  setShowEditDialog(true);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button variant="destructive" onClick={() => setPlaylistToDelete(playlist)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {playlists.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune playlist</p>}
      </div>

      {/* Dialog Créer */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Créer une playlist</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Titre" value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} />
            <div className="flex items-center gap-2">
              <Switch checked={playlistVisible} onCheckedChange={setPlaylistVisible} />
              <Label>Publique</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={loading || !playlistTitle.trim()}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier playlist</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Titre" value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} />
            <div className="flex items-center gap-2">
              <Switch checked={playlistVisible} onCheckedChange={setPlaylistVisible} />
              <Label>Publique</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
            <Button onClick={handleEdit} disabled={loading || !playlistTitle.trim()}>Modifier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Détails plus pro */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-primary" />
              {selectedPlaylist?.titre}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedPlaylist?.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {selectedPlaylist?.visible ? 'Publique' : 'Privée'}
            </Badge>
            <h4 className="font-semibold flex items-center gap-2">
              <Music className="w-4 h-4" />
              Chansons ({selectedPlaylist?.chansons.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedPlaylist?.chansons.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="truncate">{song.titre}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSong(song.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {selectedPlaylist?.chansons.length === 0 && (
                <p className="text-center text-muted-foreground flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  Aucune chanson
                </p>
              )}
            </div>
            <h4 className="font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Ajouter des chansons
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {chansons.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="truncate">{song.titre}</span>
                  <Button variant="secondary" size="sm" onClick={() => handleAddSongs([song.id])}>
                    Ajouter
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!playlistToDelete} onOpenChange={() => setPlaylistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer "{playlistToDelete?.titre}" ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}




