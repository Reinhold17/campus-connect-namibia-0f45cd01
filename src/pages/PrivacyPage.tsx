import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last Updated: March 2026</p>

        <p className="mb-6 text-muted-foreground">
          Campus Connect values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when using the platform.
        </p>

        <Section title="1. Information We Collect">
          <p>We may collect the following information when you use Campus Connect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>University information</li>
            <li>Academic modules</li>
            <li>Tutor verification documents</li>
            <li>Payment information (if applicable)</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>Your information is used to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage your account</li>
            <li>Match students with tutors</li>
            <li>Verify tutor qualifications</li>
            <li>Improve platform functionality</li>
            <li>Communicate important platform updates</li>
          </ul>
        </Section>

        <Section title="3. Data Security">
          <p>Campus Connect implements security measures to protect your personal information.</p>
          <p>All personal data and uploaded documents are stored securely and used only for platform operations and verification.</p>
        </Section>

        <Section title="4. Data Sharing">
          <p>Campus Connect does not sell or share your personal information with third parties except when required for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Platform functionality</li>
            <li>Payment processing</li>
            <li>Legal compliance</li>
          </ul>
        </Section>

        <Section title="5. User Control">
          <p>Users may update or delete their account information at any time through their profile settings.</p>
        </Section>

        <Section title="6. Cookies and Platform Analytics">
          <p>Campus Connect may use cookies and analytics tools to improve user experience and understand platform usage.</p>
        </Section>

        <Section title="7. Updates to this Policy">
          <p>Campus Connect may update this Privacy Policy periodically. Continued use of the platform indicates acceptance of the updated policy.</p>
        </Section>

        <Section title="8. Contact">
          <p>For questions about this Privacy Policy, please contact:</p>
          <p className="font-semibold">Campus Connect Support</p>
          <p>support@campusconnect.com</p>
        </Section>
      </div>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}
