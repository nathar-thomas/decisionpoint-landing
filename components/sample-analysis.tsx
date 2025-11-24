'use client'

import { CheckCircle, AlertTriangle, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"

interface SampleAnalysisProps {
  isProcessing?: boolean
  isComplete?: boolean
  uploadProgress?: number
}

interface AnimatedNumberProps {
  value: number
  prefix?: string
  suffix?: string
  className?: string
  duration?: number
}

function AnimatedNumber({ value, prefix = "", suffix = "", className = "", duration = 1000 }: AnimatedNumberProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (value > 0 && !hasAnimated) {
      setHasAnimated(true)
      const startTime = Date.now()
      const startValue = 0
      const endValue = value

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease-out animation
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = startValue + (endValue - startValue) * easeOut
        
        setCurrentValue(current)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCurrentValue(endValue) // Ensure exact final value
        }
      }
      
      requestAnimationFrame(animate)
    }
    // Reset animation when value goes back to 0
    if (value === 0) {
      setHasAnimated(false)
      setCurrentValue(0)
    }
  }, [value, duration, hasAnimated])

  const formatNumber = (num: number) => {
    if (prefix === "$" && num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (prefix === "$" && num >= 1000) {
      return (num / 1000).toFixed(0) + "K"
    } else if (suffix === "%") {
      return num.toFixed(1)
    }
    return Math.round(num).toLocaleString()
  }

  return (
    <span className={className}>
      {prefix}{formatNumber(currentValue)}{suffix}
    </span>
  )
}

export default function SampleAnalysis({ isProcessing = false, isComplete = false, uploadProgress = 0 }: SampleAnalysisProps) {
  const [showInsights, setShowInsights] = useState({
    collectionRate: false,
    marginOpportunity: false,
    retention: false
  })

  // Show insights progressively as metrics complete
  useEffect(() => {
    if (isComplete) {
      // Collection rate insight after margin is calculated
      const timer1 = setTimeout(() => {
        setShowInsights(prev => ({ ...prev, collectionRate: true }))
      }, 3000)

      // Margin opportunity after EBITDA improvement calculation
      const timer2 = setTimeout(() => {
        setShowInsights(prev => ({ ...prev, marginOpportunity: true }))
      }, 3500)

      // Retention after all other metrics
      const timer3 = setTimeout(() => {
        setShowInsights(prev => ({ ...prev, retention: true }))
      }, 4000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    } else {
      // Reset insights when starting over
      setShowInsights({
        collectionRate: false,
        marginOpportunity: false,
        retention: false
      })
    }
  }, [isComplete])
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {isComplete ? "Bright Smiles Dental Group - Sample Analysis" : 
           isProcessing ? "Practice Analysis - Processing..." :
           "Practice Analysis - Ready"}
        </h3>
        <p className="text-sm text-gray-600">
          {isProcessing ? "Extracting financial data from tax returns..." : 
           isComplete ? "See what Pendl extracts from real practice data" :
           "📊 Drop tax returns to see instant practice intelligence"}
        </p>
        
        {/* Progress bar under header when processing */}
        {isProcessing && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Processing: {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Financials</h4>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Revenue (2023)</span>
                <span className="font-medium">
                  {isComplete ? (
                    <AnimatedNumber value={2371000} prefix="$" className="font-medium" />
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">EBITDA</span>
                <span className="font-medium text-green-600">
                  {isComplete ? (
                    <AnimatedNumber value={321000} prefix="$" className="font-medium text-green-600" duration={1500} />
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">EBITDA Margin</span>
                <span className="font-medium">
                  {isComplete ? (
                    <AnimatedNumber value={13.5} suffix="%" className="font-medium" duration={2000} />
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Implied Valuation</span>
                <span className="font-medium text-blue-600">
                  {isComplete ? (
                    <AnimatedNumber value={2407500} prefix="$" className="font-medium text-blue-600" duration={2500} />
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Operational Insights</h4>
            <div className="space-y-3 min-h-[120px]">
              {showInsights.collectionRate && (
                <div className="flex items-start gap-2 transition-all duration-500 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards]">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Collection Rate Issue</p>
                    <p className="text-sm text-gray-600">
                      <AnimatedNumber value={73} suffix="%" duration={1000} /> vs 95% industry average
                    </p>
                  </div>
                </div>
              )}
              
              {showInsights.marginOpportunity && (
                <div className="flex items-start gap-2 transition-all duration-500 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards]">
                  <TrendingDown className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Margin Opportunity</p>
                    <p className="text-sm text-gray-600">
                      $<AnimatedNumber value={180} duration={1000} />K potential EBITDA improvement
                    </p>
                  </div>
                </div>
              )}
              
              {showInsights.retention && (
                <div className="flex items-start gap-2 transition-all duration-500 opacity-0 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards]">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Strong Retention</p>
                    <p className="text-sm text-gray-600">
                      <AnimatedNumber value={82} suffix="%" duration={1000} /> patient retention rate
                    </p>
                  </div>
                </div>
              )}
              
              {!isComplete && !isProcessing && (
                <div className="flex items-center justify-center h-full py-8">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">📊 Ready for analysis</div>
                    <div className="text-sm text-gray-500">Drop tax returns to see instant insights</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isComplete && (
          <div className="border-t pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Try with your own practice
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors">
              Download sample report (PDF)
            </button>
          </div>
        )}

      </div>
    </div>
  )
}