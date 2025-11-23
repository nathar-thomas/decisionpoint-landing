import { DashboardWireframe } from '@/components/dashboard-wireframe';

export default function WireframePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Wireframe</h1>
          <p className="text-gray-600">Low-fidelity wireframe with Add button in top-right</p>
        </div>
        
        <DashboardWireframe />
        
        <div className="mt-8 max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Animation Concept</h2>
          <ol className="text-left text-gray-700 space-y-2">
            <li>1. User scrolls → zoom animation centers on pulsing Add button</li>
            <li>2. Click Add → zoom out + show upload modal</li>
            <li>3. Upload 3 tax PDFs with staggered progress bars</li>
            <li>4. Modal closes → dashboard animates with new data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}