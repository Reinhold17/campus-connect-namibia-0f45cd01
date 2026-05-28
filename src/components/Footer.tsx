import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/campus-hq-logo.png';

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src={logo} alt="Campus HQ" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
              <span className="font-display text-lg font-bold">Campus HQ</span>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Connecting Namibian students with verified tutors for in-person academic excellence.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="text-primary-foreground/70 transition-colors hover:text-accent">Browse Tutors</Link></li>
              <li><Link to="/signup" className="text-primary-foreground/70 transition-colors hover:text-accent">Create Account</Link></li>
              <li><Link to="/#how-it-works" className="text-primary-foreground/70 transition-colors hover:text-accent">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-primary-foreground/70 transition-colors hover:text-accent">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-primary-foreground/70 transition-colors hover:text-accent">Privacy Policy</Link></li>
              <li><Link to="/trust-safety" className="text-primary-foreground/70 transition-colors hover:text-accent">Trust & Safety</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">For Tutors</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/become-tutor" className="inline-flex items-center gap-1 text-accent font-medium transition-colors hover:text-accent/80">
                  Become a Tutor <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li><Link to="/login" className="text-primary-foreground/70 transition-colors hover:text-accent">Tutor Login</Link></li>
            </ul>

            <h4 className="mb-2 mt-6 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Contact</h4>
            <ul className="space-y-1 text-sm text-primary-foreground/70">
              <li>info@campushq.na</li>
              <li>Windhoek, Namibia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Campus HQ. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
