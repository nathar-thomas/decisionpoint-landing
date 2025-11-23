import { CheckCircle, Clock, AlertTriangle, TrendingDown, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/pendl-logo-header.png"
              alt="Pendl Logo"
              className="h-10 w-auto object-contain"
              style={{height: '38.4px'}}
            />
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
        <section className="w-full py-16 md:py-24 lg:py-32 relative overflow-hidden" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">

            {/* Main Headline */}
            <div className="text-center space-y-4 mb-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Your Market Knowledge
                <br />
                <span className="text-gray-900">+ Our Data Science</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-medium">
                10x your practice throughput without 10x the work.
              </p>
            </div>

            {/* Practice Analytics Demo */}
            <div className="relative w-full mx-auto" style={{marginTop: '0px'}}>
              {/* Dental Practice Background */}
              <div className="relative">
                <img 
                  src="/dental-practice.png" 
                  alt="Modern dental practice" 
                  className="w-full h-auto rounded-2xl"
                />
                
                {/* Floating Dashboard Cards - Clustered around building */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Practice Valuation Card - Center/Top (above building roof) */}
                  <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 animate-float-3 z-10 scale-125">
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-5 shadow-xl w-[280px]">
                      <div className="text-sm text-gray-500 mb-1">Practice Valuation</div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">$2.4M</div>
                      <div className="text-sm text-gray-600">Based on $321K EBITDA</div>
                      <div className="text-sm text-green-600 font-semibold mt-1">↑ 12% YoY</div>
                    </div>
                  </div>

                  {/* Monthly Cashflow Card - Left Top */}
                  <div className="absolute top-[15%] left-[20%] transform -translate-x-1/2 animate-float-1">
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg w-[180px]">
                      <div className="text-xs text-gray-500 mb-1">Monthly Cashflow</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-gray-900">$26.8k</div>
                        <span className="text-green-600 text-sm font-semibold">↑ 8%</span>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">Owner Take-Home</div>
                    </div>
                  </div>

                  {/* EBITDA Margin Card - Left Bottom */}
                  <div className="absolute top-[45%] left-[15%] transform -translate-x-1/2 animate-float-2">
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg w-[200px]">
                      <div className="text-xs text-gray-500 mb-1">EBITDA Margin</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-gray-900">13.55%</div>
                        <span className="text-red-600 text-sm font-semibold">↓ 46%</span>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">Industry avg: 25-35%</div>
                    </div>
                  </div>

                  {/* Patient Retention Card - Right Top */}
                  <div className="absolute top-[15%] right-[20%] transform translate-x-1/2 animate-float-4">
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg w-[180px]">
                      <div className="text-xs text-gray-500 mb-1">Patient Retention</div>
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-gray-900">82%</div>
                        <span className="text-green-600 text-sm font-semibold">↑ 2%</span>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">Industry Avg: 80%</div>
                    </div>
                  </div>

                  {/* Collection Rate Card - Right Bottom */}
                  <div className="absolute top-[50%] right-[10%] transform translate-x-1/2 animate-float-5">
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-lg w-[200px]">
                      <div className="text-xs text-gray-500 mb-1">Collection Rate</div>
                      <div className="text-xl font-bold text-orange-600">73%</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-orange-600 flex items-center gap-1">
                          ⚠
                        </span>
                        <span className="text-gray-500">Industry Avg: 95%</span>
                      </div>
                      <div className="text-xs text-orange-600 mt-1">180K Annual Opportunity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40 relative" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Practice intelligence that amplifies your expertise
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Focus on relationships and deal-making while we handle the manual data work
            </p>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">See the transformation in action</h3>
              <p className="text-lg text-gray-600">Drop tax returns and watch intelligence emerge instantly</p>
            </div>
            
            {/* Interactive Demo */}
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Drop Zone */}
                <div className="text-center">
                  <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-gray-700">Drop tax returns here</p>
                    <p className="text-sm text-gray-500 mt-2">PDF files from 2021-2023</p>
                  </div>
                </div>

                {/* Arrow/Processing */}
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <p className="text-sm text-gray-600 mt-2">2-3 seconds</p>
                </div>

                {/* Results */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">EBITDA Extracted</span>
                      <span className="text-2xl font-bold text-gray-900">$321K ✓</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Practice Value</span>
                      <span className="text-2xl font-bold text-gray-900">$2.4M</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-sm text-red-600 mb-2">🚨 Red Flag: 73% collection rate</div>
                      <div className="text-sm text-green-600">💡 Opportunity: $180K revenue recovery</div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">5.5 hours saved</p>
                        <p className="text-sm text-gray-500">vs. manual analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Before/After Timeline */}
        <section className="w-full py-12 md:py-24 lg:py-32 border-b border-border/40" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
          <div className="container px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">The time you'll get back</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Before */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Clock className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Before: 4-6 hours</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Manual P&L extraction</p>
                        <p className="text-sm text-gray-600">90 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">EBITDA calculations</p>
                        <p className="text-sm text-gray-600">60 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Practice analysis</p>
                        <p className="text-sm text-gray-600">90 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Package formatting</p>
                        <p className="text-sm text-gray-600">60 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* After */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">After: 30 minutes</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Upload documents</p>
                        <p className="text-sm text-gray-600">2 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Review extractions</p>
                        <p className="text-sm text-gray-600">15 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Add broker insights</p>
                        <p className="text-sm text-gray-600">10 minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">Export package</p>
                        <p className="text-sm text-gray-600">3 minutes</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-center text-lg font-bold text-green-700">
                      8-12x faster
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="w-full py-12 md:py-16 border-b border-border/40" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900">$321K</p>
                  <p className="text-sm text-gray-600 mt-1">EBITDA verified</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">8-12x</p>
                  <p className="text-sm text-gray-600 mt-1">Faster process</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-600 mt-1">Broker-controlled</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">30min</p>
                  <p className="text-sm text-gray-600 mt-1">To package</p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* CTA Section with Demo */}
        <section className="w-full py-12 md:py-24 lg:py-32" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight mb-4">
                See your first practice analysis in 30 minutes
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                No sales calls. No demos. Just results.
              </p>
            </div>
            
            {/* Sample Demo Display */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bright Smiles Dental Group - Sample Analysis</h3>
                <p className="text-sm text-gray-600">See what Pendl extracts from real practice data</p>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Key Financials</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Revenue (2023)</span>
                        <span className="font-medium">$2,371,000</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">EBITDA</span>
                        <span className="font-medium text-green-600">$321,000</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">EBITDA Margin</span>
                        <span className="font-medium">13.5%</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Implied Valuation</span>
                        <span className="font-medium text-blue-600">$2,407,500</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Operational Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Collection Rate Issue</p>
                          <p className="text-sm text-gray-600">73% vs 95% industry average</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingDown className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Margin Opportunity</p>
                          <p className="text-sm text-gray-600">$180K potential EBITDA improvement</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Strong Retention</p>
                          <p className="text-sm text-gray-600">82% patient retention rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Try with your own practice
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
                    Download sample report (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t border-border/40" style={{backgroundColor: 'rgba(254, 253, 248, 1)'}}>
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:justify-between md:py-12 px-4 md:px-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <img
                src="/pendl-logo-header.png"
                alt="Pendl Logo"
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">Practice intelligence for dental brokers.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Contact</p>
            <a href="mailto:hi@pendl.io" className="text-muted-foreground hover:underline">
              hi@pendl.io
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
