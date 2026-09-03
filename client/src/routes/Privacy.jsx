import { Sparkles, Calendar } from "lucide-react";

export function Privacy() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Legal
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            Privacy <span className="text-gradient-sunset">Policy</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed flex items-center justify-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" /> Last Updated: July 3, 2026
          </p>
        </div>

        {/* POLICY CONTENT */}
        <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-md space-y-8 text-foreground text-xs sm:text-sm leading-relaxed">
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold">1. Information We Collect</h3>
            <p className="text-muted-foreground">
              Pravixo collects information to provide verification services and campaign operations:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>Profile Credentials:</strong> Name, email address, password, phone number, and physical office location.</li>
              <li><strong>Social Media Connections:</strong> If you sync your profiles, we fetch subscriber counts, average views, engagement ratios, and video/post URLs from official Meta and Google APIs.</li>
              <li><strong>Payment Account Data:</strong> Bank account routing numbers, PAN details, and transaction history processed via Razorpay.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold">2. How We Use Data</h3>
            <p className="text-muted-foreground">
              We process your personal information for purposes based on our legitimate business interests, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Setting up your brand or influencer profile inside our marketplace directory.</li>
              <li>Authenticating transaction transfers and escrow settlements via our Razorpay integration.</li>
              <li>Verifying channel analytics to block duplicate profiles and prevent click abuse.</li>
              <li>Sending automated campaign milestone updates, payment notifications, and system alerts.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold">3. Cookies & Local Storage</h3>
            <p className="text-muted-foreground">
              Pravixo uses session cookies and browser local storage to preserve active user credentials, light/dark theme parameters, and dismiss status logs. Disabling browser cookies might prevent you from accessing dashboard tabs.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold">4. Payments Security</h3>
            <p className="text-muted-foreground">
              All platform transactions are securely processed through Razorpay. Pravixo does not store your direct credit card numbers or banking passwords. Transactions comply with security protocols.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold">5. Data Retention & Deletion</h3>
            <p className="text-muted-foreground">
              We keep your profile data for as long as your account remains active. You can request account deletion at any time from your settings tab. Deleted accounts clear all linked connections, metrics, and profiles from our database within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold">6. User Rights</h3>
            <p className="text-muted-foreground">
              You have the right to access, inspect, modify, or export any personal information stored in your Pravixo profile. Reach out to our team at <strong>legal@pravixo.com</strong> to submit information requests.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}


export default Privacy;