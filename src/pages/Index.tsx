import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TutorCard } from '@/components/TutorCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { mockTutors } from '@/lib/mock-data';
import { Search, UserCheck, CalendarCheck, BookOpen, ShieldCheck, Star, DollarSign, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-image.jpg';
import { useState } from 'react';

const steps = [
  { icon: Search, title: 'Find Your Tutor', description: 'Search by subject, module, or university to discover the right tutor for you.' },
  { icon: UserCheck, title: 'Pick Who Fits You', description: 'Browse tutor profiles, read reviews, and choose someone who matches your learning style.' },
  { icon: CalendarCheck, title: 'Book a Session', description: 'Select from available sessions your tutor offers — at times and places that work for you.' },
  { icon: BookOpen, title: 'Start Learning', description: 'Meet your tutor in person, get the help you need, and watch your grades improve.' },
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

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const topTutors = mockTutors.filter(t => (t.rating || 0) >= 4.5).slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero — Student-focused */}
      <section className="relative overflow-hidden bg-hero-gradient py-20 lg:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="font-display text-4xl font-extrabold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
                Struggling with a Module?{' '}
                <span className="text-gradient-gold">We'll Match You.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-primary-foreground/75">
                Find a verified tutor who knows your exact curriculum. Choose your session, book in seconds, and start improving your grades.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mt-8 flex w-full max-w-lg gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="What do you need help with? e.g. Calculus, Physics..."
                    className="h-12 pl-10 bg-background/95 text-foreground border-0 shadow-elevated placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 bg-gold-gradient font-semibold text-accent-foreground shadow-glow hover:opacity-90"
                >
                  Find Tutors
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-primary-foreground/60">
                <span>Popular:</span>
                {['Mathematics', 'Accounting', 'Physics', 'Programming'].map(subject => (
                  <button
                    key={subject}
                    onClick={() => navigate(`/browse?q=${encodeURIComponent(subject)}`)}
                    className="rounded-full border border-primary-foreground/20 px-3 py-1 text-xs text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src={heroImage}
                alt="Students studying together at a Namibian university campus"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
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

      {/* Why Choose Us */}
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

      {/* Featured Tutors */}
      <section className="py-20">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Top Rated Tutors</h2>
            <p className="mt-3 text-muted-foreground">Highly reviewed tutors ready to help you succeed</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button size="lg" onClick={() => navigate('/browse')} className="gap-2">
              Browse All Tutors <ArrowRight className="h-4 w-4" />
            </Button>
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

      {/* Become a Tutor CTA */}
      <section className="py-20">
        <div className="container mx-auto px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border bg-card p-8 md:p-12 text-center shadow-card"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
              <GraduationCap className="h-7 w-7 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-card-foreground md:text-4xl">
              Got the Grades? Become a Tutor
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Earn money by helping fellow students succeed. Set your own rate, choose your schedule, and keep 75% of every session.
            </p>
            <Button
              size="lg"
              className="mt-8 gap-2"
              onClick={() => navigate('/become-tutor')}
            >
              Apply to Tutor <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
