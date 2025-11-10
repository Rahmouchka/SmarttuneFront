import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Music, Mail, Lock, ArrowLeft, Upload, FileText } from "lucide-react";
import logo from "@/assets/smarttune-logo.png";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

const artistSchema = z.object({
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
  bio: z.string()
    .min(50, "La biographie doit contenir au moins 50 caractères")
    .max(1000, "La biographie ne peut pas dépasser 1000 caractères"),
  artistDocument: z.any()
    .refine((files) => files?.length === 1, "Veuillez télécharger un document")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "La taille du fichier ne doit pas dépasser 5MB"
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Seuls les fichiers PDF sont acceptés"
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ArtistFormData = z.infer<typeof artistSchema>;

const RegisterArtist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
  });

  const watchFile = watch("artistDocument");

  const onSubmit = async (data: ArtistFormData) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("bio", data.bio);
      formData.append("artistDocument", data.artistDocument[0]);

      // TODO: Intégrer avec votre API Spring Boot
      const response = await fetch("http://localhost:8080/api/auth/register/artist", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'inscription");
      }

      toast({
        title: "Demande envoyée avec succès !",
        description: "Votre demande est en attente d'approbation. Vous recevrez un email dès qu'un administrateur aura validé votre compte.",
      });

      // Rediriger vers une page de confirmation
      navigate("/register/pending");
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="SmartTune" className="w-50 h-16 animate-wave" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Devenir artiste sur SmartTune
            </span>
          </h1>
          <p className="text-muted-foreground">
            Partagez votre musique avec le monde entier
          </p>
        </div>

        <Card className="p-8 border-2 border-border bg-card/50 backdrop-blur-sm">
          {/* Info banner */}
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">Note importante :</strong> Votre demande sera examinée par notre équipe. 
              Vous recevrez un email une fois votre compte validé.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground flex items-center gap-2">
                <Music className="w-4 h-4" />
                Nom d'artiste
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Votre nom de scène"
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

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Biographie artistique
              </Label>
              <Textarea
                id="bio"
                placeholder="Parlez-nous de votre parcours musical, vos influences, votre style..."
                className={`bg-background border-border min-h-32 ${errors.bio ? 'border-destructive' : ''}`}
                {...register("bio")}
                disabled={isLoading}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 50 caractères. Partagez votre histoire musicale !
              </p>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="artistDocument" className="text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Document de vérification (PDF)
              </Label>
              <div className="relative">
                <Input
                  id="artistDocument"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  {...register("artistDocument")}
                  disabled={isLoading}
                  onChange={(e) => {
                    register("artistDocument").onChange(e);
                    if (e.target.files?.[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                />
                <label
                  htmlFor="artistDocument"
                  className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                    errors.artistDocument 
                      ? 'border-destructive bg-destructive/10' 
                      : 'border-border bg-background hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {fileName ? (
                    <>
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm text-foreground">{fileName}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Cliquez pour télécharger votre document
                      </span>
                    </>
                  )}
                </label>
              </div>
              {errors.artistDocument && (
                <p className="text-sm text-destructive">{errors.artistDocument.message as string}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Téléchargez un PDF contenant : preuve d'identité, liens vers votre musique existante, 
                ou un press kit (max 5MB)
              </p>
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Déjà un compte ?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-semibold"
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

export default RegisterArtist;
