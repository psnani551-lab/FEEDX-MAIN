import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { subscriptionsAPI } from '@/lib/api';

// Email validation schema
const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty({ message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  name: z
    .string()
    .trim()
    .nonempty({ message: "Name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
});

const Subscribe = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = subscribeSchema.parse(formData);

      // Real API call
      await subscriptionsAPI.subscribe(validatedData as { name: string; email: string });

      // Success
      setIsSuccess(true);
      toast({
        title: "Successfully Subscribed!",
        description: "We'll notify you about our latest updates!",
      });

      // Reset form
      setFormData({ name: '', email: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const fieldErrors: { name?: string; email?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as 'name' | 'email'] = err.message;
          }
        });
        setErrors(fieldErrors);

        toast({
          title: "Validation Error",
          description: "Please check your input and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'name' | 'email', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-smooth mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          {/* Card */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-glow animate-scale-in">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>

            {isSuccess ? (
              // Success State
              <div className="text-center py-8 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">You're on the list!</h2>
                <p className="text-muted-foreground mb-6">
                  We'll send you an email with our latest updates.
                </p>
                <Link to="/">
                  <Button className="bg-gradient-brand hover:opacity-90 transition-smooth">
                    Back to Home
                  </Button>
                </Link>
              </div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3">
                    Get <span className="text-gradient">Early Access</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Be the first to know about our latest features. We'll send you an exclusive invitation.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                      disabled={isLoading}
                      maxLength={100}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                        maxLength={255}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-brand hover:opacity-90 transition-smooth"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      'Notify Me'
                    )}
                  </Button>
                </form>

                {/* Privacy Notice */}
                <p className="text-xs text-muted-foreground text-center mt-6">
                  We respect your privacy. Unsubscribe at any time.
                  <br />
                  By subscribing, you agree to receive updates about FEEDX.
                </p>
              </>
            )}
          </div>

          {/* Removed placeholder metrics */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Subscribe;