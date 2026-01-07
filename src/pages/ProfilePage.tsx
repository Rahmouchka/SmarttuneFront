// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Music, Calendar, Mail, Phone, Edit2, Save, X, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Interface renommée pour éviter les conflits de type
interface ProfileData {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  numTel: string | null;
  bio: string | null;
  role: string;
  type: 'USER' | 'ARTIST';
  // USER uniquement
  genre?: string;
  dateNaissance?: string;
  // ARTIST uniquement
  nomArtiste?: string;
  nbrAbonnees?: number;
}

const getCurrentUserId = (): number | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson);
    return user.id || null;
  } catch {
    return null;
  }
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = getCurrentUserId();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getMyProfile(userId);
        setProfile(data as ProfileData);
        setFormData(data);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le profil',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate, toast]);

  const handleSave = async () => {
    if (!userId || !formData) return;

    try {
      const updated = await api.updateMyProfile(userId, formData);
      setProfile(updated as ProfileData);
      setEditing(false);
      toast({ title: 'Profil mis à jour avec succès !' });
    } catch (error ) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Chargement du profil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive">Profil non trouvé</p>
      </div>
    );
  }

  const isArtist = profile.type === 'ARTIST';

  return (
    <div className="min-h-screen bg-gradient-bg py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-4">
            {isArtist ? <Music className="w-10 h-10 text-primary" /> : <User className="w-10 h-10 text-primary" />}
            Mon Profil
          </h1>
          <Button onClick={() => setEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" />
            Modifier
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Avatar + infos rapides */}
          <Card className="md:col-span-1">
            <CardContent className="pt-6 text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-5xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold mt-4">
                {isArtist && profile.nomArtiste ? profile.nomArtiste : `${profile.prenom} ${profile.nom}`}
              </h2>
              <p className="text-muted-foreground">@{profile.username}</p>

              {isArtist && (
                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">{profile.nbrAbonnees || 0}</span>
                    <span className="text-muted-foreground">
                      abonné{profile.nbrAbonnees !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Détails */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-muted-foreground">Nom complet</Label>
                  <p className="font-medium">{profile.prenom} {profile.nom}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </p>
                </div>
              </div>

              {profile.numTel && (
                <div>
                  <Label className="text-muted-foreground">Téléphone</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.numTel}
                  </p>
                </div>
              )}

        

              {/* Date de naissance : uniquement pour les users normaux */}
              {!isArtist && profile.dateNaissance && (
                <div>
                  <Label className="text-muted-foreground">Date de naissance</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(profile.dateNaissance).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              {/* Bio : uniquement pour les artistes */}
              {isArtist && profile.bio && (
                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="text-muted-foreground mt-1">{profile.bio}</p>
                </div>
              )}

              {isArtist && !profile.bio && (
                <p className="text-muted-foreground italic">Aucune bio renseignée</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* === Modale d'édition === */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier mon profil</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  value={formData.prenom || ''}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  value={formData.nom || ''}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="numTel">Téléphone (optionnel)</Label>
              <Input
                id="numTel"
                value={formData.numTel || ''}
                onChange={(e) => setFormData({ ...formData, numTel: e.target.value })}
              />
            </div>

            {/* Champs spécifiques ARTISTE */}
            {isArtist && (
              <>
                <div>
                  <Label htmlFor="nomArtiste">Nom d'artiste</Label>
                  <Input
                    id="nomArtiste"
                    value={formData.nomArtiste || ''}
                    onChange={(e) => setFormData({ ...formData, nomArtiste: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez de votre parcours artistique..."
                    rows={5}
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Champs spécifiques USER (non artiste) */}
            {!isArtist && (
              <>
            
                <div>
                  <Label htmlFor="dateNaissance">Date de naissance</Label>
                  <Input
                    id="dateNaissance"
                    type="date"
                    value={formData.dateNaissance || ''}
                    onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}