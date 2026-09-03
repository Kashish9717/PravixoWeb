import { useState } from "react";
import {
  Sparkles,
  Check,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { toast } from "sonner";

export function Careers() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: "",
    portfolio: "",
    message: "",
  });

  const [selectedJob, setSelectedJob] = useState(null);

  const jobs = [
    {
      title: "Frontend Developer",
      exp: "3+ Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹12,00,000 - ₹18,00,000 / year",
    },
    {
      title: "Backend Developer",
      exp: "4+ Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹14,00,000 - ₹22,00,000 / year",
    },
    {
      title: "MERN Stack Developer",
      exp: "2+ Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹8,00,000 - ₹14,00,000 / year",
    },
    {
      title: "Flutter Developer",
      exp: "3+ Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹10,00,000 - ₹16,00,000 / year",
    },
    {
      title: "UI/UX Designer",
      exp: "2+ Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹7,00,000 - ₹12,00,000 / year",
    },
    {
      title: "Marketing Executive",
      exp: "1-3 Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹5,00,000 - ₹8,00,000 / year",
    },
    {
      title: "Customer Support Specialist",
      exp: "1+ Years",
      loc: "Remote (India)",
      type: "Full-Time",
      salary: "₹4,00,000 - ₹6,00,000 / year",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.resume) {
      toast.error(
        "Please fill in all required fields and provide a resume link."
      );
      return;
    }

    toast.success(
      "Application submitted successfully! Our recruiting team will review it and get back to you soon."
    );

    setFormData({
      name: "",
      email: "",
      phone: "",
      resume: "",
      portfolio: "",
      message: "",
    });

    setSelectedJob(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-12">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-20 right-1/4 h-80 w-80 rounded-full bg-primary/10 opacity-30 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 h-72 w-72 rounded-full bg-accent/10 opacity-40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Careers
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Join the Future of{" "}
            <span className="text-gradient-sunset">
              Creator Economy
            </span>
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            At Pravixo, we are building the operational stack for influencer
            collaborations. If you are passionate about automation, fintech,
            clean UX, and scaling marketplaces, we'd love to have you.
          </p>
        </div>

        {/* WHY JOIN & BENEFITS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Why Join Pravixo?
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              We are a remote-first, high-trust engineering and product team.
              We value continuous delivery, clean code, autonomy, and quick
              feedback cycles. We avoid bureaucratic overhead and empower each
              team member to make architectural decisions.
            </p>

            <div className="space-y-4">

              <div className="flex gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                  <Check className="h-3 w-3" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Remote Friendly
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Work from anywhere in India with flexible hours and
                    synchronous overlap.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                  <Check className="h-3 w-3" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Continuous Learning
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Annual learning budget for courses, conferences, and books.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary mt-0.5">
                  <Check className="h-3 w-3" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Premium Equipment
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We provide matching funds for high-end laptops,
                    mechanical keyboards, and displays.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-md space-y-6">
            <h3 className="font-display text-lg font-bold text-foreground">
              Our Shared Benefits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="p-4 rounded-xl bg-secondary/35 border border-border/50">
                <span className="block text-xs font-semibold text-foreground">
                  Health & Wellness
                </span>
                <span className="block text-[11px] text-muted-foreground mt-1">
                  Comprehensive medical insurance cover for you and your
                  dependents.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-secondary/35 border border-border/50">
                <span className="block text-xs font-semibold text-foreground">
                  Flexible Leaves
                </span>
                <span className="block text-[11px] text-muted-foreground mt-1">
                  24 days of paid leaves plus national holidays and wellness
                  days off.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-secondary/35 border border-border/50">
                <span className="block text-xs font-semibold text-foreground">
                  Equity/ESOPs
                </span>
                <span className="block text-[11px] text-muted-foreground mt-1">
                  High equity stakes for early employees to grow with the
                  platform.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-secondary/35 border border-border/50">
                <span className="block text-xs font-semibold text-foreground">
                  Home Office Setup
                </span>
                <span className="block text-[11px] text-muted-foreground mt-1">
                  A one-time stipend to buy chairs, desks, or improve
                  connectivity.
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* CURRENT OPEN POSITIONS */}
        <div className="space-y-6">

          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Current Open Positions
            </h2>

            <p className="text-sm text-muted-foreground">
              Select an open position to apply directly online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {jobs.map((job, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all duration-200"
              >
                <div className="space-y-2">

                  <h4 className="font-display text-base font-bold text-foreground">
                    {job.title}
                  </h4>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">

                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      {job.type}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {job.loc}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {job.exp}
                    </span>

                  </div>

                  {job.salary && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-1">
                      <IndianRupee className="h-3 w-3" />
                      {job.salary}
                    </span>
                  )}

                </div>

                <Button
                  size="sm"
                  className="rounded-full self-start"
                  onClick={() => {
                    setSelectedJob(job.title);

                    const el = document.getElementById(
                      "apply-form-section"
                    );

                    if (el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Apply Now
                </Button>
              </div>
            ))}

          </div>
        </div>

        {/* APPLICATION FORM */}
        <div
          id="apply-form-section"
          className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-8 space-y-6"
        >

          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Submit Your Application{" "}
              {selectedJob && (
                <span className="text-primary">
                  for {selectedJob}
                </span>
              )}
            </h3>

            <p className="text-xs text-muted-foreground mt-1">
              Please provide your professional credentials and references.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name *
                </label>

                <Input
                  required
                  placeholder="e.g. Kushal"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address *
                </label>

                <Input
                  required
                  type="email"
                  placeholder="e.g. contact@pravixo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Phone Number
                </label>

                <Input
                  placeholder="e.g. +91 99999 99999"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Resume/CV URL *
                </label>

                <Input
                  required
                  placeholder="Link to GDrive, Dropbox, or PDF"
                  value={formData.resume}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resume: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Portfolio/GitHub URL
              </label>

              <Input
                placeholder="Link to work examples or public code profiles"
                value={formData.portfolio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    portfolio: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Cover Message
              </label>

              <Textarea
                placeholder="Briefly explain what excites you about working at Pravixo..."
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-full gradient-sunset border-0 text-white shadow-glow"
            >
              Submit Application
              <Send className="ml-2 h-4 w-4" />
            </Button>

          </form>
        </div>

      </div>
    </div>
  );
}

export default Careers;