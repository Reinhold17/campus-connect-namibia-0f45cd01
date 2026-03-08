import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/RatingStars';
import { TutorCard } from '@/components/TutorCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { mockTutors } from '@/lib/mock-data';
import { Search, Calendar, Upload, MapPin, ShieldCheck, Users, DollarSign, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-image.jpg';

const steps = [
  { icon: Search, title: 'Search Tutor', description: 'Browse verified tutors by subject and university.' },
  { icon: Calendar, title: 'Book Session', description: 'Choose a group or one-on-one session that fits your schedule.' },
  { icon: Upload, title: 'Upload Payment', description: 'Submit proof of bank deposit to confirm your booking.' },
  { icon: MapPin, title: 'Attend Class', description: 'Meet your tutor at the physical session location on campus.' },
];

const features = [
  { icon: ShieldCheck, title: 'Verified Tutors', description: 'Every tutor is reviewed and approved by our admin team.' },
  { icon: MapPin, title: 'Physical Sessions', description: 'Real in-person tutoring on or near your university campus.' },
  { icon: DollarSign, title: 'Affordable Pricing', description: 'Group sessions at N$350 and one-on-one at N$500.' },
  { icon: GraduationCap, title: 'University-Focused', description: 'Built specifically for Namibian university students.' },
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
  const topTutors = mockTutors.filter(t => (t.rating || 0) >= 4.5).slice(0, 3);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero */}
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
                Find Verified Tutors.{' '}
                <span className="text-gradient-gold">Improve Your Grades.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-primary-foreground/75">
                Book physical group or one-on-one sessions near your campus. Trusted by students across Namibian universities.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-gold-gradient font-semibold text-accent-foreground shadow-glow hover:opacity-90"
                  onClick={() => navigate('/browse')}
                >
                  Browse Tutors
                </Button>
                <Button
                  size="lg"
                  className="bg-primary font-semibold text-primary-foreground shadow-elevated transition-all duration-300 hover:bg-primary/85 hover:shadow-glow"
                  onClick={() => navigate('/become-tutor')}
                >
                  Become a Tutor
                </Button>
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
            <p className="mt-3 text-muted-foreground">Four simple steps to academic success</p>
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
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Why Choose Us</h2>
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
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Top Rated Tutors</h2>
            <p className="mt-3 text-muted-foreground">Meet some of our highest-rated tutors</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topTutors.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/browse')}>
              View All Tutors
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
