import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BusinessProspectusProps {
  className?: string
}

export function BusinessProspectus({ className }: BusinessProspectusProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-xl border bg-background shadow-lg ${className}`}>
      {/* Broker Identity Bar */}
      <div className="bg-gray-50 border-b p-4 flex items-center justify-between">
        <div>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sunwest%20Advisors%201-6QNCBDFLqbW7vlmJ2NWjmE8nCHVRI9.png"
            alt="Sunwest Advisors"
            className="h-10 w-auto"
          />
        </div>

        <div>
          <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Confidential Banner */}
      <div className="bg-yellow-50 py-2 px-4 border-b text-center">
        <div className="font-medium text-sm">Business Prospectus — Confidential</div>
      </div>

      {/* Main Content - Scrollable if needed */}
      <div className="max-h-[calc(100%-7rem)] overflow-y-auto">
        {/* Business Identity Card */}
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="flex-shrink-0 w-36">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BLT-Hires-DDTQVbiYFWdZQJX8NsjH1LH0Ju6SED.png"
                alt="Boat Lift Technicians"
                className="w-full h-auto"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold mb-4">Boat Lift Technicians</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Business Type</p>
                  <p className="font-medium">Marine Construction</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">Phoenix, AZ</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Years in Operation</p>
                  <p className="font-medium">25</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner Involvement</p>
                  <p className="font-medium">Owner-Operated</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold mb-4">Financial Highlights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Annual Revenue (2024)</p>
              <p className="text-xl font-bold text-primary">$1,245,000</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">EBITDA (2024)</p>
              <p className="text-xl font-bold text-primary">$320,000</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Asking Price</p>
              <p className="text-xl font-bold text-primary">$2,800,000</p>
            </div>
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Growth Opportunities</h3>
          <ul className="list-disc pl-5 text-muted-foreground space-y-2">
            <li>Expansion to neighboring states</li>
            <li>Service contract opportunities</li>
            <li>New product line introduction</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
