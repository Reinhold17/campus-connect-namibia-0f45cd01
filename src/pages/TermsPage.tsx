import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last Updated: March 2026</p>

        <p className="mb-6 text-muted-foreground">
          Welcome to Campus HQ. By accessing or using our platform, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <Section title="1. Platform Purpose">
          <p>Campus HQ is an online platform that connects university students with verified tutors for academic assistance, study support, and learning services.</p>
          <p>Campus HQ acts as a facilitator between students and tutors and is not directly responsible for the tutoring services provided.</p>
        </Section>

        <Section title="2. User Accounts">
          <p>To access certain features, users must create an account.</p>
          <p>Users agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate and complete information</li>
            <li>Keep their login credentials secure</li>
            <li>Notify us immediately of unauthorized use</li>
          </ul>
          <p>Campus HQ reserves the right to suspend or terminate accounts that violate these terms.</p>
        </Section>

        <Section title="3. Tutor Responsibilities">
          <p>Tutors using Campus HQ must:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate academic qualifications</li>
            <li>Deliver tutoring services professionally</li>
            <li>Maintain respectful communication with students</li>
            <li>Follow all university academic integrity policies</li>
          </ul>
          <p>Campus HQ may remove tutors who violate these standards.</p>
        </Section>

        <Section title="4. Student Responsibilities">
          <p>Students agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the platform for legitimate academic purposes</li>
            <li>Respect tutors and scheduled sessions</li>
            <li>Provide accurate booking information</li>
          </ul>
          <p>Misuse of the platform may result in account suspension.</p>
        </Section>

        <Section title="5. Payments and Fees">
          <p>Campus HQ may charge service fees or commissions for tutoring sessions facilitated through the platform.</p>
          <p>Payment structures and pricing will be displayed before confirming any session booking.</p>
        </Section>

        <Section title="6. Cancellation and Refunds">
          <p>Cancellation policies may apply to scheduled tutoring sessions. Refunds may be issued at the discretion of Campus HQ depending on the circumstances of the cancellation or service issue.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>Campus HQ is not responsible for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The academic results of tutoring sessions</li>
            <li>Disputes between tutors and students</li>
            <li>Losses resulting from misuse of the platform</li>
          </ul>
          <p>The platform serves only as a connection service.</p>
        </Section>

        <Section title="8. Account Suspension">
          <p>Campus HQ reserves the right to suspend or terminate accounts that:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide false information</li>
            <li>Violate platform policies</li>
            <li>Engage in abusive or inappropriate behaviour</li>
          </ul>
        </Section>

        <Section title="9. Changes to Terms">
          <p>Campus HQ may update these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
        </Section>

        <Section title="10. Contact">
          <p>If you have any questions regarding these Terms, please contact:</p>
          <p className="font-semibold">Campus HQ Support</p>
          <p>support@campushq.na</p>
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
