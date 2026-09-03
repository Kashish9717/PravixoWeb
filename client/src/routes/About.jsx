import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  LineChart,
  RefreshCw,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export function About() {
  const stats = [
    { value: "10,000+", label: "Creators" },
    { value: "2,500+", label: "Brands" },
    { value: "50,000+", label: "Campaigns" },
    { value: "98%", label: "Satisfaction" },
  ];

  const features = [
    {
      title: "Secure Payments",
      description:
        "Escrow system protecting funds until campaign deliverables are checked and approved.",
      icon: ShieldCheck,
    },
    {
      title: "Verified Creators",
      description:
        "Comprehensive creator profiling, real-time social metrics, and verified reviews.",
      icon: UserCheck,
    },
    {
      title: "Smart Matching",
      description:
        "Match campaigns with the absolute best-fit creators instantly.",
      icon: Zap,
    },
    {
      title: "Campaign Tracking",
      description:
        "Real-time tracking of links, clicks, view rates, and submission timelines.",
      icon: LineChart,
    },
    {
      title: "Transparent Workflow",
      description:
        "Collaborative dashboards with real-time comments, connections, and audit trails.",
      icon: RefreshCw,
    },
    {
      title: "Fast Support",
      description:
        "Dedicated account support to resolve payment, campaign, or technical questions.",
      icon: Headphones,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Brand",
      subtitle: "Sets Goals",
      desc: "Brands post detailed campaigns outlining goals, budgets, and criteria.",
    },
    {
      number: "02",
      title: "Campaign",
      subtitle: "Gets Approved",
      desc: "Our platform validates details and activates the public listing.",
    },
    {
      number: "03",
      title: "Creator",
      subtitle: "Submits Request",
      desc: "Matching creators submit connection requests to participate.",
    },
    {
      number: "04",
      title: "Content",
      subtitle: "Gets Created",
      desc: "Deliverables are submitted and checked directly inside the dashboard.",
    },
    {
      number: "05",
      title: "Payment",
      subtitle: "Gets Released",
      desc: "Escrow funds are released securely via Razorpay once verified.",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-primary/10 opacity-40 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-accent/10 opacity-30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            About Pravixo
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Connecting Brands with the{" "}
            <span className="text-gradient-sunset">Right Creators</span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            Pravixo is the premier campaign management and influencer
            collaboration platform. We empower brands to expand their footprint
            while enabling creators to monetize their passion through a
            verified, secure, and transparent marketplace.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="rounded-full px-6 gradient-sunset border-0 text-white shadow-glow"
            >
              <Link to="/browse">Explore Creators</Link>
            </Button>

            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/register">Join as Brand</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Our Story",
              text: "Founded in 2024, Pravixo began with a simple question: why is influencer marketing so opaque? Brands struggled with unverified creator metrics, while creators suffered from delayed payments. We built Pravixo to bridge this gap, offering data-driven profiles and automated secure escrows.",
            },
            {
              title: "Mission",
              text: "To build the world's most trusted environment for creator collaborations. We strive to automate the business details of influencer marketing—matching, contracting, tracking, and secure checkouts—so creators and brands can focus on what they do best: storytelling.",
            },
            {
              title: "Vision",
              text: "We envision a future where brand-creator partnerships are instantaneous, globally compliant, and completely secure. From nano-influencers to worldwide enterprises, we aim to normalize transparent pricing and metrics across the creator economy.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-md space-y-3"
            >
              <h3 className="font-display text-xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-secondary/5 py-8 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border/60">
            {stats.map((stat) => (
              <div key={stat.label} className="pt-4 md:pt-0">
                <span className="block font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                  {stat.value}
                </span>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Why Collaborate on Pravixo?
            </h2>
            <p className="text-sm text-muted-foreground">
              A comprehensive toolset engineered to guarantee successful,
              stress-free collaborations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-border bg-card p-6 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h4 className="font-display text-base font-bold text-foreground">
                      {feature.title}
                    </h4>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              How Pravixo Works
            </h2>
            <p className="text-sm text-muted-foreground">
              Our automated workflow guides you securely from campaign proposal
              to final payout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-border bg-card/40 p-5 space-y-2 relative"
              >
                <span className="absolute -top-3 right-4 font-mono text-3xl font-black text-primary/15">
                  {step.number}
                </span>

                <span className="block text-[10px] font-bold text-primary uppercase tracking-wider">
                  {step.title}
                </span>

                <h4 className="font-display text-sm font-bold text-foreground mt-1">
                  {step.subtitle}
                </h4>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Meet Our Values
            </h2>

            <p className="text-sm text-muted-foreground">
              The core principles driving our product and engineering decisions
              every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "1. Absolute Integrity",
                text: "We believe measurements and analytics should represent actual performance. We continuously filter mock metrics to keep our directory verified.",
              },
              {
                title: "2. Security First",
                text: "Creators deserve to get paid for their effort, and brands deserve to receive what they paid for. Security is built directly into our platform architecture.",
              },
              {
                title: "3. Frictionless Product",
                text: "We continually aim to replace manual paperwork and payment follow-ups with single-click actions, letting our members focus on building communities.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl border border-border bg-card/30"
              >
                <h4 className="font-display text-base font-bold text-foreground">
                  {value.title}
                </h4>

                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 sm:p-12 text-center space-y-4 max-w-4xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Ready to Launch Your Next Collaboration?
          </h2>

          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Create your account today and unlock a verified workspace of
            creators and professional business campaign tools.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Button
              asChild
              className="rounded-full px-6 gradient-sunset border-0 text-white shadow-glow"
            >
              <Link to="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;