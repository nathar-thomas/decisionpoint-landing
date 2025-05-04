import { FileUploader } from "@/components/file-uploader"
import { DebugDatabase } from "@/components/debug-database"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Cash Flow Analysis</h1>
          <p className="text-muted-foreground md:text-xl">Upload your financial data to analyze your cash flow</p>
        </div>
        <FileUploader />
        <DebugDatabase />
      </div>
    </main>
  )
}
