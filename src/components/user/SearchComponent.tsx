// src/components/user/SearchComponent.tsx
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Music, User as ArtistIcon, Play, Mail, Users, Heart, Album as AlbumIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { ChansonResponse } from '@/types/music';
import { useToast } from '@/hooks/use-toast';

interface ArtisteSearchResult {
  id: number;
  nomArtiste?: string;
  prenom?: string;
  nom?: string;
  bio?: string;
  email?: string;
  nbrAbonnements?: number;
  nbrAbonnees?: number;
}

interface AlbumInfo {
  id: number;
  titre: string;
  chansons: ChansonResponse[];
}

interface SearchComponentProps {
  userId: number;
  onPlaySong: (song: ChansonResponse) => void;
  onUpdate: () => void;
}

export function SearchComponent({ userId, onPlaySong, onUpdate }: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [allChansons, setAllChansons] = useState<ChansonResponse[]>([]);
  const [displayedChansons, setDisplayedChansons] = useState<ChansonResponse[]>([]);
  const [artistesResults, setArtistesResults] = useState<ArtisteSearchResult[]>([]);
  const [albumsResults, setAlbumsResults] = useState<AlbumInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedArtiste, setSelectedArtiste] = useState<ArtisteSearchResult | null>(null);
  const [favoriChansons, setFavoriChansons] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Charger toutes les chansons au montage
  useEffect(() => {
    loadAllChansons();
    loadFavoris();
  }, [userId]);

  const loadAllChansons = async () => {
    setLoading(true);
    try {
      const chansons = await api.searchChansons('');
      setAllChansons(chansons);
      setDisplayedChansons(chansons);
    } catch (error) {
      console.error('Erreur chargement chansons:', error);
      toast({ title: "Erreur", description: "Impossible de charger les chansons", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadFavoris = async () => {
    try {
      const favoris = await api.getUserFavoris(userId);
      const chansonIds = new Set(favoris.map((f: any) => f.id));
      setFavoriChansons(chansonIds);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      // Si la recherche est vide, réafficher toutes les chansons
      setDisplayedChansons(allChansons);
      setArtistesResults([]);
      setAlbumsResults([]);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const [artistes, chansons] = await Promise.all([
        api.searchArtistes(query),
        api.searchChansons(query),
      ]);
      
      setArtistesResults(artistes);
      setDisplayedChansons(chansons);
      
      // Charger les albums des artistes trouvés
      const albumsPromises = artistes.map(async (artiste: ArtisteSearchResult) => {
        try {
          const albums = await api.getArtistAlbums(artiste.id);
          return albums;
        } catch (error) {
          return [];
        }
      });
      
      const albumsArrays = await Promise.all(albumsPromises);
      const allAlbums = albumsArrays.flat();
      setAlbumsResults(allAlbums);
      
    } catch (error) {
      toast({ title: "Erreur de recherche", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavoriChanson = async (chansonId: number) => {
    try {
      if (favoriChansons.has(chansonId)) {
        await api.removeFromFavoris(userId, chansonId);
        setFavoriChansons(prev => {
          const newSet = new Set(prev);
          newSet.delete(chansonId);
          return newSet;
        });
        toast({ title: "Retiré des favoris" });
      } else {
        await api.addToFavoris(userId, chansonId);
        setFavoriChansons(prev => new Set(prev).add(chansonId));
        toast({ title: "Ajouté aux favoris !" });
      }
      onUpdate();
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de modifier les favoris", variant: "destructive" });
    }
  };

  const handleArtisteClick = async (artiste: ArtisteSearchResult) => {
    setSelectedArtiste(artiste);
    setLoading(true);
    try {
      // Charger les chansons de l'artiste
      const chansons = await api.getArtistSongs(artiste.id);
      setDisplayedChansons(chansons);
      
      // Charger les albums de l'artiste
      const albums = await api.getArtistAlbums(artiste.id);
      setAlbumsResults(albums);
    } catch (error) {
      console.error('Erreur chargement artiste:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher par artiste, chanson, album..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Rechercher
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-8">Chargement...</p>
      ) : (
        <>
          {/* Résultats artistes - Seulement si recherche active */}
          {isSearching && artistesResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Artistes ({artistesResults.length})</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {artistesResults.map((artiste) => (
                  <Card 
                    key={artiste.id} 
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => handleArtisteClick(artiste)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <ArtistIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {artiste.nomArtiste || `${artiste.prenom || ''} ${artiste.nom || ''}`.trim() || 'Artiste inconnu'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {artiste.bio ? artiste.bio.substring(0, 40) + '...' : 'Cliquez pour voir les chansons'}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Albums - Seulement si recherche active */}
          {isSearching && albumsResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Albums ({albumsResults.length})</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {albumsResults.map((album) => (
                  <Card key={album.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <AlbumIcon className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{album.titre}</p>
                        <p className="text-sm text-muted-foreground">{album.chansons?.length || 0} chansons</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Chansons - Toujours affichées */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {isSearching ? `Chansons (${displayedChansons.length})` : `Toutes les chansons (${displayedChansons.length})`}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedChansons.map((chanson) => {
                const isFavori = favoriChansons.has(chanson.id);
                return (
                  <Card key={chanson.id} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Music className="w-6 h-6 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{chanson.titre}</p>
                          <p className="text-sm text-muted-foreground">Genre: {chanson.musicGenre}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            Album: {chanson.albumTitre || 'Aucun'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => onPlaySong(chanson)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Écouter
                        </Button>
                        <Button 
                          variant={isFavori ? "default" : "outline"} 
                          size="icon"
                          onClick={() => handleToggleFavoriChanson(chanson.id)}
                        >
                          <Heart className={`w-4 h-4 ${isFavori ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {displayedChansons.length === 0 && (
                <p className="text-center py-8 text-muted-foreground col-span-full">
                  {isSearching ? 'Aucune chanson trouvée' : 'Aucune chanson disponible'}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Dialog détails artiste */}
      <Dialog open={!!selectedArtiste} onOpenChange={() => setSelectedArtiste(null)}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ArtistIcon className="w-6 h-6 text-primary" />
              {selectedArtiste?.nomArtiste || `${selectedArtiste?.prenom || ''} ${selectedArtiste?.nom || ''}`.trim() || 'Artiste'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <p>Email: {selectedArtiste?.email || 'Non disponible'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <p>Abonnés: {selectedArtiste?.nbrAbonnees || 0}</p>
            </div>
            <div>
              <Badge variant="outline">Bio</Badge>
              <p className="mt-2 text-muted-foreground">{selectedArtiste?.bio || 'Non renseignée'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}