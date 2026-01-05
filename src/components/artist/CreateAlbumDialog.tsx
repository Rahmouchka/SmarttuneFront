import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Album as AlbumIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateAlbumDialogProps {
  artisteId: number;
  onSuccess: () => void;
}

export function CreateAlbumDialog({ artisteId, onSuccess }: CreateAlbumDialogProps) {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un titre pour l\'album',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.createAlbum(artisteId, titre);
      toast({
        title: 'Succès',
        description: 'Album créé avec succès',
      });
      setOpen(false);
      setTitre('');
      onSuccess();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de la création de l\'album',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/50 hover:bg-primary/5">
          <AlbumIcon className="mr-2 h-4 w-4" />
          Créer un album
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlbumIcon className="h-5 w-5 text-primary" />
            Créer un nouvel album
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titre-album">Titre de l'album *</Label>
            <Input
              id="titre-album"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Entrez le titre de l'album"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer l\'album'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
