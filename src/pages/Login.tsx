import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import logo from "@/assets/smarttune-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="SmartTune" className="w-16 h-16 animate-wave" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Bon retour sur SmartTune
            </span>
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous pour continuer votre expérience musicale
          </p>
        </div>

        <Card className="p-8 border-2 border-border bg-card/50 backdrop-blur-sm">
          <form className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                className="bg-background border-border"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-background border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-primary hover:underline">
                Mot de passe oublié ?
              </a>
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              size="lg"
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Pas encore de compte ?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="text-primary hover:underline font-semibold"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
