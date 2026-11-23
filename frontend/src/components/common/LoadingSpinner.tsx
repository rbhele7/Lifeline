export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className || ''}`}>
      <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-gray-500 font-medium">Loading...</p>
    </div>
  );
}
