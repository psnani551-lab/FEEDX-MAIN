import { useState } from 'react';
import { User, Mail, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react';
import { contactAPI } from '@/lib/api';

export default function ContactForm() {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.target as HTMLFormElement);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    try {
      await contactAPI.send({ name, email, message });
      setResult("Success!");
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setResult("Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          />
        </div>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={4}
            className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
      {result && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${result === "Success!"
          ? "bg-green-50 text-green-800 border border-green-200"
          : "bg-red-50 text-red-800 border border-red-200"
          }`}>
          {result === "Success!" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{result}</span>
        </div>
      )}
    </div>
  );
}