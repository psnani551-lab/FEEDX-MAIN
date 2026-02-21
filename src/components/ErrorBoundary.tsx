import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card/40 backdrop-blur-sm rounded-3xl border border-rose-500/20 m-4">
                    <div className="p-4 rounded-full bg-rose-500/10 mb-6">
                        <AlertCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Something went <span className="text-rose-500">wrong.</span></h2>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        The application encountered an unexpected error. This has been logged and we'll look into it.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => this.setState({ hasError: false })}
                            variant="outline"
                            className="font-bold uppercase tracking-wider text-[10px]"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-brand font-bold uppercase tracking-wider text-[10px]"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reload Page
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-8 p-4 bg-black/40 rounded-xl text-left text-[10px] text-rose-300 overflow-auto max-w-full font-mono border border-rose-500/10">
                            {this.state.error?.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
