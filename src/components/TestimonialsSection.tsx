import { useEffect, useState } from 'react';
import { Quote, BarChart3, ShieldAlert, Calendar } from 'lucide-react';
import { testimonialsAPI, Testimonial } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const ServiceStack = () => {
  const services = [
    {
      icon: BarChart3,
      title: "Anonymous Polling",
      subtitle: "REAL-TIME SENTIMENT DATA",
      desc: "Mass-scale opinion gathering engine. We aggregate student sentiment instantly without revealing identities.",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "hover:border-blue-400/30",
      delay: 0
    },
    {
      icon: ShieldAlert,
      title: "Complaint Resolution",
      subtitle: "ENCRYPTED GRIEVANCE CHANNEL",
      desc: "Direct, secure channel to administration. Track resolution timelines with zero fear of retaliation.",
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "hover:border-red-400/30",
      delay: 0.1
    },
    {
      icon: Calendar,
      title: "Event Discovery",
      subtitle: "CENTRALIZED ACTIVITY FEED",
      desc: "The heartbeat of campus life. Aggregating fests, workshops, and seminars across all polytechnics.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "hover:border-emerald-400/30",
      delay: 0.2
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 relative z-10 px-4">
      {services.map((service, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: service.delay }}
          className={`flex flex-col items-start text-left p-8 bg-white/[0.02] border border-white/[0.05] rounded-3xl transition-all group ${service.border} hover:bg-white/[0.04] hover:shadow-glow duration-200`}
        >
          <div className={`p-4 rounded-2xl ${service.bg} ${service.color} mb-6 group-hover:scale-110 transition-transform duration-200`}>
            <service.icon className="w-8 h-8" />
          </div>

          <div className="mb-4">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${service.color} opacity-80`}>
              {service.subtitle}
            </p>
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {service.title}
            </h3>
          </div>

          <p className="text-muted-foreground font-medium leading-relaxed text-sm">
            {service.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await testimonialsAPI.getAll();
        setTestimonials(data);
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="py-0 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-left max-w-2xl mb-16 relative">
          <div className="absolute -left-6 top-2 bottom-2 w-1 bg-primary/40 rounded-full hidden lg:block" />
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tighter uppercase leading-[0.9]">
            OUR <span className="text-primary">ECOSYSTEM.</span>
          </h2>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed">
            The complete architecture for student success. <br />
            <span className="text-foreground/80 italic font-bold">Skills, Opportunities, and Knowledge.</span>
          </p>
        </div>

        {/* Service Eco-System Showcase */}
        <ServiceStack />

        {/* Dynamic Testimonials Grid */}
        {testimonials.length > 0 && (
          <div className="mt-8">
            <div className="text-left max-w-2xl mb-16 relative">
              <div className="absolute -left-6 top-2 bottom-2 w-1 bg-primary/40 rounded-full hidden lg:block" />
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-6 tracking-tighter uppercase leading-[0.9]">
                COMMUNITY <span className="text-primary">FEEDBACK.</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 hover:border-primary/50 hover:shadow-glow transition-all duration-200 group">
                  <Quote className="size-6 text-primary mb-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <p className="text-muted-foreground font-medium leading-relaxed mb-8 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <Avatar className="size-10 border border-white/10">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback className="bg-white/5 text-[10px] font-black">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none mb-1">{testimonial.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
export default TestimonialsSection;
