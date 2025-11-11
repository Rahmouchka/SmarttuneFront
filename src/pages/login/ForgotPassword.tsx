import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useToast } from "@/hooks/use-toast.ts";

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8082/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ email }),
            });

            if (res.ok) {
                setSent(true);
                toast({ title: "Email envoyé ! Vérifiez votre boîte." });
            } else {
                const error = await res.text();
                throw new Error(error || "Email non trouvé");
            }
        } catch (error) {
            const err = error as Error;
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <p className="text-lg">Email envoyé à <strong>{email}</strong></p>
                    <Button onClick={() => navigate("/login")}>Retour au login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">Mot de passe oublié ?</h1>
                <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Envoi..." : "Envoyer le lien"}
                </Button>
            </form>
        </div>
    );
};

export default ForgotPassword;