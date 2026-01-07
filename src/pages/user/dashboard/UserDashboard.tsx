import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SearchComponent } from '@/components/user/SearchComponent';
import { PlaylistsList } from '@/components/user/PlaylistsList';
import { FavorisList } from '@/components/user/FavorisList';
import { api } from '@/lib/api';
import { ChansonResponse, ChansonSimple, PlaylistResponse as Playlist } from '@/types/music';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Music, LogOut, 
  X, Smile, Frown, Angry, Coffee, Search, Heart, ListMusic
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const navigate = useNavigate();

  // États principaux
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [chansons, setChansons] = useState<ChansonSimple[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favoris, setFavoris] = useState<ChansonSimple[]>([]);

  // Lecteur audio
  const [currentSong, setCurrentSong] = useState<ChansonResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Recommandations par humeur
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState<ChansonSimple[]>([]);
  const [loadingMood, setLoadingMood] = useState(false);

  // Gestion des playlists pour ajout rapide
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [addingToPlaylist, setAddingToPlaylist] = useState<number | null>(null);
const [showPlayer, setShowPlayer] = useState(true);

const [showReportModal, setShowReportModal] = useState(false);
const [songToReport, setSongToReport] = useState<ChansonSimple | null>(null);
const [reportReason, setReportReason] = useState('');
const [reporting, setReporting] = useState(false);
const [reportSuccess, setReportSuccess] = useState(false);

const handleReportSong = async () => {
  if (!songToReport || !user || !reportReason.trim()) return;

  setReporting(true);
  try {
    await api.reportChanson(user.id, songToReport.id, reportReason.trim());
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportReason('');
      setSongToReport(null);
    }, 2000);
  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    alert('Erreur lors du signalement de la chanson. Veuillez réessayer.');
  } finally {
    setReporting(false);
  }
};
const openReportModal = (song: ChansonSimple) => {
  setSongToReport(song);
  setReportReason('');
  setReportSuccess(false);
  setShowReportModal(true);
};

  // === Chargement initial de l'utilisateur ===
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Afficher la modale d'humeur seulement une fois par session
      const hasSeenMoodPrompt = sessionStorage.getItem('moodPromptSeen');
      if (!hasSeenMoodPrompt) {
        setShowMoodModal(true);
        sessionStorage.setItem('moodPromptSeen', 'true');
      }

      fetchData(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);
const playNext = () => {
  if (!currentSong || chansons.length === 0) return;

  const currentIndex = chansons.findIndex(
    s => s.id === currentSong.id
  );

  if (currentIndex >= 0 && currentIndex < chansons.length - 1) {
    playSong(chansons[currentIndex + 1]);
  }
};

