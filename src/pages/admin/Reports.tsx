export default function Reports() {
    return (
        <div className="min-h-screen bg-gradient-bg pt-16 pb-12 px-6">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-12">
                    Signalements
                </h1>

                <div className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-16">
                    <p className="text-2xl text-muted-foreground">Aucun signalement pour le moment</p>
                    <p className="text-muted-foreground mt-4">Tout est calme sur SmartTune</p>
                </div>
            </div>
        </div>
    );
}