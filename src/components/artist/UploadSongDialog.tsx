import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Music } from 'lucide-react';
import { MusicGenre } from '@/types/music';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UploadSongDialogProps {
  artisteId: number;
  onSuccess: () => void;
}

export function UploadSongDialog({ artisteId, onSuccess }: UploadSongDialogProps) {
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState('');
  const [genre, setGenre] = useState<MusicGenre | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !titre) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs requis',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('titre', titre);
      if (genre) formData.append('musicGenre', genre);

      await api.uploadSong(artisteId, formData);
      toast({
        title: 'Succès',
        description: 'Chanson uploadée avec succès',
      });
      setOpen(false);
      setTitre('');
      setGenre('');
      setFile(null);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Échec de l\'upload de la chanson',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary shadow-elegant">
          <Upload className="mr-2 h-4 w-4" />
          Uploader une chanson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Uploader une nouvelle chanson
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titre">Titre de la chanson *</Label>
            <Input
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Entrez le titre"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre musical</Label>
            <Select value={genre} onValueChange={(value) => setGenre(value as MusicGenre)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un genre" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MusicGenre).map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Fichier audio *</Label>
            <Input
              id="file"
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Fichier sélectionné: {file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Upload en cours...' : 'Uploader'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
