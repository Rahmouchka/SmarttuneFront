import { useEffect, useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchComponent } from '@/components/user/SearchComponent';
import { PlaylistsList } from '@/components/user/PlaylistsList';
import { FavorisList } from '@/components/user/FavorisList';
import { api } from '@/lib/api';
import { ChansonResponse, ChansonSimple, PlaylistResponse as Playlist } from '@/types/music';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [chansons, setChansons] = useState<ChansonSimple[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favoris, setFavoris] = useState<ChansonSimple[]>([]);
  const [currentSong, setCurrentSong] = useState<ChansonResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchData(parsedUser.id);
    } else {
      navigate('/login');
    }
  }, []);

  const fetchData = async (userId: number) => {
    try {
      const [c, p, f] = await Promise.all([
        api.searchChansons(''), // Toutes les chansons disponibles
        api.getUserPlaylists(userId),
        api.getUserFavoris(userId),
      ]);
      setChansons(c);
      setPlaylists(p);
      setFavoris(f);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

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

  const playSong = async (song: ChansonResponse) => {
    try {
      const chanson = await api.getChanson(song.id);
      setCurrentSong(chanson);
      setIsPlaying(true);
      setProgress(0);
    } catch (error) {
      console.error(error);
    }
  };

  const seekTo = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-bg pt-16 pb-32">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Espace Utilisateur
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-medium">{user?.username || 'Utilisateur'}</span>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="search">
          <TabsList className="mb-6">
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="favoris">Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <Card>
              <CardHeader><CardTitle>Rechercher</CardTitle></CardHeader>
              <CardContent>
                <SearchComponent 
                  userId={user?.id || 0} 
                  onPlaySong={playSong} 
                  onUpdate={() => fetchData(user?.id || 0)} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="playlists">
            <Card>
              <CardHeader><CardTitle>Mes Playlists</CardTitle></CardHeader>
              <CardContent>
                <PlaylistsList userId={user?.id || 0} chansons={chansons} onUpdate={() => fetchData(user?.id || 0)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favoris">
            <Card>
              <CardHeader><CardTitle>Mes Favoris</CardTitle></CardHeader>
              <CardContent>
                <FavorisList userId={user?.id || 0} onUpdate={() => fetchData(user?.id || 0)} onPlaySong={playSong} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mini-player */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border/50 z-50">
          <audio ref={audioRef} src={currentSong.url} />
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <div className="flex items-center gap-4">
              <Music className="w-10 h-10 text-primary" />
              <div>
                <p className="font-medium">{currentSong.titre}</p>
                <p className="text-sm text-muted-foreground">{currentSong.musicGenre}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Slider value={[progress]} max={duration} onValueChange={([v]) => seekTo(v)} className="flex-1" />
            <p>{formatTime(progress)} / {formatTime(duration)}</p>
            <Slider value={[volume]} max={100} onValueChange={([v]) => setVolume(v)} className="w-24" />
          </div>
        </div>
      )}
    </div>
  );
}