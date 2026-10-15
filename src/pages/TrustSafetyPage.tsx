import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, IdCard, CreditCard, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function TrustSafetyPage() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Tutor Verification',
      description: 'Every tutor on Campus-CONNECT goes through a rigorous multi-step verification process. Tutors must submit their academic credentials, including the specific modules they can teach and the grades they achieved. Only after admin review and approval does a tutor become visible to students.',
    },
    {
      icon: IdCard,
      title: 'Identity Checks',
      description: 'Tutors are required to upload both a valid student ID and a government-issued ID. These documents are securely stored and reviewed by our admin team to confirm each tutor\'s identity. Verified tutors receive a "Verified Tutor" badge on their profile.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'All payment transactions are handled through our secure platform. Students upload proof of payment, which is verified by admins before session details (including location and WhatsApp group links) are shared. This ensures both parties are protected.',
    },
    {
      icon: Users,
      title: 'Student Protection',
      description: 'Campus-CONNECT prioritises student safety. Tutors who violate our code of conduct face immediate suspension. Students can report any concerns directly through the platform, and our admin team reviews all reports promptly.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Trust & Safety</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your safety is our top priority. Here's how Campus-CONNECT protects students and ensures quality tutoring experiences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-border/50">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <pillar.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">{pillar.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 rounded-xl border bg-card p-8 text-center">
          <h3 className="font-display text-2xl font-semibold mb-3">Our Commitment</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            All personal data submitted to Campus-CONNECT is securely stored and used strictly for verification and platform services. Your information will remain confidential and will not be shared without your permission.
          </p>
          <p className="text-sm text-muted-foreground">
            Questions or concerns? Contact us at{' '}
            <a href="mailto:support@campushq.na" className="text-primary hover:underline">
              support@campushq.na
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
