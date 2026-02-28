import { motion } from 'framer-motion';
import { BriefcaseBusiness, BookOpen, GraduationCap, ArrowRight, Calendar, Briefcase, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const AboutSection = () => {
  const features = [
    { icon: Calendar, title: "Live Workshops", description: "Interactive learning sessions" },
    { icon: Briefcase, title: "Placement Support", description: "Career guidance & job assistance" },
    { icon: GraduationCap, title: "Skill Certifications", description: "Industry-recognized credentials" },
    { icon: Clock, title: "24/7 Resources", description: "Learn at your own pace" },
  ];

  const sokModel = [
    {
      icon: GraduationCap,
      title: "S — Skills",
      desc: "Freelancing, certifications, and hands-on projects to build real-world expertise.",
      href: "/projects",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: BriefcaseBusiness,
      title: "O — Opportunities",
      desc: "Access to jobs, startup ecosystems, and internship programs.",
      href: "/join",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BookOpen,
      title: "K — Knowledge",
      desc: "Curated notes, workshops, and learning resources for continuous growth.",
      href: "/resources",
      gradient: "from-orange-500 to-amber-500"
    }
  ];

  return (
    <section id="about" className="py-12 bg-background relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-6 lg:px-12">

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mx-auto">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Our Mission</span>
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter uppercase leading-none mb-8">
              WHO WE <span className="text-primary pr-2">ARE.</span>
            </h2>

            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50 pb-2">
                A dynamic ecosystem for Skill Exchange & Industrial Exposure.
              </p>
              <p className="text-xl md:text-2xl font-medium max-w-4xl mx-auto leading-relaxed">
                We believe Polytechnic education is the foundation of technological progress. FeedX bridges the gap between curriculum and career through a focused S-O-K model (Skills, Opportunities, Knowledge).
              </p>
              <p className="text-lg md:text-xl font-medium max-w-3xl mx-auto">
                We're not just preparing students for their first job; we're empowering them with the mindset and mastery to navigate an ever-evolving industrial landscape.
              </p>
            </div>
          </motion.div>
        </div>

        {/* S-O-K Model Section */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 mt-12">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Our Framework</span>
            </div>
            <h3 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tighter uppercase leading-none mb-6">
              THE S-O-K <span className="text-primary pr-2">MODEL.</span>
            </h3>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed">
              A comprehensive framework designed to transform students into industry-ready professionals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {sokModel.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link to={item.href}>
                  <Card className="glass-card border-white/10 hover:border-primary/50 hover:shadow-glow transition-all duration-500 group h-full overflow-hidden">
                    <CardContent className="p-8 space-y-6 relative">
                      {/* Gradient Accent */}
                      <div className={`absolute top - 0 left - 0 right - 0 h - 1 bg - gradient - to - r ${item.gradient} opacity - 0 group - hover: opacity - 100 transition - opacity`} />

                      {/* Icon */}
                      <div className={`w - 16 h - 16 rounded - 2xl bg - gradient - to - br ${item.gradient} p - 0.5 group - hover: scale - 110 transition - transform duration - 300`}>
                        <div className="w-full h-full bg-background rounded-2xl flex items-center justify-center">
                          <item.icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h4 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Explore</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;