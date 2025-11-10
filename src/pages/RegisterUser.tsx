import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft } from "lucide-react";
import logo from "@/assets/smarttune-logo.png";

const userSchema = z.object({
  username: z.string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, _ et -"),
  email: z.string()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

const RegisterUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: Intégrer avec votre API Spring Boot
      const response = await fetch("http://localhost:8080/api/auth/register/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      toast({
        title: "Compte créé avec succès !",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });

      // Rediriger vers la page de confirmation ou de connexion
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="SmartTune" className="w-16 h-16 animate-wave" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Créer un compte utilisateur
            </span>
          </h1>
          <p className="text-muted-foreground">
            Rejoignez SmartTune et découvrez de la musique incroyable
          </p>
        </div>

        <Card className="p-8 border-2 border-border bg-card/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom d'utilisateur
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="votrenomdutilisateur"
                className={`bg-background border-border ${errors.username ? 'border-destructive' : ''}`}
                {...register("username")}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

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
                className={`bg-background border-border ${errors.email ? 'border-destructive' : ''}`}
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
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
                  className={`bg-background border-border pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`bg-background border-border pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-glow-accent transition-all duration-300"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Création en cours..." : "Créer mon compte"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Déjà un compte ?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-accent hover:underline font-semibold"
              >
                Se connecter
              </button>
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/register")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au choix du type de compte
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
