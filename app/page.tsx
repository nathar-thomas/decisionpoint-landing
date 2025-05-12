import { Briefcase, CheckCircle, FileText, BarChart3 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WaitlistForm } from "@/components/waitlist-form"
import { BusinessProspectus } from "@/components/business-prospectus"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/40 bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl font-semibold">DecisionPoint</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </a>
            <a href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Fewer follow-ups. Faster deals.
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  DecisionPoint helps business brokers simplify seller onboarding, organize documents, and get to
                  closing day with less chaos.
                </p>
              </div>
              <WaitlistForm />
            </div>
          </div>

          {/* Screenshot with gradient overlay */}
          <div className="relative mt-16 w-full max-w-5xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zfNkZgVScccmOrokdiNz7gB2DQIWlb.png"
                alt="DecisionPoint dashboard showing business details, tasks, and document management"
                className="w-full h-auto"
              />
            </div>
            {/* Gradient overlay that fades into the next section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background"></div>
          </div>
        </section>

        {/* Mockup Section 1 */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40 relative">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Document Management</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Stay on Track Without the Back-and-Forth
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tired of chasing sellers for tax returns or explaining P&Ls over email? DecisionPoint gives you a
                  shared workspace where tasks are clear, files are in one place, and sellers know what's next.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border bg-background p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Seller Task Checklist</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Upload last 3 years of tax returns</p>
                        <p className="text-sm text-muted-foreground">Completed on May 2, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full border-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Provide monthly P&L statements</p>
                        <p className="text-sm text-muted-foreground">Due by May 15, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full border-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Complete business questionnaire</p>
                        <p className="text-sm text-muted-foreground">Due by May 20, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mockup Section 2 */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex justify-center order-last lg:order-first">
                <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border bg-background p-6 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Financial Analysis View</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Revenue</span>
                        <span className="text-sm font-medium">$1,245,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 w-[85%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">EBITDA</span>
                        <span className="text-sm font-medium">$320,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 w-[65%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cash Flow</span>
                        <span className="text-sm font-medium">$275,000</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 w-[55%] rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Data Organization</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Win Over Buyers with Organized Data
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Good buyers move fast — when your documents are clean. DecisionPoint helps you collect and structure
                  seller info so buyers can evaluate and act without delays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prospectus Building Section - UPDATED */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Prospectus Builder</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Create Professional Prospectuses in Minutes
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Stop spending days formatting documents and spreadsheets. DecisionPoint automatically generates
                  polished, broker-branded prospectuses from your seller's data — ready to share with qualified buyers.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Consistent, professional formatting every time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Customizable templates for different industries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Broker branding built-in: your logo and firm details included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>One-click export to PDF or secure sharing link</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <BusinessProspectus className="w-full max-w-[500px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Purpose-Built Section - UPDATED */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Broker-First</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Built for Brokers, Not Startups
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We're not here to automate you out of the deal. DecisionPoint is purpose-built for brokers who manage
                  real people, real businesses, and real outcomes — not tech-driven founders trying to skip the middle.
                </p>
              </div>
              <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
                <div className="grid gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Assign With Ease</h3>
                  <p className="text-sm text-muted-foreground">
                    Start sellers with task lists tailored by industry or deal type — so you don't have to build from
                    scratch.
                  </p>
                </div>
                <div className="grid gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">All Docs, One Place</h3>
                  <p className="text-sm text-muted-foreground">
                    Collect financial, legal, HR docs in one system — structured for buyers, organized for you.
                  </p>
                </div>
                <div className="grid gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Preview Deal Materials</h3>
                  <p className="text-sm text-muted-foreground">
                    See a polished, pre-built prospectus view anytime — no formatting headaches.
                  </p>
                </div>
                <div className="grid gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted mx-auto">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">Stay Ready, Stay Responsive</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep everything up to date and buyer-ready — without extra tools or new logins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section - UPDATED */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">
                  If you can't find the answer to your question below, email us at hello@decisionpoint.com
                </p>
              </div>

              <div className="mx-auto w-full max-w-3xl mt-8">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">Is this built to replace brokers?</AccordionTrigger>
                    <AccordionContent className="text-left">
                      No — DecisionPoint is designed to support brokers by simplifying document collection, business
                      analysis, and prospectus creation. You stay in control of the deal.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">
                      Do sellers or third parties use the platform directly?
                    </AccordionTrigger>
                    <AccordionContent className="text-left">
                      Not in the MVP. Brokers manage all uploads and inputs. Seller portals and contributor access are
                      part of our future roadmap.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">What types of documents can I upload?</AccordionTrigger>
                    <AccordionContent className="text-left">
                      PDFs, CSVs, Excel, JPGs, and PNGs — covering financials, legal, HR, and more. You can assign files
                      to tasks and categories.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">
                      Can I update or replace files after uploading?
                    </AccordionTrigger>
                    <AccordionContent className="text-left">
                      Yes — you can upload new versions, delete files, or add more as needed. It's a flexible,
                      broker-led system.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">How does the system analyze the business?</AccordionTrigger>
                    <AccordionContent className="text-left">
                      We extract key financial data from your uploaded documents (like P&Ls or bank statements) and
                      display it in a structured, editable table.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left">
                      What if the extracted data isn't accurate?
                    </AccordionTrigger>
                    <AccordionContent className="text-left">
                      You can edit any values directly. Think of the system as a starting point — you're always in
                      control of the final numbers.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-left">What's included in the prospectus view?</AccordionTrigger>
                    <AccordionContent className="text-left">
                      A clean, print-friendly summary of the business — including key details, task responses, uploaded
                      documents, and financial highlights — all auto-generated from the inputs you've provided. The
                      prospectus is branded with your firm's logo and identity, so everything you share looks
                      professional and ready for buyers or lenders.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger className="text-left">How much does it cost to try?</AccordionTrigger>
                    <AccordionContent className="text-left">
                      Early access is free while we gather feedback. You'll help shape the platform and get first access
                      to new features as they're released.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Let's make deal prep the easy part.
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                We're building DecisionPoint for brokers like you. Join early, shape the product, and close with
                confidence.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <WaitlistForm />
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-border/40 bg-background">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between md:py-12 px-4 md:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <span className="text-lg font-semibold">DecisionPoint</span>
            </div>
            <p className="text-sm text-muted-foreground">Simplifying M&A for business brokers and advisors.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Contact</p>
            <a href="mailto:hello@decisionpoint.com" className="text-muted-foreground hover:underline">
              hello@decisionpoint.com
            </a>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Follow Us</p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Legal</p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border/40">
          <div className="container flex h-16 items-center px-4 md:px-6">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} DecisionPoint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
