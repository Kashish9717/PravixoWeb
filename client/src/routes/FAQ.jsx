import { useState } from "react";
import { Sparkles, Plus, Minus } from "lucide-react";

export function FAQ() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    // General
    {
      sec: "General",
      q: "What is Pravixo?",
      a: "Pravixo is an automated business platform linking brands and creators. We provide secure payments, profile tracking, and verification workflows.",
    },
    {
      sec: "General",
      q: "How do I create a free account?",
      a: "Click on 'Join Us' or 'Register' at the top, choose your role (Brand or Creator), fill in your credentials, and authenticate your email.",
    },
    {
      sec: "General",
      q: "Is Pravixo remote-friendly?",
      a: "Yes, Pravixo is built for online remote collaboration. Team support is available 100% remote across India.",
    },

    // Creators
    {
      sec: "Creators",
      q: "How do creators earn money on Pravixo?",
      a: "Creators search for brand campaigns, submit connection proposals, complete work, and receive secure payouts from escrow.",
    },
    {
      sec: "Creators",
      q: "Do you take a fee from my earnings?",
      a: "We take a small platform fee (ranging from 3% to 8% depending on your active subscription plan) to maintain security and payments.",
    },
    {
      sec: "Creators",
      q: "How do I sync my Youtube subscribers and metrics?",
      a: "Authenticate under 'Connections' in your dashboard. The sync updates statistics automatically every day.",
    },
    {
      sec: "Creators",
      q: "Can I manage multiple social accounts?",
      a: "Yes, you can link Instagram, YouTube, and other platforms directly inside your Connection Dashboard.",
    },

    // Brands
    {
      sec: "Brands",
      q: "How do brands verify creator analytics?",
      a: "Pravixo connects directly to official Google and Meta APIs to fetch real-time engagement, location, and audience details, eliminating fake screenshots.",
    },
    {
      sec: "Brands",
      q: "What is a Campaign Escrow?",
      a: "Escrow secures the creator's fee. Brands deposit campaign budgets before work starts. Funds are only paid once verified deliverables are submitted.",
    },
    {
      sec: "Brands",
      q: "Can I invite specific creators to my campaigns?",
      a: "Yes, brands can browse our verified directory and invite creators directly to active proposals.",
    },
    {
      sec: "Brands",
      q: "How do I track link performance?",
      a: "Pravixo generates custom referral links for creators. Brands monitor views and clicks inside their dashboard in real time.",
    },

    // Payments
    {
      sec: "Payments",
      q: "What payment gateway does Pravixo use?",
      a: "We use Razorpay for secure checkout. We support credit cards, net banking, UPI, and bank transfers.",
    },
    {
      sec: "Payments",
      q: "How long do payouts take?",
      a: "Once the brand approves the deliverable, funds are added to your balance. Withdrawals are processed to your bank within 1-3 business days.",
    },
    {
      sec: "Payments",
      q: "What happens if a brand rejects my deliverable?",
      a: "If there's a dispute, our moderation team audits the submission rules and deliverable links to resolve payments fairly.",
    },

    // Subscriptions
    {
      sec: "Packages",
      q: "What features are included in the Pro Plan?",
      a: "Pro includes advanced audience filter tools, reduced fees (5%), auto-sync intervals, and verified checkmarks.",
    },
    {
      sec: "Packages",
      q: "How does billing work?",
      a: "Packages are billed monthly. You can upgrade, downgrade, or cancel from your dashboard settings.",
    },
    {
      sec: "Packages",
      q: "Do you offer a free plan?",
      a: "Yes, our Starter plan is completely free and lets creators link profiles and apply to campaigns.",
    },

    // Verification
    {
      sec: "Verification",
      q: "What does the verified badge mean?",
      a: "The badge indicates that our team manually reviewed and validated the creator's real identity, location, and social sync history.",
    },
    {
      sec: "Verification",
      q: "How long does verification review take?",
      a: "We manually verify accounts. It usually takes 2-4 business days.",
    },
    {
      sec: "Verification",
      q: "Can my verified status be revoked?",
      a: "Yes, we revoke verification if creators use fake metrics, delete profiles, or violate communication rules.",
    },

    // Campaigns
    {
      sec: "Campaigns",
      q: "What deliverables can I request?",
      a: "Brands can request YouTube videos, Instagram posts, stories, reels, or custom affiliate links.",
    },
    {
      sec: "Campaigns",
      q: "How do I submit deliverables?",
      a: "Go to your active campaign connection card, click 'Submit Deliverable', input the URL, and click submit.",
    },
    {
      sec: "Campaigns",
      q: "Is there a limit on how many campaigns I can join?",
      a: "Starter accounts can participate in 3 active connections simultaneously. Upgrading to Pro or Elite removes limits.",
    },
  ];

  const handleToggle = (idx) => {
    setExpandedFAQ(expandedFAQ === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/3 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-20 right-1/3 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            FAQs
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked{" "}
            <span className="text-gradient-sunset">Questions</span>
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Find answers to common questions about accounts, metrics,
            campaigns, package upgrades, and secure escrow checkouts.
          </p>
        </div>

        {/* ACCORDION FAQ CARDS */}
        <div className="space-y-3">
          {faqData.map((faq, idx) => {
            const isExpanded = expandedFAQ === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-medium text-xs sm:text-sm text-foreground hover:bg-secondary/40"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[9px] uppercase font-bold tracking-wider text-primary">
                      {faq.sec}
                    </span>

                    <span className="block">{faq.q}</span>
                  </div>

                  {isExpanded ? (
                    <Minus className="h-4 w-4 text-primary shrink-0 ml-4" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary shrink-0 ml-4" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-5 border-t border-border/60 bg-secondary/10 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FAQ;