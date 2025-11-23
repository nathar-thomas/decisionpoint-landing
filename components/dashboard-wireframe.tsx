import React from 'react';

export function DashboardWireframe() {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Dashboard Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Practice Overview</h1>
          <p className="text-sm text-gray-600">Bright Smiles Dental Group</p>
        </div>
        
        {/* Add Button - Top Right */}
        <button className="group relative bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 shadow-md transition-all duration-200 hover:scale-105">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Add Documents
          </span>
        </button>
      </div>

      {/* Dashboard Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Key Metrics */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Revenue</div>
          <div className="text-2xl font-bold text-gray-900">$2.37M</div>
          <div className="text-xs text-gray-500 mt-1">Last 12 months</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">EBITDA</div>
          <div className="text-2xl font-bold text-gray-900">$321K</div>
          <div className="text-xs text-gray-500 mt-1">13.5% margin</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Practice Value</div>
          <div className="text-2xl font-bold text-gray-900">$2.4M</div>
          <div className="text-xs text-gray-500 mt-1">7.5x multiple</div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Collections Rate</div>
          <div className="text-2xl font-bold text-orange-600">73%</div>
          <div className="text-xs text-red-600 mt-1">Below industry avg</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Trends */}
        <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Financial Trends</h3>
          <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            [Chart Placeholder]
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
              <div className="text-sm text-gray-700">Collection rate 22% below industry standard</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
              <div className="text-sm text-gray-700">EBITDA margin opportunity: $180K</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <div className="text-sm text-gray-700">Strong patient retention at 82%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-6 pb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Ready to generate full analysis?</h3>
              <p className="text-sm text-blue-700 mt-1">Create a professional valuation package in minutes</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Generate Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}