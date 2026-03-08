import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, TrendingUp, ShieldCheck, Star, DollarSign, GraduationCap, ArrowRight, BookOpen, UserCheck, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import tutor1 from '@/assets/tutor-1.jpg';
import tutor2 from '@/assets/tutor-2.jpg';
import tutor3 from '@/assets/tutor-3.jpg';
import tutor4 from '@/assets/tutor-4.jpg';

const subjects = ['Calculus', 'Accounting', 'Physics', 'Programming', 'Chemistry', 'Statistics', 'Economics', 'Engineering'];

const trending = ['Mathematics', 'Accounting', 'Physics', 'Programming', 'Chemistry', 'Statistics', 'Law', 'Economics'];

const steps = [
  { icon: Search, title: 'Search Your Subject', description: 'Type what you need help with and discover tutors who specialise in it.' },
  { icon: UserCheck, title: 'Choose Your Tutor', description: 'Compare profiles, reviews, and rates — then pick the tutor that fits you.' },
  { icon: CalendarCheck, title: 'Book a Session', description: 'Select from available sessions your tutor offers at times that work for you.' },
  { icon: BookOpen, title: 'Start Learning', description: 'Meet your tutor, get the help you need, and watch your grades improve.' },
];

const features = [
  { icon: ShieldCheck, title: 'Verified & Approved', description: 'Every tutor is ID-verified and approved by our team before they can teach.' },
  { icon: Star, title: 'Student Reviews', description: 'Read honest reviews from other students to find tutors who actually deliver results.' },
  { icon: DollarSign, title: 'Transparent Pricing', description: 'See tutor rates upfront. No hidden fees — you choose what fits your budget.' },
  { icon: GraduationCap, title: 'Your Campus, Your Tutor', description: 'Find tutors at your university who understand your exact curriculum and modules.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const DiamondImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <div className={`relative ${className}`}>
    <div className="w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rotate-45 overflow-hidden rounded-2xl border-4 border-accent/30 shadow-elevated">
      <img src={src} alt={alt} className="-rotate-45 scale-[1.42] object-cover w-full h-full" />
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSubject, setCurrentSubject] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubject((prev) => (prev + 1) % subjects.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/browse?q=${encodeURIComponent(searchQuery.trim())}` : '/browse');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero — Wyzant Style */}
      <section className="relative overflow-hidden bg-muted py-16 lg:py-24">
        {/* Decorative accent blocks */}
        <div className="absolute top-10 left-0 w-20 h-20 bg-accent/20 rotate-45 -translate-x-10 rounded-md hidden lg:block" />
        <div className="absolute bottom-10 right-0 w-16 h-16 bg-primary/20 rotate-45 translate-x-8 rounded-md hidden lg:block" />
        <div className="absolute top-1/2 left-4 w-10 h-10 bg-accent/15 rotate-45 rounded-sm hidden lg:block" />
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-primary/10 rotate-45 rounded-sm hidden lg:block" />

        <div className="container relative mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Left diamond images */}
            <div className="hidden lg:flex flex-col gap-6 items-end flex-shrink-0">
              <DiamondImage src={tutor1} alt="Campus Connect tutor" className="" />
              <DiamondImage src={tutor2} alt="Campus Connect tutor" className="-mr-8" />
            </div>

            {/* Center content */}
            <div className="flex-1 text-center px-4 lg:px-12 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
                  Namibia's trusted network for{' '}
                  <span className="relative inline-block">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentSubject}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="inline-block bg-accent/20 px-3 py-1 rounded-md text-accent-foreground"
                      >
                        {subjects[currentSubject]}
                      </motion.span>
                    </AnimatePresence>
                  </span>{' '}
                  tutors
                </h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mt-10 flex w-full max-w-lg mx-auto gap-0">
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="What would you like to learn?"
                    className="h-14 rounded-r-none border-r-0 bg-card text-foreground text-base shadow-card placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 rounded-l-none px-6 bg-accent text-accent-foreground hover:bg-accent/90 shadow-card"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </form>

                {/* Trending */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <TrendingUp className="h-4 w-4 text-accent" /> Trending:
                  </span>
                  {trending.map(subject => (
                    <button
                      key={subject}
                      onClick={() => navigate(`/browse?q=${encodeURIComponent(subject)}`)}
                      className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right diamond images */}
            <div className="hidden lg:flex flex-col gap-6 items-start flex-shrink-0">
              <DiamondImage src={tutor3} alt="Campus Connect tutor" className="" />
              <DiamondImage src={tutor4} alt="Campus Connect tutor" className="-ml-8" />
            </div>
          </div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {[
              { highlight: '5-Star', label: 'Verified Reviews' },
              { highlight: 'Expert Tutors', label: 'across 50+ subjects' },
              { highlight: 'Good Fit', label: 'Guarantee' },
            ].map((stat) => (
              <div key={stat.highlight} className="text-center">
                <div className="flex justify-center mb-1">
                  <div className="w-3 h-3 rotate-45 bg-accent rounded-sm" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{stat.highlight}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Getting help has never been easier</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative rounded-xl border bg-card p-6 text-center shadow-card"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-accent font-body text-sm font-bold text-accent-foreground">
                  {i + 1}
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students Trust Us */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Why Students Trust Us</h2>
            <p className="mt-3 text-muted-foreground">Built for Namibian students, by Namibian students</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border bg-card p-6 shadow-card"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15">
                  <feat.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground">{feat.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Ace Your Next Exam?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
              Join hundreds of students already improving their grades with Campus Connect tutors.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-gold-gradient font-semibold text-accent-foreground shadow-glow hover:opacity-90"
                onClick={() => navigate('/browse')}
              >
                Find a Tutor Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate('/signup')}
              >
                Create Free Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
