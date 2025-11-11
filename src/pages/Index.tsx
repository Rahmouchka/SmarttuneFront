import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, TrendingUp, Music } from "lucide-react";
import logo from "@/assets/smarttune-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Music,
      title: "Musique illimitée",
      description: "Accédez à des millions de morceaux de vos artistes préférés",
    },
    {
      icon: Sparkles,
      title: "Découvrez de nouveaux sons",
      description: "Notre algorithme intelligent vous suggère de la musique adaptée à vos goûts",
    },
    {
      icon: Users,
      title: "Connectez-vous avec des artistes",
      description: "Soutenez directement vos artistes favoris et découvrez des talents émergents",
    },
    {
      icon: TrendingUp,
      title: "Pour les artistes",
      description: "Partagez votre musique avec le monde et suivez vos statistiques en temps réel",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3 animate-fade-in">
            <img src={logo} alt="SmartTune Logo" className="w-50 h-10 object-contain" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SmartTune
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-foreground hover:bg-primary/10 hover:text-primary transition-all"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl md:text-8xl font-extrabold animate-fade-in-up leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                SmartTune,
              </span>
              <br />
              <span className="text-foreground">la musique sans limites!</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              SmartTune révolutionne votre expérience musicale. Écoutez, découvrez et partagez la musique que vous aimez avec une communauté passionnée.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg"
                className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300 text-lg px-10 py-7 rounded-full font-semibold"
                onClick={() => navigate("/register")}
              >
                Commencer maintenant
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-accent text-accent hover:bg-accent/10 hover:scale-105 text-lg px-10 py-7 rounded-full font-semibold transition-all duration-300"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                En savoir plus
              </Button>
            </div>
          </div>

          {/* Decorative logo */}
          <div className="mt-20 flex justify-center">
            <div className="relative w-90 h-64 animate-float">
              <img src={logo} alt="SmartTune" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in">
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Pourquoi SmartTune ?
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-8 hover:border-primary/50 hover:bg-card/80 transition-all duration-500 hover:shadow-glow animate-fade-in-up group hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-12 relative overflow-hidden hover:border-primary/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
            <div className="relative z-10 space-y-6">
              <h2 className="text-5xl font-extrabold text-foreground">
                Prêt à commencer ?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Rejoignez des milliers d'utilisateurs et d'artistes sur SmartTune
              </p>
              <Button 
                size="lg"
                className="bg-gradient-primary hover:shadow-glow hover:scale-105 transition-all duration-300 text-lg px-12 py-7 rounded-full animate-glow-pulse font-semibold"
                onClick={() => navigate("/register")}
              >
                Créer un compte gratuitement
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="SmartTune" className="w-8 h-8" />
              <span className="text-muted-foreground">© 2025 SmartTune. Tous droits réservés.</span>
            </div>
            <div className="flex gap-6 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">À propos</a>
              <a href="#" className="hover:text-primary transition-colors">Conditions</a>
              <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