const playPrevious = () => {
  if (!currentSong || chansons.length === 0) return;

  const currentIndex = chansons.findIndex(
    s => s.id === currentSong.id
  );

  if (currentIndex > 0) {
    playSong(chansons[currentIndex - 1]);
  }
};
  // === Chargement des données globales ===
  const fetchData = async (userId: number) => {
    try {
      const [allSongs, userPlaylistsData, userFavoris] = await Promise.all([
        api.searchChansons(''),
        api.getUserPlaylists(userId),
        api.getUserFavoris(userId),
      ]);
      setChansons(allSongs);
      setPlaylists(userPlaylistsData);
      setFavoris(userFavoris);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // === Charger les playlists de l'utilisateur (pour ajout rapide) ===
  useEffect(() => {
    if (user?.id) {
      api.getUserPlaylists(user.id)
        .then(setUserPlaylists)
        .catch(console.error);
    }
  }, [user?.id]);

  // === Chargement des chansons par humeur ===
  const loadSongsByMood = async (mood: string) => {
    setLoadingMood(true);
    try {
      const songs = await api.getRandomSongsByMood(mood);
      setRecommendedSongs(songs);
    } catch (err) {
      console.error('Erreur lors du chargement des chansons par humeur:', err);
      setRecommendedSongs([]);
    } finally {
      setLoadingMood(false);
      setShowMoodModal(false);
    }
  };

  // === Ajouter une chanson à une playlist ===
  const addSongToPlaylist = async (chansonId: number, playlistId: number) => {
    if (!user?.id) return;

    setAddingToPlaylist(chansonId);
    try {
      await api.addSongsToPlaylist(user.id, playlistId, [chansonId]);
      console.log('Chanson ajoutée à la playlist !');
      // Recharger les playlists pour refléter les changements
      const updatedPlaylists = await api.getUserPlaylists(user.id);
      setUserPlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
    } catch (err) {
      console.error('Erreur lors de l\'ajout à la playlist:', err);
      alert('Impossible d\'ajouter la chanson à la playlist');
    } finally {
      setAddingToPlaylist(null);
    }
  };
  // === Gestion du lecteur audio ===
useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !currentSong) return;

  const updateProgress = () => setProgress(audio.currentTime);
  const updateDuration = () => setDuration(audio.duration || 0);
  const onEnded = () => setIsPlaying(false);

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('loadedmetadata', updateDuration);
  audio.addEventListener('durationchange', updateDuration);
  audio.addEventListener('ended', onEnded);

  if (isPlaying) {
    audio.play().catch((e) => {
      console.error('Erreur de lecture audio:', e);
      setIsPlaying(false);
    });
  } else {
    audio.pause();
  }

  return () => {
    audio.removeEventListener('timeupdate', updateProgress);
    audio.removeEventListener('loadedmetadata', updateDuration);
    audio.removeEventListener('durationchange', updateDuration);
    audio.removeEventListener('ended', onEnded);
  };
}, [currentSong, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playSong = async (song: ChansonSimple | ChansonResponse) => {
    try {
      const fullSong = await api.getChanson(song.id);
      setCurrentSong(fullSong);
      setIsPlaying(true);
      setProgress(0);
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  const seekTo = (value: number) => {
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('moodPromptSeen');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-bg pt-16 pb-32">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Mon Espace</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{user?.username || 'Utilisateur'}</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
    Mon profil
  </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* === Recommandations par humeur === */}
        {recommendedSongs.length > 0 && (
          <section className="mb-12">
            <Card className="border-primary/30 bg-card/90 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  Recommandées pour ton humeur
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingMood ? (
                  <p className="text-center py-8 text-muted-foreground">Chargement des chansons...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {recommendedSongs.map((song, index) => (
                      <Card
                        key={song.id}
                        className="group cursor-pointer transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 bg-card border-border/50 overflow-hidden"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-4">
                          {/* Zone lecture */}
                          <div
                            className="mb-4"
                            onClick={() => playSong(song)}
                          >
                            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Music className="w-10 h-10 text-primary/70" />
                            </div>
                            <h4 className="font-semibold text-sm truncate">{song.titre}</h4>
                            <p className="text-xs text-muted-foreground">{song.musicGenre}</p>
                            <p className="text-xs text-muted-foreground">{song.duree}</p>
                          </div>

                          {/* Ajout à playlist */}
                          <div className="mt-3">
                            <select
                              value=""
                              onChange={(e) => {
                                const pid = Number(e.target.value);
                                if (pid) addSongToPlaylist(song.id, pid);
                              }}
                              disabled={addingToPlaylist === song.id}
                              className="w-full px-3 py-2 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                              <option value="">+ Ajouter à une playlist</option>
                              {userPlaylists.map((pl) => (
                                <option key={pl.id} value={pl.id}>
                                  {pl.titre}
                                </option>
                              ))}
                            </select>
<div className="mt-3">
  <Button
    variant="outline"
    size="sm"
    className="w-full text-red-600 border-red-300 hover:bg-red-50"
    onClick={() => openReportModal(song)}
  >
    Signaler cette chanson
  </Button>
</div>
                            {addingToPlaylist === song.id && (
                              <p className="text-xs text-primary mt-2 text-center animate-pulse">
                                Ajout en cours...
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {userPlaylists.length === 0 && recommendedSongs.length > 0 && (
                  <p className="text-center text-muted-foreground mt-6">
                    Crée une playlist dans l’onglet "Playlists" pour sauvegarder tes coups de cœur !
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* === Onglets principaux === */}
        <Tabs defaultValue="search" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="favoris">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader><CardTitle>Rechercher une chanson</CardTitle></CardHeader>
              <CardContent>
                {user && (
                  <SearchComponent
                    userId={user.id}
                    onPlaySong={playSong}
                    onUpdate={() => fetchData(user.id)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists">
            <Card>
              <CardHeader><CardTitle>Mes Playlists</CardTitle></CardHeader>
              <CardContent>
                {user && (
                  <PlaylistsList
                    userId={user.id}
                    chansons={chansons}
                    onUpdate={() => fetchData(user.id)}
                    onPlaySong={playSong}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favoris">
            <Card>
              <CardHeader><CardTitle>Mes Favoris</CardTitle></CardHeader>
              <CardContent>
                <FavorisList
                  userId={user?.id || 0}
                  onUpdate={() => fetchData(user?.id || 0)}
                  onPlaySong={playSong}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* === Modale de sélection d'humeur === */}
      <Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Comment te sens-tu aujourd'hui ?
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setShowMoodModal(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-8">
            {[
              { mood: 'happy', label: 'Joyeux', icon: Smile, color: 'text-yellow-500' },
              { mood: 'sad', label: 'Triste', icon: Frown, color: 'text-blue-600' },
              { mood: 'angry', label: 'Énervé', icon: Angry, color: 'text-red-600' },
              { mood: 'relaxed', label: 'Détendu', icon: Coffee, color: 'text-green-500' },
            ].map(({ mood, label, icon: Icon, color }) => (
              <Button
                key={mood}
                variant="outline"
                className="h-32 flex flex-col gap-4 hover:scale-105 transition-all hover:border-primary"
                onClick={() => loadSongsByMood(mood)}
                disabled={loadingMood}
              >
                <Icon className={`h-14 w-14 ${color}`} />
                <span className="text-lg font-semibold">{label}</span>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button variant="link" onClick={() => setShowMoodModal(false)}>
              Peut-être plus tard
            </Button>
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
              placeholder="Expliquez la raison du signalement (contenu inapproprié, droits d'auteur, etc.)"
              className="w-full h-32 p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
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
                {reporting ? 'Envoi en cours...' : 'Signaler'}
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
            <p className="text-lg font-semibold">Chanson signalée avec succès</p>
            <p className="text-sm text-muted-foreground mt-2">Merci pour votre vigilance.</p>
          </div>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>
 {/* Lecteur audio fixe */}
      {currentSong && showPlayer && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 shadow-2xl">
          <button
            onClick={() => setShowPlayer(false)}
            className="absolute top-3 right-4 text-muted-foreground hover:text-red-500 text-xl font-bold"
          >
            ✖
          </button>

          <audio ref={audioRef} src={currentSong.url} preload="metadata" />

          <div
            className="h-1 bg-muted/40 cursor-pointer group"
            onClick={(e) => {
              if (!duration) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seekTo(percent * duration);
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all"
              style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition"
              style={{
                left: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
                transform: 'translateX(-50%) translateY(-50%)',
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-xl">
                  {isPlaying ? (
                    <div className="flex gap-1">
                      {[5, 8, 4, 9, 6].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s`, height: `${h * 3}px` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Music className="w-9 h-9 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-lg truncate">{currentSong.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentSong.albumTitre || 'Single'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-8">
                  <Button variant="ghost" size="icon" onClick={playPrevious}>
                    <SkipBack className="w-6 h-6" />
                  </Button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center hover:scale-110 transition shadow-2xl"
                  >
                    {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-1" />}
                  </button>
                  <Button variant="ghost" size="icon" onClick={playNext}>
                    <SkipForward className="w-6 h-6" />
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm w-96">
                  <span className="w-14 text-right tabular-nums">{formatTime(progress)}</span>
                  <Slider
                    value={[progress]}
                    max={duration || 1}
                    step={0.1}
                    onValueChange={([v]) => seekTo(v)}
                    className="flex-1"
                  />
                  <span className="w-14 text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <Slider value={[volume]} max={100} step={1} onValueChange={([v]) => setVolume(v)} className="w-28" />
                <span className="text-xs w-10 text-right">{volume}%</span>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
