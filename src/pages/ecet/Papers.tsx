import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ecetAPI, EcetPaper } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, Clock, BarChart3 } from "lucide-react";

export default function Papers() {
    const [papers, setPapers] = useState<EcetPaper[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const data = await ecetAPI.getPapers();
                setPapers(data);
            } catch (error) {
                console.error("Failed to fetch papers:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPapers();
    }, []);

    const handleDownload = (url: string) => {
        window.open(url, "_blank");
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Previous Year Papers
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Download and practice with official ECET question papers from previous years.
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-64 rounded-xl bg-card/50 animate-pulse border border-primary/5" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {papers.map((paper, index) => (
                                <Card key={index} className="group hover:border-primary/40 transition-all border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-16 h-16 text-primary" />
                                    </div>
                                    <CardHeader>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium">{paper.year}</span>
                                            <Badge variant="secondary" className="ml-auto">{paper.season}</Badge>
                                        </div>
                                        <CardTitle className="text-xl">ECET {paper.year} Paper</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <BarChart3 className="w-4 h-4" />
                                                <span>{paper.questions} Qs</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                <span>{paper.duration}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Difficulty</span>
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-xs">{paper.difficulty}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-primary/5 pt-6">
                                        <Button
                                            className="w-full h-11"
                                            onClick={() => handleDownload(paper.downloadUrl)}
                                        >
                                            <Download className="mr-2 w-4 h-4" />
                                            Download PDF
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
