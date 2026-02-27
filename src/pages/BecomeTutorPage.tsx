import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { GraduationCap, CheckCircle } from 'lucide-react';

export default function BecomeTutorPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="max-w-md text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-success" />
            <h1 className="mt-4 font-display text-2xl font-bold">Application Submitted!</h1>
            <p className="mt-2 text-muted-foreground">Our admin team will review your application and get back to you shortly. You'll be notified once approved.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">Become a Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Share your knowledge and earn while helping fellow students</p>
        </div>

        <form
          className="space-y-4 rounded-xl border bg-card p-6 shadow-card"
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue={user?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ''} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="university">University</Label>
              <Input id="university" placeholder="e.g. University of Namibia" required />
            </div>
            <div>
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              <Input id="yearOfStudy" placeholder="e.g. 3rd Year" required />
            </div>
          </div>
          <div>
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input id="subjects" placeholder="Mathematics, Physics, Chemistry" required />
          </div>
          <div>
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea id="bio" placeholder="Tell students about your tutoring experience and approach..." rows={4} required />
          </div>
          <div>
            <Label htmlFor="transcript">Academic Transcript (PDF)</Label>
            <Input id="transcript" type="file" accept=".pdf,.jpg,.png" />
            <p className="mt-1 text-xs text-muted-foreground">Upload your transcript for verification</p>
          </div>
          <Button type="submit" className="w-full">Submit Application</Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
