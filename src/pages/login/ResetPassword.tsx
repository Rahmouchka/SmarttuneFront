import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useToast } from "@/hooks/use-toast.ts";

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [valid, setValid] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setValid(false);
            return;
        }

        fetch(`http://localhost:8082/api/auth/validate-reset-token?token=${token}`)
            .then((res) => res.json())
            .then((data: boolean) => setValid(data))
            .catch(() => setValid(false));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirm) {
            toast({ title: "Les mots de passe ne correspondent pas" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8082/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ token: token!, newPassword: password }),
            });

            if (res.ok) {
                toast({ title: "Mot de passe réinitialisé !" });
                navigate("/login");
            } else {
                const error = await res.text();
                throw new Error(error || "Token invalide ou expiré");
            }
        } catch (error) {
            const err = error as Error;
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (!token || valid === false) {
        return <div className="text-center p-8 text-destructive">Lien invalide ou expiré.</div>;
    }

    if (valid === null) {
        return <div className="text-center p-8">Validation du lien...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 p-8 bg-card rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-center">Nouveau mot de passe</h1>
                <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                />
                <Input
                    type="password"
                    placeholder="Confirmer"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Enregistrement..." : "Réinitialiser"}
                </Button>
            </form>
        </div>
    );
};

export default ResetPassword;