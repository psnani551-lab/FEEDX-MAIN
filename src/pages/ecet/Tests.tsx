import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ecetAPI, EcetQuestion } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, RefreshCcw, CheckCircle2, XCircle, ChevronRight, Brain } from "lucide-react";

type QuizState = "selection" | "quiz" | "result";

export default function Tests() {
    const [allTests, setAllTests] = useState<Record<string, EcetQuestion[]>>({});
    const [currentSubject, setCurrentSubject] = useState<string | null>(null);
    const [questions, setQuestions] = useState<EcetQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizState, setQuizState] = useState<QuizState>("selection");
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const data = await ecetAPI.getTests();
                setAllTests(data);
            } catch (error) {
                console.error("Failed to fetch tests:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTests();
    }, []);

    const startQuiz = (subject: string) => {
        const subjectQuestions = [...allTests[subject]];
        // Shuffle and pick 10 questions
        const shuffled = subjectQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        setQuestions(shuffled);
        setCurrentSubject(subject);
        setCurrentIndex(0);
        setScore(0);
        setQuizState("quiz");
        setSelectedAnswer(null);
        setIsAnswerRevealed(false);
    };

    const handleAnswer = (option: string) => {
        if (isAnswerRevealed) return;
        setSelectedAnswer(option);
        setIsAnswerRevealed(true);
        if (option === questions[currentIndex].ans) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswerRevealed(false);
        } else {
            setQuizState("result");
        }
    };

    const resetQuiz = () => {
        setQuizState("selection");
        setCurrentSubject(null);
        setQuestions([]);
        setCurrentIndex(0);
        setScore(0);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading amazing tests...</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-3xl mx-auto">
                    {quizState === "selection" && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <header className="text-center">
                                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    ECET Subject Tests
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Test your knowledge with 10-question practice quizzes.
                                </p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(allTests).map((subject) => (
                                    <Card
                                        key={subject}
                                        className="group cursor-pointer hover:border-primary/50 transition-all border-primary/10 bg-card/50 backdrop-blur-sm"
                                        onClick={() => startQuiz(subject)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="capitalize">{subject}</CardTitle>
                                                <Brain className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <CardDescription>{allTests[subject].length} questions available</CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {quizState === "quiz" && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="capitalize px-4 py-1">
                                    {currentSubject} Test
                                </Badge>
                                <span className="text-sm font-medium text-muted-foreground">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                            </div>

                            <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />

                            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-xl leading-relaxed">
                                        {questions[currentIndex].q}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-3">
                                    {questions[currentIndex].options.map((option, idx) => {
                                        const isCorrect = option === questions[currentIndex].ans;
                                        const isSelected = option === selectedAnswer;

                                        let variant: "outline" | "default" | "secondary" = "outline";
                                        let bgColor = "";

                                        if (isAnswerRevealed) {
                                            if (isCorrect) bgColor = "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400";
                                            else if (isSelected) bgColor = "bg-red-500/10 border-red-500/50 text-red-600 dark:text-red-400";
                                        } else if (isSelected) {
                                            variant = "default";
                                        }

                                        return (
                                            <Button
                                                key={idx}
                                                variant={variant}
                                                className={`justify-start h-auto py-4 text-left whitespace-normal ${bgColor} transition-all duration-200`}
                                                onClick={() => handleAnswer(option)}
                                                disabled={isAnswerRevealed}
                                            >
                                                <span className="mr-3 w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0">
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                {option}
                                                {isAnswerRevealed && isCorrect && <CheckCircle2 className="ml-auto w-5 h-5 text-green-500" />}
                                                {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="ml-auto w-5 h-5 text-red-500" />}
                                            </Button>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {isAnswerRevealed && (
                                <Button
                                    className="w-full h-12 text-lg font-semibold"
                                    onClick={nextQuestion}
                                >
                                    {currentIndex < questions.length - 1 ? "Next Question" : "Finish Test"}
                                    <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    )}

                    {quizState === "result" && (
                        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm text-center py-12 animate-in zoom-in duration-500">
                            <CardContent className="space-y-6">
                                <div className="flex justify-center">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Trophy className="w-12 h-12 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold">Quiz Completed!</h2>
                                    <p className="text-muted-foreground text-lg">
                                        You scored <span className="text-primary font-bold">{score}</span> out of {questions.length}
                                    </p>
                                </div>
                                <div className="pt-6">
                                    <Button onClick={resetQuiz} className="h-12 px-8 text-lg">
                                        <RefreshCcw className="mr-2 w-5 h-5" />
                                        Try Another Subject
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
