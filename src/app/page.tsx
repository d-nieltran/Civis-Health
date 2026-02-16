import {
  Shield,
  Heart,
  FileText,
  ArrowRight,
  Building2,
} from "lucide-react";
import EligibilityForm from "@/components/EligibilityForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-navy-900 border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold text-white tracking-tight">
              Civis Health
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-navy-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#calculator"
              className="text-sm text-navy-300 hover:text-white transition-colors"
            >
              Check Eligibility
            </a>
            <a
              href="#calculator"
              className="text-sm bg-accent hover:bg-accent-500 text-navy-900 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-navy-900 pt-20 pb-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-navy-800 text-accent-300 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <Heart className="w-4 h-4" />
            Free &amp; Non-Profit
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Financial Assistance
            <br />
            <span className="text-accent">Within Your Reach</span>
          </h1>
          <p className="mt-6 text-lg text-navy-300 max-w-2xl mx-auto leading-relaxed">
            Civis Health helps patients find hospital financial assistance
            programs and prepare applications at no cost. You may qualify for
            reduced or forgiven medical bills.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#calculator"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-500 text-navy-900 font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
            >
              Check Your Eligibility
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-navy-300 hover:text-white font-medium transition-colors"
            >
              Learn how it works
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-navy-800 border-t border-navy-700">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-accent">100%</p>
            <p className="text-sm text-navy-400 mt-1">Free to use, always</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">$0</p>
            <p className="text-sm text-navy-400 mt-1">
              No hidden fees or upsells
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">Private</p>
            <p className="text-sm text-navy-400 mt-1">
              Your data stays on your device
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy-900">How It Works</h2>
            <p className="mt-3 text-navy-500 max-w-xl mx-auto">
              Three simple steps to see if you qualify for hospital financial
              assistance and generate your application.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "1. Select a Hospital",
                description:
                  "Choose from our database of hospitals with known financial assistance programs.",
              },
              {
                icon: FileText,
                title: "2. Enter Your Information",
                description:
                  "Provide basic household income and size — we compare it to Federal Poverty Level guidelines.",
              },
              {
                icon: Shield,
                title: "3. Get Your Application",
                description:
                  "If you qualify, we generate a pre-filled PDF application you can submit directly to the hospital.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="text-center p-8 rounded-2xl border border-navy-100 hover:border-accent-200 hover:shadow-md transition-all"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-900 rounded-xl mb-5">
                  <step.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-navy-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility Calculator */}
      <EligibilityForm />

      {/* Footer */}
      <footer className="bg-navy-900 border-t border-navy-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-lg font-bold text-white">
                Civis Health
              </span>
            </div>
            <p className="text-sm text-navy-400">
              A non-profit project. Not a substitute for professional legal or
              financial advice.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-navy-800 text-center">
            <p className="text-xs text-navy-500">
              &copy; {new Date().getFullYear()} Civis Health. Open source and
              free forever.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
