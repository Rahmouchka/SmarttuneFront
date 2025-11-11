import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { User, Music } from "lucide-react";
import logo from "@/assets/smarttune-logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"user" | "artist" | null>(null);

  if (selectedType) {
    navigate(`/register/${selectedType}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="SmartTune" className="w-50 h-20 animate-wave" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Bienvenue sur SmartTune
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Choisissez votre type de compte pour commencer
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 animate-scale-in">
          {/* User Card */}
          <Card 
            className="relative overflow-hidden border-2 border-border hover:border-accent transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur-sm"
            onClick={() => setSelectedType("user")}
          >
            <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="p-8 relative z-10">
              <div className="w-20 h-20 bg-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <User className="w-10 h-10 text-accent" />
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
                Utilisateur
              </h2>
              
              <p className="text-muted-foreground text-center mb-6">
                Profitez de millions de morceaux, créez vos playlists et découvrez de nouveaux artistes
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Streaming illimité",
                  "Playlists personnalisées",
                  "Découverte musicale intelligente",
                  "Mode hors ligne",
                  "Qualité audio premium"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-glow-accent transition-all duration-300"
                size="lg"
              >
                S'inscrire comme utilisateur
              </Button>
            </div>
          </Card>

          {/* Artist Card */}
          <Card 
            className="relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur-sm"
            onClick={() => setSelectedType("artist")}
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <div className="p-8 relative z-10">
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <Music className="w-10 h-10 text-primary" />
              </div>
              
              <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
                Artiste
              </h2>
              
              <p className="text-muted-foreground text-center mb-6">
                Partagez votre musique avec le monde, gérez vos sorties et connectez-vous avec vos fans
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Upload illimité de tracks",
                  "Statistiques détaillées",
                  "Gestion de profil artiste",
                  "Promotion de votre musique",
                  "Vérification après validation"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size="lg"
              >
                S'inscrire comme artiste
              </Button>
            </div>
          </Card>
        </div>

        {/* Login link */}
        <div className="text-center mt-8 animate-fade-in">
          <p className="text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <button 
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-semibold"
            >
              Se connecter
            </button>
          </p>
        </div>

        {/* Back button */}
        <div className="text-center mt-4 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
