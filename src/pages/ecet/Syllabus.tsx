import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ecetAPI, EcetSubject } from "@/lib/api";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Syllabus() {
    const [syllabus, setSyllabus] = useState<EcetSubject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const data = await ecetAPI.getSyllabus();
                setSyllabus(data);
            } catch (error) {
                console.error("Failed to fetch syllabus:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSyllabus();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12 text-center">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            ECET Syllabus
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Comprehensive breakdown of topics for Mathematics, Physics, Chemistry, and Engineering.
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : (
                        syllabus.map((subject, index) => (
                            <Card key={index} className="mb-8 overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="bg-primary/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{subject.icon}</span>
                                            <CardTitle className="text-2xl">{subject.subject}</CardTitle>
                                        </div>
                                        <Badge variant="secondary">{subject.questions} Questions</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <Accordion type="single" collapsible className="w-full">
                                        {subject.topics.map((topic, tIndex) => (
                                            <AccordionItem key={tIndex} value={`topic-${index}-${tIndex}`}>
                                                <AccordionTrigger className="hover:no-underline">
                                                    <div className="text-left">
                                                        <div className="font-semibold text-primary">{topic.title}</div>
                                                        <div className="text-sm text-muted-foreground font-normal">
                                                            {topic.summary}
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                                        {topic.details.map((detail, dIndex) => (
                                                            <li key={dIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                <span className="text-primary mt-1">•</span>
                                                                {detail}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
