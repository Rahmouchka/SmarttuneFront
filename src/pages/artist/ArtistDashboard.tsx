// src/pages/ArtistDashboard.tsx
import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Album as AlbumIcon, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
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
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const updateProgress = () => setProgress(audio.currentTime);
  const updateDuration = () => {
    const dur = isFinite(audio.duration) ? audio.duration : 0;
    setDuration(dur);
  };
  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", updateDuration);
  audio.addEventListener("durationchange", updateDuration);
  audio.addEventListener("ended", onEnded);

  return () => {
    audio.removeEventListener("timeupdate", updateProgress);
    audio.removeEventListener("loadedmetadata", updateDuration);
    audio.removeEventListener("durationchange", updateDuration);
    audio.removeEventListener("ended", onEnded);
  };
}, [currentSong]); 
 

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => {
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      setDuration(dur);
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
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
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
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Espace Artiste
          </h1>
          <p className="text-muted-foreground mt-1">Gérez votre musique et vos albums</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-40">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8 animate-fade-in">
          <Card className="shadow-glow border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chansons</CardTitle>
              <Music className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{songs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {songs.length > 0 ? 'Continuez votre création' : 'Commencez à uploader'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow-accent border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Albums</CardTitle>
              <AlbumIcon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{albums.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {albums.length > 0 ? 'Gérez vos collections' : 'Créez votre premier album'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-glow border-border/50 bg-card/80 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Active</div>
              <p className="text-xs text-muted-foreground mt-1">Votre compte est actif</p>
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
                    <Input placeholder="Titre de l'album" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} />
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

      {/* PLAYER FINAL – MARCHE À 100% MÊME APRÈS REFRESH */}
     {/* PLAYER – VERSION BULLETPROOF (marche à 100% après refresh) */}
{currentSong?.url && (
  <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 shadow-2xl">
    {/* ON RECRÉE L'AUDIO À CHAQUE CHANSON + ON FORCE LE SRC DIRECTEMENT */}
    <audio
      key={currentSong.id}                     // Recrée l'élément
      ref={audioRef}
      src={currentSong.url}                    // src en prop = force le chargement immédiat
      preload="metadata"
      crossOrigin="anonymous"
    />

    {/* Barre de progression */}
    <div
      className="relative h-1 bg-muted/40 cursor-pointer group"
      onClick={(e) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        seekTo(percent * duration);
      }}
    >
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-100"
        style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          left: `${duration > 0 ? (progress / duration) * 100 : 0}%`,
          transform: 'translateX(-50%) translateY(-50%)',
        }}
      />
    </div>

    <div className="container mx-auto px-4 py-5">
      <div className="flex items-center justify-between gap-6">
        {/* Info chanson */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
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
            <p className="text-xs text-muted-foreground">En lecture</p>
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex flex-col items-center gap-4 flex-1 max-w-xl">
          <div className="flex items-center gap-8">
            <Button variant="ghost" size="icon" onClick={playPrevious}>
              <SkipBack className="w-6 h-6" />
            </Button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-white" />
              ) : (
                <Play className="w-10 h-10 text-white ml-1" />
              )}
            </button>

            <Button variant="ghost" size="icon" onClick={playNext}>
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full text-sm">
            <span className="w-14 text-right tabular-nums text-primary">
              {formatTime(progress)}
            </span>

            <Slider
              value={[progress]}
              max={duration || 1}
              step={0.1}
              onValueChange={([v]) => seekTo(v)}
              className="flex-1 cursor-grab active:cursor-grabbing"
            />

            <span className="w-14 text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v)}
            className="w-28"
          />
          <span className="text-xs w-10 text-right">{volume}%</span>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}