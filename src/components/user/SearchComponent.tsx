// src/components/user/SearchComponent.tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Mail } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Search,
  Music,
  User as ArtistIcon,
  Play,
  Heart,
  Album as AlbumIcon,
  Star,
  AlertTriangle,
  X,
} from 'lucide-react';
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
  nbrAbonnees?: number;
}

interface ChansonSimple {
  id: number;
  titre: string;
  url: string;
  duree: string;
  musicGenre: string | { name?: string };
}

interface AlbumInfo {
  id: number;
  titre: string;
  dateSortie?: string;
  couvertureUrl?: string;
  chansons: ChansonSimple[];
}

interface SearchComponentProps {
  userId: number;
  onPlaySong: (song: ChansonResponse) => void;
  onUpdate: () => void;
}

// === Composant RatingStars intégré ===
function RatingStars({
  userId,
  chansonId,
  initialRating = 0,
  onRatingChange,
}: {
  userId: number;
  chansonId: number;
  initialRating?: number;
  onRatingChange?: (rating: number) => Promise<void>;
}) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = async (value: number) => {
    if (loading) return;
    setLoading(true);

    try {
      if (rating === value) {
        await api.deleteRating(userId, chansonId);
        setRating(0);
        await onRatingChange?.(0);
        toast({ title: 'Note supprimée' });
      } else {
        await api.rateChanson(userId, chansonId, value);
        setRating(value);
        await onRatingChange?.(value);
        toast({ title: `Noté ${value}/5 ⭐` });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la note',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={loading}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className={`transition-all ${loading ? 'opacity-50' : 'hover:scale-110'}`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
      {rating > 0 && <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>}
    </div>
  );
}

export function SearchComponent({ userId, onPlaySong, onUpdate }: SearchComponentProps) {
  const [query, setQuery] = useState('');
  const [allChansons, setAllChansons] = useState<ChansonResponse[]>([]);
  const [displayedChansons, setDisplayedChansons] = useState<ChansonResponse[]>([]);
  const [artistesResults, setArtistesResults] = useState<ArtisteSearchResult[]>([]);
  const [albumsResults, setAlbumsResults] = useState<AlbumInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtiste, setSelectedArtiste] = useState<ArtisteSearchResult | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumInfo | null>(null);
  const [favoriChansons, setFavoriChansons] = useState<Set<number>>(new Set());
  const [userRatings, setUserRatings] = useState<Map<number, number>>(new Map());
  const { toast } = useToast();

  // États pour le signalement
  const [showReportModal, setShowReportModal] = useState(false);
  const [songToReport, setSongToReport] = useState<ChansonResponse | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

  // === Fonctions de signalement ===
  const openReportModal = (song: ChansonResponse) => {
    setSongToReport(song);
    setReportReason('');
    setReportSuccess(false);
    setShowReportModal(true);
  };

  const handleReportSong = async () => {
    if (!songToReport || !reportReason.trim()) return;

    setReporting(true);
    try {
      await api.reportChanson(userId, songToReport.id, reportReason.trim());
      setReportSuccess(true);
      toast({ title: 'Signalement envoyé', description: 'Merci pour votre vigilance.' });

      setTimeout(() => {
        setShowReportModal(false);
        setReportReason('');
        setSongToReport(null);
        setReportSuccess(false);
      }, 2500);
    } catch (error) {
      console.error('Erreur signalement:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le signalement",
        variant: 'destructive',
      });
    } finally {
      setReporting(false);
    }
  };

  useEffect(() => {
    loadAllChansons();
    loadFavoris();
  }, [userId]);

  const loadAllChansons = async () => {
    setLoading(true);
    try {
      const chansons = await api.getAllChansons();
      setAllChansons(chansons);
      setDisplayedChansons(chansons);
      setArtistesResults([]);
      setAlbumsResults([]);
      await loadUserRatings(chansons.map((c) => c.id));
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les chansons', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadFavoris = async () => {
    try {
      const favoris = await api.getUserFavoris(userId);
      let chansonIds: number[] = [];
      if (Array.isArray(favoris)) {
        chansonIds = favoris.map((f) => f.id);
      } else if (favoris && Array.isArray(favoris.chansons)) {
        chansonIds = favoris.chansons.map((f) => f.id);
      }
      setFavoriChansons(new Set(chansonIds));
    } catch (error) {
      console.error('Erreur favoris:', error);
      setFavoriChansons(new Set());
    }
  };

  const loadUserRatings = async (chansonIds: number[]) => {
    if (chansonIds.length === 0) {
      setUserRatings(new Map());
      return;
    }

    const ratingsMap = new Map<number, number>();

    await Promise.all(
      chansonIds.map(async (id) => {
        try {
          const res = await api.getMyRatingForChanson(userId, id);
          if (res.success && res.data && typeof res.data.note === 'number') {
            ratingsMap.set(id, res.data.note);
          }
        } catch (error) {
          if (!error.message?.includes('404') && !error.message?.includes('400')) {
            console.warn(`Erreur rating chanson ${id}:`, error);
          }
        }
      })
    );

    setUserRatings(ratingsMap);
  };

  const refreshCurrentRatings = useCallback(async () => {
    let ids: number[] = [];

    if (displayedChansons.length > 0) {
      ids = displayedChansons.map((c) => c.id);
    } else if (selectedAlbum) {
      ids = selectedAlbum.chansons.map((c) => c.id);
    } else {
      ids = allChansons.map((c) => c.id);
    }

    if (ids.length > 0) {
      await loadUserRatings(ids);
    }
  }, [displayedChansons, selectedAlbum, allChansons, userId]);

  const handleSearch = async () => {
    const q = query.trim();

    if (!q) {
      setDisplayedChansons(allChansons);
      setArtistesResults([]);
      setAlbumsResults([]);
      await loadUserRatings(allChansons.map((c) => c.id));
      return;
    }

    setLoading(true);
    try {
      const [artistes, chansonsDirectes, albums] = await Promise.all([
        api.searchArtistes(q).catch(() => []),
        api.searchChansons(q).catch(() => []),
        api.searchAlbums(q).catch(() => []),
      ]);

      setArtistesResults(artistes);
      setAlbumsResults(albums);

      const allFoundChansons = new Map<number, ChansonResponse>();

      chansonsDirectes.forEach((c) => allFoundChansons.set(c.id, c));

      albums.forEach((album) => {
        (album.chansons || []).forEach((c) => {
          const chanson: ChansonResponse = {
            id: c.id,
            titre: c.titre,
            url: c.url,
            duree: c.duree,
            musicGenre: typeof c.musicGenre === 'string' ? c.musicGenre : c.musicGenre?.name || '',
            albumId: album.id,
            albumTitre: album.titre,
          };
          allFoundChansons.set(c.id, chanson);
        });
      });

      if (artistes.length > 0) {
        const albumsPromises = artistes.map((a) => api.getArtistAlbums(a.id).catch(() => []));
        const artisteAlbums = await Promise.all(albumsPromises);
        const flattenedAlbums = artisteAlbums.flat();

        const existingAlbumIds = new Set(albums.map((a) => a.id));
        const newAlbums: AlbumInfo[] = [];

        flattenedAlbums.forEach((album) => {
          if (!existingAlbumIds.has(album.id)) {
            newAlbums.push(album);
            existingAlbumIds.add(album.id);
          }
          (album.chansons || []).forEach((c) => {
            const chanson: ChansonResponse = {
              id: c.id,
              titre: c.titre,
              url: c.url,
              duree: c.duree,
              musicGenre: typeof c.musicGenre === 'string' ? c.musicGenre : c.musicGenre?.name || '',
              albumId: album.id,
              albumTitre: album.titre,
            };
            allFoundChansons.set(c.id, chanson);
          });
        });

        setAlbumsResults([...albums, ...newAlbums]);
      }

      const uniqueChansons = Array.from(allFoundChansons.values());
      setDisplayedChansons(uniqueChansons);
      await loadUserRatings(uniqueChansons.map((c) => c.id));
    } catch (error) {
      toast({ title: 'Erreur de recherche', description: 'Vérifiez votre connexion', variant: 'destructive' });
      setDisplayedChansons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleArtisteClick = async (artiste: ArtisteSearchResult) => {
    setSelectedArtiste(artiste);
    setLoading(true);

    try {
      const albums = await api.getArtistAlbums(artiste.id);
      setAlbumsResults(albums);

      const chansons: ChansonResponse[] = albums.flatMap((album) =>
        (album.chansons || []).map((c) => ({
          id: c.id,
          titre: c.titre,
          url: c.url,
          duree: c.duree,
          musicGenre: typeof c.musicGenre === 'string' ? c.musicGenre : c.musicGenre?.name || '',
          albumId: album.id,
          albumTitre: album.titre,
        }))
      );
      setDisplayedChansons(chansons);
      await loadUserRatings(chansons.map((c) => c.id));
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les albums', variant: 'destructive' });
      setAlbumsResults([]);
      setDisplayedChansons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = (album: AlbumInfo) => {
    setSelectedAlbum(album);
  };

  const handleToggleFavoriChanson = async (chansonId: number) => {
    try {
      if (favoriChansons.has(chansonId)) {
        await api.removeFromFavoris(userId, chansonId);
        setFavoriChansons((prev) => {
          const s = new Set(prev);
          s.delete(chansonId);
          return s;
        });
        toast({ title: 'Retiré des favoris' });
      } else {
        await api.addToFavoris(userId, chansonId);
        setFavoriChansons((prev) => new Set(prev).add(chansonId));
        toast({ title: 'Ajouté aux favoris !' });
      }
      onUpdate();
    } catch (error) {
      toast({ title: 'Erreur favoris', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Barre de recherche */}
      <div className="flex gap-4">
        <Input
          placeholder="Rechercher une chanson, un artiste ou un album..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" /> Rechercher
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Chargement...</p>
      ) : (
        <>
          {/* Section Artistes */}
          {artistesResults.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-5">Artistes</h3>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {artistesResults.map((artiste) => (
                  <Card
                    key={artiste.id}
                    className="p-5 hover:shadow-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/30"
                    onClick={() => handleArtisteClick(artiste)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full flex items-center justify-center">
                        <ArtistIcon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {artiste.nomArtiste || `${artiste.prenom || ''} ${artiste.nom || ''}`.trim()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {artiste.nbrAbonnees || 0} abonné{(artiste.nbrAbonnees || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section Albums */}
          {albumsResults.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-6">Albums</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {albumsResults.map((album) => (
                  <Card
                    key={album.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-card border border-transparent hover:border-primary/40"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-accent/10">
                      {album.couvertureUrl ? (
                        <img
                          src={`${API_BASE_URL}${album.couvertureUrl}`}
                          alt={album.titre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
                          <AlbumIcon className="w-20 h-20 mb-3" />
                          <span className="text-sm">Aucune couverture</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg truncate">{album.titre}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {album.chansons?.length || 0} chanson{(album.chansons?.length || 0) !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Section Chansons */}
          <section>
            <h3 className="text-xl font-semibold mb-5">
              {query.trim()
                ? `Chansons trouvées (${displayedChansons.length})`
                : `Toutes les chansons (${allChansons.length})`}
            </h3>

            {displayedChansons.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground text-lg">
                {query.trim() ? 'Aucun résultat trouvé' : 'Aucune chanson disponible'}
              </p>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {displayedChansons.map((chanson) => {
                  const isFavori = favoriChansons.has(chanson.id);
                  const userRating = userRatings.get(chanson.id) || 0;

                  return (
                    <Card key={chanson.id} className="hover:shadow-xl transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Music className="w-7 h-7 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{chanson.titre}</h4>
                            <p className="text-sm text-muted-foreground mt-1">Genre : {chanson.musicGenre}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              Album : {chanson.albumTitre || 'Single'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-5">
                          <Button className="flex-1 mr-3" size="sm" onClick={() => onPlaySong(chanson)}>
                            <Play className="w-4 h-4 mr-2" /> Écouter
                          </Button>

                          <div className="flex items-center gap-2">
                            <RatingStars
                              userId={userId}
                              chansonId={chanson.id}
                              initialRating={userRating}
                              onRatingChange={refreshCurrentRatings}
                            />

                            <Button
                              variant={isFavori ? 'default' : 'outline'}
                              size="icon"
                              onClick={() => handleToggleFavoriChanson(chanson.id)}
                            >
                              <Heart className={`w-4 h-4 ${isFavori ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReportModal(chanson);
                              }}
                              title="Signaler cette chanson"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Dialog Profil Artiste */}
    <Dialog open={!!selectedArtiste} onOpenChange={() => setSelectedArtiste(null)}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle className="text-2xl flex items-center gap-3">
        <ArtistIcon className="w-8 h-8 text-primary" />
        {selectedArtiste?.nomArtiste || 
         `${selectedArtiste?.prenom || ''} ${selectedArtiste?.nom || ''}`.trim() || 'Artiste inconnu'}
      </DialogTitle>
      <DialogDescription className="sr-only">Profil de l'artiste</DialogDescription>
    </DialogHeader>

    <div className="mt-6 space-y-6">
      {/* Avatar + Nom principal */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="w-32 h-32 mb-4 border-4 border-primary/20">
          <AvatarFallback className="text-4xl bg-gradient-primary text-white">
            {selectedArtiste?.nomArtiste?.[0]?.toUpperCase() || 
             selectedArtiste?.prenom?.[0]?.toUpperCase() || 
             selectedArtiste?.nom?.[0]?.toUpperCase() || 
             '?'}
          </AvatarFallback>
        </Avatar>

        <h3 className="text-xl font-bold">
          {selectedArtiste?.nomArtiste || 'Artiste sans nom'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {selectedArtiste?.prenom} {selectedArtiste?.nom}
        </p>
      </div>

      {/* Infos principales */}
      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span>{selectedArtiste?.email || 'Email non renseigné'}</span>
        </div>

        {selectedArtiste?.nbrAbonnees !== undefined && selectedArtiste?.nbrAbonnees !== null && (
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>
              <strong>{selectedArtiste.nbrAbonnees.toLocaleString()}</strong> abonné{selectedArtiste.nbrAbonnees > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {selectedArtiste?.bio ? (
          <div className="mt-4">
            <p className="text-muted-foreground text-sm italic leading-relaxed">
              "{selectedArtiste.bio}"
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">Aucune bio renseignée</p>
        )}
      </div>

      {/* Bouton fermer (optionnel, mais propre) */}
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={() => setSelectedArtiste(null)}>
          Fermer
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

      {/* Dialog Détail Album */}
      <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-6">
              {selectedAlbum?.couvertureUrl ? (
                <img
                  src={`${API_BASE_URL}${selectedAlbum.couvertureUrl}`}
                  alt={selectedAlbum.titre}
                  className="w-32 h-32 rounded-xl object-cover shadow-2xl"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center">
                  <AlbumIcon className="w-16  w-16 h-16 text-muted-foreground/50" />
                </div>
              )}
              <div>
                <DialogTitle className="text-3xl font-bold">{selectedAlbum?.titre}</DialogTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  {selectedAlbum?.chansons?.length || 0} chanson{(selectedAlbum?.chansons?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <DialogDescription className="sr-only">
              Détails de l'album {selectedAlbum?.titre}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {selectedAlbum?.chansons.map((c, index) => {
              const chanson: ChansonResponse = {
                id: c.id,
                titre: c.titre,
                url: c.url,
                musicGenre: typeof c.musicGenre === 'string' ? c.musicGenre : c.musicGenre?.name || '',
                albumId: selectedAlbum.id,
                albumTitre: selectedAlbum.titre,
              };
              const isFavori = favoriChansons.has(chanson.id);
              const userRating = userRatings.get(chanson.id) || 0;

              return (
                <Card key={c.id} className="hover:bg-accent/5 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-light text-muted-foreground w-10 text-right">{index + 1}</span>
                      <Music className="w-9 h-9 text-primary/70" />
                      <div className="flex-1">
                        <p className="font-medium text-lg">{c.titre}</p>
                        <p className="text-sm text-muted-foreground">{c.duree || '—'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <RatingStars
                          userId={userId}
                          chansonId={chanson.id}
                          initialRating={userRating}
                          onRatingChange={refreshCurrentRatings}
                        />
                        <Button size="sm" onClick={() => onPlaySong(chanson)}>
                          <Play className="w-4 h-4 mr-1" /> Play
                        </Button>
                        <Button
                          variant={isFavori ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => handleToggleFavoriChanson(chanson.id)}
                        >
                          <Heart className={`w-4 h-4 ${isFavori ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReportModal(chanson);
                          }}
                          title="Signaler"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* === Modale de signalement de chanson === */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Signaler une chanson</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setShowReportModal(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          {songToReport && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Chanson : <span className="font-semibold">{songToReport.titre}</span>
              </p>

              {!reportSuccess ? (
                <>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Décrivez la raison du signalement (contenu inapproprié, violation des droits d'auteur, etc.)"
                    className="w-full h-32 p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                    disabled={reporting}
                  />

                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setShowReportModal(false)} disabled={reporting}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleReportSong}
                      disabled={reporting || !reportReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {reporting ? 'Envoi...' : 'Signaler'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold">Signalement envoyé</p>
                  <p className="text-sm text-muted-foreground mt-2">Nous examinerons votre rapport rapidement.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}