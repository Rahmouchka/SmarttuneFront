import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { CheckCircle, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ArtistPending: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="p-8 text-center space-y-6 bg-card/80 backdrop-blur">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold mb-2">Demande envoyée !</h1>
                        <p className="text-muted-foreground">
                            Votre demande pour devenir artiste a été soumise avec succès.
                        </p>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p className="flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            Un email de confirmation vous a été envoyé.
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4" />
                            Délai de validation : 24 à 48 heures
                        </p>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button
                            onClick={() => navigate("/login")}
                            className="w-full bg-gradient-primary"
                        >
                            Aller à la connexion
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/")}
                            className="w-full"
                        >
                            Retour à l'accueil
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ArtistPending;