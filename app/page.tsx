import { Briefcase, CheckCircle, FileText, BarChart3 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { WaitlistForm } from "@/components/waitlist-form"
import { BusinessProspectus } from "@/components/business-prospectus"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold">Pendl</span>
            </div>
          </Link>
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
        <section className="w-full py-16 md:py-24 lg:py-32 relative bg-white">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            {/* Main heading and value prop */}
            <div className="text-center space-y-6 mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Practice intelligence that sells deals.
              </h1>
              
              {/* Before/After Transformation */}
              <div className="mt-12 mb-8">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* BEFORE */}
                  <div className="space-y-4">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-600 uppercase tracking-wide mb-4">BEFORE</h3>
                      <div className="pendl-card-before hover:shadow-md">
                        {/* File stack visualization */}
                        <div className="flex items-start gap-4">
                          <div className="pendl-file-stack">
                            <div className="w-10 h-12 bg-gray-300 rounded-sm transform rotate-6 absolute shadow-sm"></div>
                            <div className="w-10 h-12 bg-gray-400 rounded-sm transform rotate-12 absolute left-1 shadow-sm"></div>
                            <div className="w-10 h-12 bg-gray-500 rounded-sm transform rotate-[18deg] absolute left-2 shadow-sm"></div>
                            <div className="w-10 h-12 bg-gray-600 rounded-sm relative left-3 shadow-sm"></div>
                          </div>
                          <div className="flex-1 pt-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-orange-500">📊</span>
                                <span className="font-medium">Manual Analysis</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-red-500">📋</span>
                                <span className="font-medium">4-6 Hours</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-yellow-500">🤔</span>
                                <span className="font-medium">Guesswork</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <span className="text-red-600">😰</span>
                                <span className="font-medium">Miss Opportunities</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AFTER */}
                  <div className="space-y-4">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-blue-600 uppercase tracking-wide mb-4">AFTER</h3>
                      <div className="pendl-card-after hover:shadow-lg">
                        {/* Success visualization */}
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg pulse-subtle">
                            <span className="text-white text-2xl">⚡</span>
                          </div>
                          <div className="flex-1 pt-2">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-blue-800">
                                <span className="text-green-500">⚡</span>
                                <span className="font-semibold">30 Minutes</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-800">
                                <span className="text-blue-500">🎯</span>
                                <span className="font-semibold">AI-Powered</span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-800">
                                <span className="text-purple-500">💡</span>
                                <span className="font-semibold">Intelligence</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Success indicators */}
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-green-100 rounded-full opacity-30"></div>
                        <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-green-200 rounded-full opacity-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Transformation message */}
                <div className="mt-8 text-center">
                  <p className="text-lg font-medium text-gray-600 italic">
                    "From number-cruncher to strategic advisor"
                  </p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 py-8 border-t border-gray-100">
              <div className="pendl-trust-indicator">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🔒</span>
                </div>
                <span className="font-medium">Bank-Level Security</span>
              </div>
              <div className="pendl-trust-indicator">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">⚡</span>
                </div>
                <span className="font-medium">30-Min Analysis</span>
              </div>
              <div className="pendl-trust-indicator">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">🎯</span>
                </div>
                <span className="font-medium">Industry Data</span>
              </div>
            </div>
          </div>
        </section>

        {/* Mockup Section 1 */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40 relative">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Automated EBITDA</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  From Tax Returns to EBITDA in Minutes
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Upload dental practice tax returns and get automated EBITDA extraction with normalized adjustments. 
                  No more manual P&L calculations or Excel gymnastics to prepare practice packages.
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
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Practice Intelligence</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Operational Insights That Close Deals
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Beyond EBITDA: Get automated analysis of growth opportunities, operational red flags, and buyer-focused 
                  intelligence that helps dental practices sell faster and for better multiples.
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
                  Built for Dental Practice Brokers
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Pendl understands dental practices aren't just businesses - they're specialized operations with unique metrics, 
                  buyer criteria, and valuation methods. We speak your language, not generic business broker-speak.
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
                  If you can't find the answer to your question below, email us at hello@decisionpnt.com
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
                      At this stage, only brokers can upload documents and enter information. We plan to introduce
                      seller portals and shared access features in a future update.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">How does the system analyze the business?</AccordionTrigger>
                    <AccordionContent className="text-left">
                      We extract key financial data from your uploaded documents (like P&Ls or bank statements) and
                      display it in a structured, editable table.
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
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DecisionBlack%402x-Pj9QeOjaevD1Oy4UNwlwtYEXNVovUU.png"
                alt="DecisionPoint Logo"
                className="h-6 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">Simplifying M&A for business brokers and advisors.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Contact</p>
            <a href="mailto:hello@decisionpnt.com" className="text-muted-foreground hover:underline">
              hello@decisionpnt.com
            </a>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Follow Us</p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/decisionpoint-os/"
                className="text-muted-foreground hover:text-foreground"
              >
                LinkedIn
              </a>
              <a href="https://www.instagram.com/decisionpnt/" className="text-muted-foreground hover:text-foreground">
                Instagram
              </a>
              <a href="https://www.facebook.com/decisionpnt/" className="text-muted-foreground hover:text-foreground">
                Facebook
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
