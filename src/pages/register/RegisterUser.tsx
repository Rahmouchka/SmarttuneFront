import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { useToast } from "@/hooks/use-toast.ts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Users,User, Phone, Calendar,Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import logo from "@/assets/smarttune-logo.png";

const userSchema = z.object({
  firstName: z.string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50)
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Prénom invalide"),

  lastName: z.string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50)
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nom invalide"),
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
  age: z.coerce.number()
      .int()
      .min(13)
      .max(100),

  gender: z.enum(["F", "H"], { message: "Veuillez sélectionner un genre" }),

  phone: z.string()
      .regex(/^(\+216|00216)?[0-9]{8}$/, "Numéro invalide (ex: 20123456)")
      .optional()
      .or(z.literal("")),
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

  const { register, handleSubmit, formState: { errors },setValue,watch } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: Intégrer avec votre API Spring Boot
      const response = await fetch("http://localhost:8082/api/auth/register/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          prenom: data.firstName,
          nom: data.lastName,
          email: data.email,
          password: data.password,
          age: data.age,
          genre: data.gender,
          numTel: data.phone || null,
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
            <img src={logo} alt="SmartTune" className="w-50 h-16 animate-wave" />
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
            {/* Prénom & Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input {...register("firstName")} placeholder="Jean" />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input {...register("lastName")} placeholder="Dupont" />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Âge */}
            <div className="space-y-2">
              <Label htmlFor="age">Âge</Label>
              <Input type="number" {...register("age")} placeholder="18" />
              {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label className="text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Genre
              </Label>
              <Select
                  onValueChange={(value) => setValue("gender", value as "F" | "H")}
                  defaultValue={watch("gender")}
                  disabled={isLoading}
              >
                <SelectTrigger className={`bg-background border-border ${errors.gender ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Sélectionnez votre genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="F">Femme</SelectItem>
                  <SelectItem value="H">Homme</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input type="tel" {...register("phone")} placeholder="+216 20 123 456" />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
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
