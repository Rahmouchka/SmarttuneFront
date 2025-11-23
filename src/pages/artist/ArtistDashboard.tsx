// src/pages/ArtistDashboard.tsx
import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Album as AlbumIcon, Play, Pause, Plus, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { UploadSongDialog } from '@/components/artist/UploadSongDialog';
import { SongsList } from '@/components/artist/SongsList';
import { AlbumsList } from '@/components/artist/AlbumsList';
import { api } from '@/lib/api';
import { Chanson, Album } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const ARTIST_ID = 1;

export default function ArtistDashboard() {
  const [songs, setSongs] = useState<Chanson[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentSong, setCurrentSong] = useState<Chanson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [albumTitle, setAlbumTitle] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        api.getArtistSongs(ARTIST_ID),
        api.getArtistAlbums(ARTIST_ID),
      ]);
      setSongs(s);
      setAlbums(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quand currentSong change -> mettre à jour src + load()
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong?.url) {
      // Mettre la source explicitement et forcer le chargement
      audio.src = currentSong.url;
      try {
        audio.load();
      } catch (e) {
        // certains environnements peuvent jeter, on ignore mais loggue
        console.warn('audio.load() failed', e);
      }
      setProgress(0);
      setDuration(0);
      // si on souhaite jouer immédiatement
      if (isPlaying) {
        audio.play().catch(() => {
          // play bloqué par navigateur -> attendre interaction
          console.log('Lecture bloquée par le navigateur → clique pour débloquer');
          setIsPlaying(false);
        });
      }
    } else {
    
      setProgress(0);
      setDuration(0);
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  // Écouteurs timeupdate / loadedmetadata / ended (fonctions nommées pour cleanup)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [/* pas de dépendance sur currentSong ici : les handlers restent valides */]);

  // Gérer play / pause quand isPlaying change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handle = async () => {
      if (isPlaying) {
        try {
          await audio.play();
        } catch (e) {
          console.warn('play() rejected', e);
          setIsPlaying(false);
        }
      } else {
        audio.pause();
      }
    };

    handle();
  }, [isPlaying]);

  // Mettre à jour le volume quand la valeur change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume / 100));
  }, [volume]);

  const playSong = (song: Chanson) => {
    if (!song.url) return;

    if (currentSong?.id === song.id) {
      setIsPlaying(prev => !prev);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => setVolume(value[0]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playNext = () => {
    const idx = songs.findIndex(s => s.id === currentSong?.id);
    if (idx < songs.length - 1) playSong(songs[idx + 1]);
  };

  const playPrevious = () => {
    const idx = songs.findIndex(s => s.id === currentSong?.id);
    if (idx > 0) playSong(songs[idx - 1]);
  };

  const handleCreateAlbum = async () => {
    if (!albumTitle.trim()) return;
    await api.createAlbum(ARTIST_ID, albumTitle.trim());
    setAlbumTitle('');
    setShowCreateDialog(false);
    await fetchData();
  };

  const availableSongs = songs.filter(s => !s.albumId);


  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Espace Artiste
              </h1>
              <p className="text-muted-foreground mt-1">Gérez votre musique et vos albums</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8 animate-fade-in">
          <Card className="shadow-glow border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Chansons</CardTitle>
              <Music className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{songs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {songs.length > 0 ? 'Continuez votre création' : 'Commencez à uploader'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow-accent border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Albums</CardTitle>
              <AlbumIcon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{albums.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {albums.length > 0 ? 'Gérez vos collections' : 'Créez votre premier album'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Activité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                Votre compte est actif
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="songs">
          <TabsList className="grid w-full md:w-96 grid-cols-2 mb-6">
            <TabsTrigger value="songs">Chansons</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
          </TabsList>

          <TabsContent value="songs">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Mes Chansons</CardTitle>
                <UploadSongDialog artisteId={ARTIST_ID} onSuccess={fetchData} />
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-12">Chargement…</p> : 
                  <SongsList
                    songs={songs}
                    artisteId={ARTIST_ID}
                    onUpdate={fetchData}
                    onPlaySong={playSong}
                    currentSongId={currentSong?.id}
                    isPlaying={isPlaying}
                  />
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="albums">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Mes Albums</CardTitle>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>Créer un album</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Nouvel album</DialogTitle></DialogHeader>
                    <Input 
                      placeholder="Titre de l'album" 
                      value={albumTitle} 
                      onChange={(e) => setAlbumTitle(e.target.value)} 
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
                      <Button onClick={handleCreateAlbum} disabled={!albumTitle.trim()}>Créer</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loading ? <p className="text-center py-12">Chargement…</p> :
                  <AlbumsList
                    albums={albums}
                    artisteId={ARTIST_ID}
                    onUpdate={fetchData}
                    availableSongs={availableSongs}
                    onPlaySong={playSong}
                    currentSongId={currentSong?.id}
                    isPlaying={isPlaying}
                  />
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* PLAYER FIXE */}
      {currentSong?.url && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 shadow-2xl">
          {/* key pour forcer recréation si besoin */}
          <audio key={currentSong.id} ref={audioRef} preload="metadata" />

          <div className="h-1 bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }} />
          </div>

          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
                  <Music className="w-8 h-8 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{currentSong.titre}</p>
                  <p className="text-xs text-muted-foreground">En lecture</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 flex-1 max-w-xl">
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="icon" onClick={playPrevious}><SkipBack className="w-5 h-5" /></Button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-primary text-white w-14 h-14 rounded-full hover:scale-110 transition flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                  <Button variant="ghost" size="icon" onClick={playNext}><SkipForward className="w-5 h-5" /></Button>
                </div>

                <div className="flex items-center gap-3 w-full text-sm">
                  <span className="w-12 text-right">{formatTime(progress)}</span>
                  <Slider value={[progress]} max={duration || 1} step={0.1} onValueChange={handleSeek} className="flex-1" />
                  <span className="w-12">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5" />
                <Slider value={[volume]} max={100} onValueChange={handleVolumeChange} className="w-32" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
