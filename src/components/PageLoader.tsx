/** Suspense fallback for a lazy-loaded route chunk — brief and on-brand instead of a blank flash. */
export default function PageLoader() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-background">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-navy/15 border-t-brand-orange dark:border-white/15" />
    </div>
  );
}
