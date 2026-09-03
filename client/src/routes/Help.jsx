import { useState } from "react";
import {
  Sparkles,
  Search,
  User,
  Target,
  CreditCard,
  Star,
  BadgeAlert,
  Plus,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/Input";

export function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState(null);

  const categories = [
    {
      id: "account",
      title: "Account Management",
      icon: User,
      articles: [
        {
          id: "acc-1",
          question: "How do I link my YouTube or Instagram account?",
          answer:
            "Navigate to your Influencer Dashboard and select the 'Connections' tab. Under 'Linked Accounts', select your platform (YouTube/Instagram) and authenticate with your social credentials. Pravixo will sync your followers, views, and engagement metrics automatically.",
        },
        {
          id: "acc-2",
          question: "How can I edit my profile location or category tag?",
          answer:
            "Go to your dashboard, click on 'Edit Profile', select your category from the list and enter your primary location. Click 'Save Profile' to commit the changes.",
        },
        {
          id: "acc-3",
          question: "What is account verification and how do I apply?",
          answer:
            "Verification puts a checkmark on your creator card, increasing matching rates. Apply from the profile screen by providing links to active campaigns and audience metrics. Admin checks all accounts manually.",
        },
      ],
    },

    {
      id: "campaigns",
      title: "Campaign Management",
      icon: Target,
      articles: [
        {
          id: "camp-1",
          question: "How do I post a new brand campaign?",
          answer:
            "As a Brand, log into the customer dashboard and select 'Create Campaign'. Enter goals, description, creator category requirements, target deliverables, and escrow budget. Once approved, the campaign goes live.",
        },
        {
          id: "camp-2",
          question: "How do creators submit campaign deliverables?",
          answer:
            "Inside the Connection panel for the active campaign, click 'Submit Deliverable'. Provide the live link and screenshots. The brand is notified to check and verify the content.",
        },
        {
          id: "camp-3",
          question: "Can I edit an active campaign details?",
          answer:
            "Active campaigns cannot be edited if creators have already joined. Contact Support if you need to adjust budgets or timeline terms.",
        },
      ],
    },

    {
      id: "payments",
      title: "Escrow & Payments",
      icon: CreditCard,
      articles: [
        {
          id: "pay-1",
          question: "How does the Pravixo Escrow payment system work?",
          answer:
            "When a brand starts a campaign connection, they deposit the budget into escrow. Pravixo holds the funds securely. Once the creator submits their deliverables and the brand approves, the funds are paid out.",
        },
        {
          id: "pay-2",
          question: "What payment gateways are supported?",
          answer:
            "Pravixo integrates Razorpay for secure payments, supporting credit cards, net banking, UPI, and bank transfers.",
        },
        {
          id: "pay-3",
          question: "How do creators request a payout?",
          answer:
            "Once deliverables are approved, funds are added to your dashboard balance. Go to the 'Payouts' section, input your bank details, and click 'Withdraw' to trigger a payment transfer.",
        },
      ],
    },

    {
      id: "subscriptions",
      title: "Platform Packages",
      icon: Star,
      articles: [
        {
          id: "sub-1",
          question: "What plans are available on Pravixo?",
          answer:
            "We offer Starter (Free), Pro (Advanced features, lower fees), and Elite (Enterprise metrics, dedicated support) plans.",
        },
        {
          id: "sub-2",
          question: "How do I upgrade my package?",
          answer:
            "Go to your dashboard, click on the 'Packages' tab, select your plan, and complete checkout. Features are activated instantly.",
        },
        {
          id: "sub-3",
          question: "Can I cancel my package at any time?",
          answer:
            "Yes, you can cancel your package from your account settings. You will retain access to plan features until the end of your billing cycle.",
        },
      ],
    },

    {
      id: "technical",
      title: "Technical Issues",
      icon: BadgeAlert,
      articles: [
        {
          id: "tech-1",
          question: "Why is my social connection sync failing?",
          answer:
            "Make sure you authenticate using the correct profile credentials. If problems persist, clear your browser cookies or disconnect and reconnect the platform.",
        },
        {
          id: "tech-2",
          question: "How do I report a bug on the platform?",
          answer:
            "Go to the Contact page and submit an inquiry with subject 'Bug Report'. Provide details and screenshots of the issue.",
        },
      ],
    },
  ];

  const handleToggle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-accent/10 opacity-20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO SEARCH SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Help Center
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground">
            How can we{" "}
            <span className="text-gradient-sunset">help you</span> today?
          </h1>

          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              type="text"
              placeholder="Search help articles..."
              className="pl-11 rounded-full h-11 border-border bg-card/60 backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ARTICLES ACCORDION */}
        <div className="space-y-8">
          {categories.map((cat) => {
            const filteredArticles = cat.articles.filter(
              (art) =>
                art.question
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                art.answer
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );

            if (filteredArticles.length === 0) return null;

            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                className="rounded-3xl border border-border bg-card/50 p-6 space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground">
                    {cat.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {filteredArticles.map((art) => {
                    const isExpanded = expandedArticle === art.id;

                    return (
                      <div
                        key={art.id}
                        className="rounded-2xl border border-border/40 bg-background/40 overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => handleToggle(art.id)}
                          className="flex w-full items-center justify-between p-4 text-left font-medium text-xs text-foreground hover:bg-secondary/40"
                        >
                          <span>{art.question}</span>

                          {isExpanded ? (
                            <Minus className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <Plus className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-border/40 bg-secondary/10 text-xs text-muted-foreground leading-relaxed">
                            {art.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Help;