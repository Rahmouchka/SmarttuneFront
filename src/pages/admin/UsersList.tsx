// src/pages/admin/UsersList.tsx → VERSION ULTIME, ACTIF + DATE = PARFAIT
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Calendar, Search, Eye, ShieldCheck, ShieldOff } from 'lucide-react';

interface AppUser {
    id: number;
    username: string;
    email: string;
    nom: string;
    prenom: string;
    numTel?: string;
    age?: number;
    genre?: string;
    dateInscription: string;   // LE BON NOM (ton backend l'envoie)
    active: boolean;           // LE BON NOM (ton backend l'envoie)
    avatar?: string;
}

export default function UsersList() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8082/api/admin/users')
            .then(r => r.json())
            .then((data: AppUser[]) => setUsers(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = users
        .filter(u =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
        .filter(u => filterStatus === 'all' || (filterStatus === 'active' ? u.active : !u.active));

    // DATE PROPRE, SANS HEURE, 100% FONCTIONNELLE
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Date inconnue';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Date invalide';
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) return <div className="text-center py-32 text-muted-foreground">Chargement...</div>;

    return (
        <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Gestion des utilisateurs
                </h1>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterStatus} onValueChange={(v: 'all' | 'active' | 'inactive') => setFilterStatus(v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="inactive">Inactifs</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <User className="w-20 h-20 mx-auto mb-4 opacity-30" />
                        <p>Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    filtered.map(user => (
                        <Card key={user.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <Avatar className="w-16 h-16">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback className="bg-gradient-primary text-white text-xl">
                                                {user.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-3">
                                                {user.username}
                                                {user.active ? (
                                                    <Badge className="bg-green-500/20 text-green-500 border-green-500">
                                                        <ShieldCheck className="w-3 h-3 mr-1" /> Actif
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <ShieldOff className="w-3 h-3 mr-1" /> Inactif
                                                    </Badge>
                                                )}
                                            </h3>
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Mail className="w-4 h-4" /> {user.email}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4" /> Inscrit le {formatDate(user.dateInscription)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={() => setSelectedUser(user)} size="sm">
                                        <Eye className="w-4 h-4 mr-2" /> Détails
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-center">Détails de l'utilisateur</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback className="bg-gradient-primary text-white text-3xl">
                                        {selectedUser.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedUser.username}</h3>
                                    <p className="text-lg text-muted-foreground">{selectedUser.prenom} {selectedUser.nom}</p>
                                    <Badge className={selectedUser.active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}>
                                        {selectedUser.active ? "Compte actif" : "Compte inactif"}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div className="space-y-3">
                                    <div><strong>Email :</strong> {selectedUser.email}</div>
                                    <div><strong>Téléphone :</strong> {selectedUser.numTel || 'Non renseigné'}</div>
                                    <div><strong>Âge :</strong> {selectedUser.age || 'Non renseigné'}</div>
                                    <div><strong>Genre :</strong> {selectedUser.genre || 'Non renseigné'}</div>
                                </div>
                                <div className="space-y-3">
                                    <div><strong>Inscrit le :</strong> {formatDate(selectedUser.dateInscription)}</div>
                                    <div><strong>Statut :</strong> {selectedUser.active ? 'Actif' : 'Inactif'}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}