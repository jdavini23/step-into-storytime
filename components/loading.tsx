export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex items-center justify-center">
      <div className="text-center">
        <div
          className="inline-block h-16 w-16 animate-bounce rounded-full bg-violet-500 motion-reduce:animate-none"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4 text-lg text-slate-600">Loading your magical experience...</p>
      </div>
    </div>
  )
}
