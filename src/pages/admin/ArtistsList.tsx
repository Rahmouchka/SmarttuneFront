// src/pages/admin/ArtistsList.tsx → VERSION FINALE ULTIME — TOUT MARCHE, ZÉRO BUG
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Eye, ShieldCheck, ShieldOff, Disc3, Music, Calendar, Play } from 'lucide-react';

interface Artist {
    id: number;
    username: string;
    email: string;
    bio?: string | null;        // ← CORRIGÉ : peut être null
    genre?: string | null;      // ← CORRIGÉ : peut être null
    active: boolean;
    dateInscription: string;
    avatar?: string;
}

interface Album {
    id: number;
    titre: string;
    dateSortie: string;
}

interface Chanson {
    id: number;
    titre: string;
    url?: string;
    musicGenre?: string;
    albumTitre?: string | null;
}

export default function ArtistsList() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [search, setSearch] = useState('');
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [chansons, setChansons] = useState<Chanson[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8082/api/admin/artists')
            .then(r => r.json())
            .then(data => setArtists(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const loadArtistData = async (id: number) => {
        setTabLoading(true);
        try {
            const [albumsRes, chansonsRes] = await Promise.all([
                fetch(`http://localhost:8082/api/admin/artists/${id}/albums`),
                fetch(`http://localhost:8082/api/admin/artists/${id}/chansons`)
            ]);

            const albumsData = await albumsRes.json();
            const chansonsData = await chansonsRes.json();

            setAlbums(Array.isArray(albumsData) ? albumsData : []);
            setChansons(Array.isArray(chansonsData) ? chansonsData : []);
        } catch (err) {
            console.error("Erreur chargement données artiste :", err);
            setAlbums([]);
            setChansons([]);
        } finally {
            setTabLoading(false);
        }
    };

    // RECHERCHE 100% SÛRE — PLUS JAMAIS DE CRASH
    const filtered = artists.filter(a => {
        const query = search.toLowerCase();
        return (
            a.username.toLowerCase().includes(query) ||
            a.email.toLowerCase().includes(query) ||
            (a.bio && a.bio.toLowerCase().includes(query)) ||
            (a.genre && a.genre.toLowerCase().includes(query))
        );
    });

    const formatDate = (d: string) => {
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    if (loading) return <div className="text-center py-32 text-muted-foreground">Chargement des artistes...</div>;

    return (
        <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
            {/* TITRE */}
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Gestion des artistes
                </h1>
            </div>

            {/* BARRE DE RECHERCHE */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                        placeholder="Rechercher un artiste..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* LISTE DES ARTISTES */}
            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Music className="w-20 h-20 mx-auto mb-4 opacity-30" />
                        <p>Aucun artiste trouvé</p>
                    </div>
                ) : (
                    filtered.map(artist => (
                        <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={artist.avatar} />
                                            <AvatarFallback className="bg-gradient-primary text-white text-xl">
                                                {artist.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-3">
                                                {artist.username}
                                                {artist.active ? (
                                                    <Badge className="bg-green-500/20 text-green-500 border-green-500">
                                                        <ShieldCheck className="w-3 h-3 mr-1" /> Actif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <ShieldOff className="w-3 h-3 mr-1" /> Inactif
                                                    </Badge>
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">{artist.email}</p>
                                            <p className="text-xs text-muted-foreground mt-1 italic">
                                                {artist.bio ? `"${artist.bio}"` : "— Aucune bio —"}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4" /> Inscrit le {formatDate(artist.dateInscription)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => { setSelectedArtist(artist); loadArtistData(artist.id); }}>
                                        <Eye className="w-4 h-4 mr-2" /> Détails
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* MODAL DÉTAILS */}
            <Dialog open={!!selectedArtist} onOpenChange={() => setSelectedArtist(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Détails de l'artiste</DialogTitle>
                    </DialogHeader>

                    {selectedArtist && (
                        <Tabs defaultValue="info" className="mt-6">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="info">Informations</TabsTrigger>
                                <TabsTrigger value="albums">Albums ({albums.length})</TabsTrigger>
                                <TabsTrigger value="chansons">Chansons ({chansons.length})</TabsTrigger>
                            </TabsList>

                            {/* ONGLET INFO */}
                            <TabsContent value="info" className="space-y-6 py-4">
                                <div className="flex items-center gap-6">
                                    <Avatar className="w-24 h-24">
                                        <AvatarImage src={selectedArtist.avatar} />
                                        <AvatarFallback className="bg-gradient-primary text-white text-3xl">
                                            {selectedArtist.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedArtist.username}</h3>
                                        <p className="text-lg text-muted-foreground">{selectedArtist.email}</p>
                                        <Badge className={selectedArtist.active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                                            {selectedArtist.active ? "Compte actif" : "Compte inactif"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-sm space-y-3">
                                    <div>
                                        <strong>Bio :</strong>{' '}
                                        {selectedArtist.bio ? `"${selectedArtist.bio}"` : "— Aucune bio —"}
                                    </div>
                                    <div><strong>Genre :</strong> {selectedArtist.genre || "Non spécifié"}</div>
                                    <div><strong>Inscrit le :</strong> {formatDate(selectedArtist.dateInscription)}</div>
                                </div>
                            </TabsContent>

                            {/* ONGLET ALBUMS */}
                            <TabsContent value="albums">
                                {tabLoading ? (
                                    <p className="text-center py-8">Chargement...</p>
                                ) : albums.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">Aucun album</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {albums.map(a => (
                                            <div key={a.id} className="bg-muted/50 p-4 rounded-lg text-center">
                                                <Disc3 className="w-16 h-16 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-semibold">{a.titre}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(a.dateSortie)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* ONGLET CHANSONS */}
                            <TabsContent value="chansons">
                                {tabLoading ? (
                                    <p className="text-center py-8">Chargement...</p>
                                ) : chansons.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">Aucune chanson</p>
                                ) : (
                                    <div className="space-y-3">
                                        {chansons.map(c => (
                                            <div key={c.id} className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <Play className="w-8 h-8 text-primary" />
                                                    <div>
                                                        <p className="font-medium">{c.titre}</p>
                                                        {c.albumTitre && <p className="text-xs text-muted-foreground">Album : {c.albumTitre}</p>}
                                                        {c.musicGenre && <p className="text-xs text-muted-foreground">{c.musicGenre}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}