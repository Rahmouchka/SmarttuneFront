import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast.ts";
import logo from "@/assets/smarttune-logo.png";

interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ARTIST" | "ADMIN";
  active: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8082/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Email ou mot de passe incorrect");
      }

      const user = await res.json();

      localStorage.setItem('user', JSON.stringify(user));

      console.log("User sauvegardé :", user); // Pour vérifier

      // Redirection selon rôle
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "ARTIST") {
        navigate("/artist/dashboard");
      } else {
        navigate("/user/dashboard");
      }

      toast({ title: "Connexion réussie !" });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="w-full max-w-md relative z-10 animate-scale-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="SmartTune" className="w-50 h-16 animate-wave" />
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border"
                    required
                />
              </div>

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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border-border pr-10"
                      required
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
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  size="lg"
                  disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
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