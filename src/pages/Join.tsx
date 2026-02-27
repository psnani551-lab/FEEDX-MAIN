import { Button } from '@/components/ui/button';
import { joinIllustration } from '@/lib/illustrations';
import { SOCIAL_LINKS } from '@/lib/socialLinks';
import { MessageCircle, Instagram, Youtube } from 'lucide-react';
import { subscriptionsAPI } from '@/lib/api';

const Join = () => {
  const socials = [
    {
      title: 'WhatsApp',
      href: SOCIAL_LINKS.whatsappChannel,
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
    },
    {
      title: 'Instagram',
      href: SOCIAL_LINKS.instagram,
      icon: <Instagram className="w-6 h-6" />,
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'hover:from-pink-600 hover:to-purple-700',
    },
    {
      title: 'YouTube',
      href: SOCIAL_LINKS.youtube,
      icon: <Youtube className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">

      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left side - Text and buttons */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
                  Join FEEDX
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  Become part of Telangana's largest polytechnic student community
                </p>
              </div>

              {/* Social media buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
                {socials.map((social) => (
                  <a
                    key={social.title}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r ${social.color} ${social.hoverColor} text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105`}
                  >
                    {social.icon}
                    <span>{social.title}</span>
                  </a>
                ))}
              </div>

              {/* Join Form */}
              <div className="max-w-md mx-auto lg:mx-0 pt-8">
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-glow hover-glow-primary transition-all duration-300">
                  <h3 className="text-xl font-bold mb-2">Can't wait to join?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Leave your email and we'll reach out with community updates!</p>
                  <form
                    className="space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                      const email = (form.elements.namedItem('email') as HTMLInputElement).value;

                      try {
                        await subscriptionsAPI.subscribe({ name, email });
                        alert('Thank you for your interest! We will be in touch soon.');
                        form.reset();
                      } catch (err) {
                        alert('Something went wrong. Please try again.');
                      }
                    }}
                  >
                    <input
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <input
                      name="email"
                      type="email"
                      placeholder="Email Address"
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <Button type="submit" className="w-full bg-gradient-brand hover:opacity-90 transition-smooth">
                      Join the Community
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right side - Illustration */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={joinIllustration}
                alt="Join FEEDX Community"
                className="w-full max-w-md lg:max-w-lg animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Join;