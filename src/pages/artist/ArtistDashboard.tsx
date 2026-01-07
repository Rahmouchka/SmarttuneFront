// src/pages/artist/ArtistDashboard.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Album as AlbumIcon, Play, Pause, SkipForward, SkipBack, Volume2, X, Star, TrendingUp, Users, Award } from 'lucide-react';
import { UploadSongDialog } from '@/components/artist/UploadSongDialog';
import { SongsList } from '@/components/artist/SongsList';
import { AlbumsList } from '@/components/artist/AlbumsList';
import { api } from '@/lib/api';
import { ChansonResponse, AlbumResponse } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// === Types pour les statistiques ===
interface ChansonStatsResponse {
  chansonId: number;
  titre: string;
  moyenneNote: number;
  nombreEvaluations: number; // ← Correction: nombreEvaluations au lieu de nombreRatings
}

interface GlobalStats {
  moyenneGenerale: number;
  totalRatings: number;
  chansonLaPlusNotee: string | null;
  nombreChansonsNotees: number;
}

// Récupère l'artiste connecté depuis localStorage
const getCurrentArtist = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const currentArtist = getCurrentArtist();

  useEffect(() => {
    if (!currentArtist) navigate('/login');
  }, [currentArtist, navigate]);

  const ARTIST_ID = currentArtist?.id;
  const artistName = currentArtist?.nom || 'Artiste';

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // États principaux
  const [songs, setSongs] = useState<ChansonResponse[]>([]);
  const [albums, setAlbums] = useState<AlbumResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les statistiques
  const [chansonsStats, setChansonsStats] = useState<ChansonStatsResponse[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Lecteur audio
  const [currentSong, setCurrentSong] = useState<ChansonResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Création d'album
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);

  // === Chargement des données principales (chansons + albums) ===
  const fetchData = async () => {
    if (!ARTIST_ID) return;
    setLoading(true);
    try {
      const [fetchedSongs, fetchedAlbums] = await Promise.all([
        api.getArtistSongs(ARTIST_ID),
        api.getArtistAlbums(ARTIST_ID),
      ]);
      setSongs(fetchedSongs);
      setAlbums(fetchedAlbums);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // === Chargement des statistiques AMÉLIORÉ ===
  const fetchStats = async () => {
    if (!ARTIST_ID) return;
    setLoadingStats(true);
    setStatsError(null);
    
    try {
      const response = await api.getArtisteChansonsStats(ARTIST_ID);

      if (response.success && Array.isArray(response.data)) {
        const stats: ChansonStatsResponse[] = response.data;
        setChansonsStats(stats);

        // Filtrer uniquement les chansons qui ont au moins une note
        const validStats = stats.filter(s => s.nombreEvaluations > 0);

        if (validStats.length === 0) {
          // Aucune chanson notée
          setGlobalStats({
            moyenneGenerale: 0,
            totalRatings: 0,
            chansonLaPlusNotee: null,
            nombreChansonsNotees: 0,
          });
          return;
        }

        // Calculs statistiques
        const totalRatings = validStats.reduce((sum, s) => sum + s.nombreEvaluations, 0);
        const sommePonderee = validStats.reduce((sum, s) => sum + s.moyenneNote * s.nombreEvaluations, 0);
        const moyenneGenerale = sommePonderee / totalRatings;

        // Trouver la chanson avec la meilleure note
        const topSong = validStats.reduce((prev, curr) =>
          curr.moyenneNote > prev.moyenneNote ? curr : prev
        );

        setGlobalStats({
          moyenneGenerale: Math.round(moyenneGenerale * 10) / 10,
          totalRatings,
          chansonLaPlusNotee: topSong.titre,
          nombreChansonsNotees: validStats.length,
        });
      } else {
        // Réponse invalide
        setChansonsStats([]);
        setGlobalStats({
          moyenneGenerale: 0,
          totalRatings: 0,
          chansonLaPlusNotee: null,
          nombreChansonsNotees: 0,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setStatsError(error.message || 'Erreur de chargement des statistiques');
      setChansonsStats([]);
      setGlobalStats({
        moyenneGenerale: 0,
        totalRatings: 0,
        chansonLaPlusNotee: null,
        nombreChansonsNotees: 0,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ARTIST_ID]);

  // Charger les stats uniquement quand l'onglet "Statistiques" est ouvert
  const handleTabChange = (value: string) => {
    if (value === 'stats' && chansonsStats.length === 0 && !loadingStats) {
      fetchStats();
    }
  };

  // === Gestion du lecteur audio ===
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch((e) => {
        console.error('Erreur de lecture audio:', e);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const playSong = (song: ChansonResponse) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
      setShowPlayer(true);
    }
  };

  const playNext = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex < songs.length - 1) playSong(songs[currentIndex + 1]);
  };

  const playPrevious = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex > 0) playSong(songs[currentIndex - 1]);
  };

  const seekTo = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateAlbum = async () => {
    if (!ARTIST_ID || !albumTitle.trim()) return;
    try {
      await api.createAlbum(ARTIST_ID, albumTitle.trim(), albumCover || undefined);
      setAlbumTitle('');
      setAlbumCover(null);
      setShowCreateDialog(false);
      await fetchData();
    } catch (error) {
      console.error('Erreur création album:', error);
    }
  };

  const availableSongs = songs.filter(s => !s.albumId);

  if (!ARTIST_ID) return <p className="text-center py-12">Aucun artiste connecté.</p>;

  return (
    <div className="min-h-screen bg-gradient-bg pb-32">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {artistName}
            </h1>
            <p className="text-muted-foreground mt-1">Gérez votre musique et vos albums</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
      Voir mon profil public
    </Button>
          <Button variant="destructive" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Cartes récapitulatives */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-glow border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Chansons</CardTitle>
              <Music className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{songs.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-glow-accent border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Albums</CardTitle>
              <AlbumIcon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{albums.length}</div>
            </CardContent>
          </Card>

          {globalStats && globalStats.totalRatings > 0 && (
            <Card className="shadow-glow border-border/50 bg-card/80 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
                <Star className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold flex items-center gap-2">
                  {globalStats.moyenneGenerale.toFixed(1)}
                  <Star className="w-7 h-7 text-yellow-500 fill-current" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  sur {globalStats.totalRatings} note{globalStats.totalRatings > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Onglets */}
        <Tabs defaultValue="songs" onValueChange={handleTabChange}>
          <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
            <TabsTrigger value="songs">Chansons</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* === Chansons === */}
          <TabsContent value="songs">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Mes Chansons</CardTitle>
                <UploadSongDialog artisteId={ARTIST_ID} onSuccess={fetchData} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-12">Chargement…</p>
                ) : (
                  <SongsList
                    songs={songs}
                    artisteId={ARTIST_ID}
                    onUpdate={fetchData}
                    onPlaySong={playSong}
                    currentSongId={currentSong?.id}
                    isPlaying={isPlaying}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Albums === */}
          <TabsContent value="albums">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Mes Albums</CardTitle>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>Créer un album</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>Nouvel album</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                          id="title"
                          placeholder="Mon super album"
                          value={albumTitle}
                          onChange={(e) => setAlbumTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cover">Couverture (optionnel)</Label>
                        <Input
                          id="cover"
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && setAlbumCover(e.target.files[0])}
                        />
                        {albumCover && <p className="text-sm text-muted-foreground">{albumCover.name}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
                      <Button onClick={handleCreateAlbum} disabled={!albumTitle.trim()}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-12">Chargement…</p>
                ) : (
                  <AlbumsList
                    albums={albums}
                    artisteId={ARTIST_ID}
                    onUpdate={fetchData}
                    availableSongs={availableSongs}
                    onPlaySong={playSong}
                    currentSongId={currentSong?.id}
                    isPlaying={isPlaying}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === Statistiques AMÉLIORÉES === */}
          <TabsContent value="stats">
            <div className="space-y-8">
              {loadingStats ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-muted-foreground">Chargement des statistiques...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : statsError ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <p className="text-destructive font-medium">Erreur lors du chargement</p>
                      <p className="text-sm text-muted-foreground">{statsError}</p>
                      <Button onClick={fetchStats} variant="outline">
                        Réessayer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : globalStats && globalStats.totalRatings > 0 ? (
                <>
                  {/* Stats globales */}
                  <div className="grid gap-6 md:grid-cols-4">
                    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Moyenne générale</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold flex items-center gap-2">
                          {globalStats.moyenneGenerale.toFixed(1)} 
                          <Star className="w-7 h-7 text-yellow-500 fill-current" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Performance globale
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total des notes</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{globalStats.totalRatings}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Évaluations reçues
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Chansons notées</CardTitle>
                        <Music className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{globalStats.nombreChansonsNotees}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          sur {songs.length} chansons
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Meilleure chanson</CardTitle>
                        <Award className="h-4 w-4 text-yellow-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-semibold truncate">
                          {globalStats.chansonLaPlusNotee || 'Aucune'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Top performance
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stats par chanson */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Détails par chanson</CardTitle>
                      <Button onClick={fetchStats} variant="outline" size="sm">
                        Actualiser
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {chansonsStats.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                          Aucune note pour le moment. Les fans vont bientôt arriver ! 🎵
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {chansonsStats
                            .sort((a, b) => b.moyenneNote - a.moyenneNote)
                            .map((stat, index) => (
                              <div
                                key={stat.chansonId}
                                className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-background/50 to-secondary/30 border hover:border-primary/50 transition-all"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{stat.titre}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {stat.nombreEvaluations} note{stat.nombreEvaluations > 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl font-bold">{stat.moyenneNote.toFixed(1)}</span>
                                      <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Star className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Aucune statistique disponible</h3>
                        <p className="text-muted-foreground">
                          Vos chansons n'ont pas encore été évaluées.<br />
                          Partagez votre musique pour commencer à recevoir des notes !
                        </p>
                      </div>
                      <Button onClick={fetchStats} variant="outline">
                        Actualiser les statistiques
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* === Mini-player === */}
      {currentSong && showPlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 shadow-2xl">
          <button onClick={() => setShowPlayer(false)} className="absolute top-3 right-4 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>

          <audio ref={audioRef} src={currentSong.url} preload="metadata" />

          <div className="h-1 bg-muted/40 cursor-pointer" onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seekTo(percent * duration);
          }}>
            <div className="h-full bg-gradient-to-r from-pink-500 to-orange-500" style={{ width: `${(progress / duration) * 100 || 0}%` }} />
          </div>

          <div className="container mx-auto px-6 py-5">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Music className="w-9 h-9 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">{currentSong.titre}</p>
                  <p className="text-sm text-muted-foreground">{currentSong.albumTitre || 'Single'}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" onClick={playPrevious}><SkipBack className="w-6 h-6" /></Button>
                <Button
                  size="icon"
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 hover:scale-110"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext}><SkipForward className="w-6 h-6" /></Button>
              </div>

              <div className="flex items-center gap-4 w-96">
                <span className="text-sm w-14 text-right">{formatTime(progress)}</span>
                <Slider value={[progress]} max={duration || 1} onValueChange={([v]) => seekTo(v)} className="flex-1" />
                <span className="text-sm text-muted-foreground w-14">{formatTime(duration)}</span>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5" />
                <Slider value={[volume]} max={100} onValueChange={([v]) => setVolume(v)} className="w-32" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}