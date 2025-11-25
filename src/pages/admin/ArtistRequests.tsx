// src/pages/admin/ArtistRequests.tsx → VERSION PROPRE SANS ANY
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, User, Mail, Phone, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArtistRequest {
    id: number;
    nomArtiste: string;
    nom: string;
    prenom: string;
    email: string;
    numTel: string | null;
    age: number;
    genre: string;
    bio: string;
    submittedAt: string;
    hoursElapsed: number;
    isUrgent: boolean;
}

export default function ArtistRequests() {
    const [requests, setRequests] = useState<ArtistRequest[]>([]);
    const [selected, setSelected] = useState<ArtistRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetch('http://localhost:8082/api/admin/artist-requests')
            .then(res => res.json())
            .then((data: ArtistRequest[]) => {
                setRequests(data.sort((a, b) => b.hoursElapsed - a.hoursElapsed));
            })
            .catch(() => toast({ title: "Erreur", description: "Impossible de charger les demandes", variant: "destructive" }));
    }, [toast]);

    const approve = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8082/api/admin/artist-requests/${id}/approve`, { method: 'POST' });
            if (!res.ok) throw new Error();
            toast({ title: "Artiste approuvé !" });
            setRequests(prev => prev.filter(r => r.id !== id));
            setSelected(null);
        } catch {
            toast({ title: "Erreur", description: "Impossible d'approuver", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const reject = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8082/api/admin/artist-requests/${id}/reject`, { method: 'POST' });
            if (!res.ok) throw new Error();
            toast({ title: "Demande rejetée" });
            setRequests(prev => prev.filter(r => r.id !== id));
            setSelected(null);
        } catch {
            toast({ title: "Erreur", description: "Impossible de rejeter", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Gestion des demandes d'artistes
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Liste des demandes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-6 h-6" />
                                Demandes en attente ({requests.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-[700px] overflow-y-auto">
                            {requests.length === 0 ? (
                                <p className="text-center py-12 text-muted-foreground">Aucune demande en attente</p>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map((req) => (
                                        <Card
                                            key={req.id}
                                            className={`p-4 cursor-pointer transition-all hover:border-primary ${selected?.id === req.id ? 'border-primary border-2' : ''} ${req.isUrgent ? 'border-red-500 border-2' : ''}`}
                                            onClick={() => setSelected(req)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                                        {req.nomArtiste}
                                                        {req.isUrgent && <Badge variant="destructive" className="text-xs">URGENT</Badge>}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{req.prenom} {req.nom}</p>
                                                    <p className="text-xs text-muted-foreground">{req.email}</p>
                                                </div>
                                                <Badge variant={req.isUrgent ? 'destructive' : 'secondary'}>
                                                    {Math.floor(req.hoursElapsed)}h
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Détails */}
                    {selected && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center text-2xl">{selected.nomArtiste}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Soumis il y a {Math.floor(selected.hoursElapsed)} heures
                                    {selected.isUrgent && <Badge variant="destructive" className="ml-2 animate-pulse">URGENT</Badge>}
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-muted-foreground">Nom :</span> {selected.prenom} {selected.nom}</div>
                                    <div><span className="text-muted-foreground">Email :</span> {selected.email}</div>
                                    <div><span className="text-muted-foreground">Téléphone :</span> {selected.numTel || 'Non renseigné'}</div>
                                    <div><span className="text-muted-foreground">Âge / Genre :</span> {selected.age} ans - {selected.genre}</div>
                                </div>

                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Biographie</p>
                                    <div className="max-h-40 overflow-y-auto bg-muted/30 p-4 rounded-lg border">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                            {selected.bio}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => window.open(`http://localhost:8082/api/admin/artist-requests/${selected.id}/pdf`, '_blank')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Consulter le PDF justificatif
                                </Button>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        onClick={() => approve(selected.id)}
                                        disabled={loading}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approuver
                                    </Button>
                                    <Button
                                        onClick={() => reject(selected.id)}
                                        disabled={loading}
                                        variant="destructive"
                                        className="flex-1"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Rejeter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!selected && (
                        <Card className="flex items-center justify-center h-96">
                            <p className="text-muted-foreground text-center">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                Sélectionnez une demande pour voir les détails
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}