import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
    numTel: string;
    age: number;
    genre: string;
    bio: string;
    submittedAt: string;
    hoursElapsed: number;
    isUrgent: boolean;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    urgent: number;
}

const AdminDashboard: React.FC = () => {
    const [requests, setRequests] = useState<ArtistRequest[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, urgent: 0 });
    const [selectedRequest, setSelectedRequest] = useState<ArtistRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('http://localhost:8082/api/admin/artist-requests');
            const data = await res.json();
            setRequests(data.sort((a: ArtistRequest, b: ArtistRequest) => b.hoursElapsed - a.hoursElapsed));
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible de charger les demandes', variant: 'destructive' });
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('http://localhost:8082/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Erreur stats:', error);
        }
    };

    const handleApprove = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8082/api/admin/artist-requests/${id}/approve`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error();
            toast({ title: '✅ Artiste approuvé', description: 'Email envoyé à l\'artiste' });
            fetchRequests();
            fetchStats();
            setSelectedRequest(null);
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible d\'approuver', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8082/api/admin/artist-requests/${id}/reject`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error();
            toast({ title: '❌ Demande rejetée', description: 'Email envoyé à l\'artiste' });
            fetchRequests();
            fetchStats();
            setSelectedRequest(null);
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible de rejeter', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const viewPdf = (id: number) => {
        window.open(`http://localhost:8082/api/admin/artist-requests/${id}/pdf`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-bg p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Administration SmartTune
            </span>
                    </h1>
                    <p className="text-muted-foreground">Gestion des demandes d'artistes</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-6 border-2 border-yellow-500/30 bg-yellow-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">En attente</p>
                                <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-500" />
                        </div>
                    </Card>

                    <Card className="p-6 border-2 border-red-500/30 bg-red-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Urgentes supérieures à 48h</p>
                                <p className="text-3xl font-bold text-red-500">{stats.urgent}</p>
                            </div>
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                    </Card>

                    <Card className="p-6 border-2 border-green-500/30 bg-green-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Approuvées</p>
                                <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                    </Card>

                    <Card className="p-6 border-2 border-gray-500/30 bg-gray-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground text-sm">Rejetées</p>
                                <p className="text-3xl font-bold text-gray-500">{stats.rejected}</p>
                            </div>
                            <XCircle className="w-10 h-10 text-gray-500" />
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Liste des demandes */}
                    <Card className="p-6 border-2 border-border">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary" />
                            Demandes en attente ({requests.length})
                        </h2>

                        {requests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">Aucune demande en attente</p>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {requests.map((req) => (
                                    <Card
                                        key={req.id}
                                        className={`p-4 cursor-pointer transition-all hover:border-primary ${
                                            selectedRequest?.id === req.id ? 'border-primary border-2' : ''
                                        } ${req.isUrgent ? 'border-red-500 border-2' : ''}`}
                                        onClick={() => setSelectedRequest(req)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-lg">{req.nomArtiste}</h3>
                                                    {req.isUrgent && (
                                                        <Badge variant="destructive" className="animate-pulse">
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            URGENT
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {req.prenom} {req.nom}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {req.email}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={req.isUrgent ? 'destructive' : 'secondary'}>
                                                    {Math.floor(req.hoursElapsed)}h
                                                </Badge>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Détails de la demande sélectionnée */}
                    <Card className="p-6 border-2 border-border">
                        {selectedRequest ? (
                            <>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <User className="w-6 h-6 text-primary" />
                                    Détails de la demande
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-2">
                                            {selectedRequest.nomArtiste}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                            <Calendar className="w-4 h-4" />
                                            Soumis il y a {Math.floor(selectedRequest.hoursElapsed)} heures
                                            {selectedRequest.isUrgent && (
                                                <Badge variant="destructive" className="ml-2">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    RETARD
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Nom complet</p>
                                                <p className="font-semibold">
                                                    {selectedRequest.prenom} {selectedRequest.nom}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-semibold">{selectedRequest.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Téléphone</p>
                                                <p className="font-semibold">{selectedRequest.numTel || 'Non renseigné'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Âge / Genre</p>
                                                <p className="font-semibold">
                                                    {selectedRequest.age} ans - {selectedRequest.genre}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Biographie</p>
                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <p className="text-sm leading-relaxed">{selectedRequest.bio}</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => viewPdf(selectedRequest.id)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Consulter le PDF justificatif
                                    </Button>

                                    <div className="flex gap-3 pt-4 border-t">
                                        <Button
                                            onClick={() => handleApprove(selectedRequest.id)}
                                            disabled={loading}
                                            className="flex-1 bg-green-500 hover:bg-green-600"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approuver
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(selectedRequest.id)}
                                            disabled={loading}
                                            variant="destructive"
                                            className="flex-1"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Rejeter
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <div className="text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                    <p>Sélectionnez une demande pour voir les détails</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;