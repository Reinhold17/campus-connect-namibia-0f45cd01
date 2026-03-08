import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                <GraduationCap className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Campus Connect</span>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Connecting Namibian students with verified tutors for in-person academic excellence.
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/browse" className="text-primary-foreground/70 transition-colors hover:text-accent">Browse Tutors</Link></li>
              <li><Link to="/become-tutor" className="text-primary-foreground/70 transition-colors hover:text-accent">Become a Tutor</Link></li>
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
            <h4 className="mb-3 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>info@campusconnect.na</li>
              <li>Windhoek, Namibia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} Campus Connect Namibia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
