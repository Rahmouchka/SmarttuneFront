import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Album as AlbumIcon, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateAlbumDialogProps {
  artisteId: number;
  onSuccess: () => void;
}

export function CreateAlbumDialog({ artisteId, onSuccess }: CreateAlbumDialogProps) {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCoverFile(null);
      setPreviewUrl(null);
      return;
    }

    // Optionnel : vérifier le type ou la taille
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format invalide',
        description: 'Veuillez sélectionner une image (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setCoverFile(file);

    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

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
      await api.createAlbum(artisteId, titre, coverFile || undefined);
      
      toast({
        title: 'Succès',
        description: 'Album créé avec succès !',
      });

      // Reset du formulaire
      setTitre('');
      setCoverFile(null);
      setPreviewUrl(null);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Erreur création album:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la création de l\'album. Réessayez.',
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

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlbumIcon className="h-5 w-5 text-primary" />
            Créer un nouvel album
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="titre-album">Titre de l'album *</Label>
            <Input
              id="titre-album"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: Mon Premier Album"
              required
            />
          </div>

          {/* Couverture */}
          <div className="space-y-2">
            <Label htmlFor="cover">Image de couverture</Label>
            <div className="flex flex-col items-center justify-center w-full">
              {previewUrl ? (
                <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden border-2 border-dashed border-primary/30">
                  <img
                    src={previewUrl}
                    alt="Prévisualisation couverture"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 mb-4 flex items-center justify-center bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30">
                  <AlbumIcon className="w-16 h-16 text-muted-foreground/40" />
                </div>
              )}

              <Label
                htmlFor="cover"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
              >
                <Upload className="w-4 h-4" />
                Choisir une image
              </Label>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {coverFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  {coverFile.name} ({(coverFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer l\'album'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}