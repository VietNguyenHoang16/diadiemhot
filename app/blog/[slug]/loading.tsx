export default function BlogPostLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-xl px-4 pb-16 pt-24 sm:px-6 md:px-8 lg:pt-28">
        <div className="space-y-6">
          <div className="h-4 w-56 animate-pulse rounded bg-slate-100" />
          <div className="h-14 w-full max-w-3xl animate-pulse rounded bg-slate-100" />
          <div className="h-6 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
          <div className="h-[320px] animate-pulse rounded-3xl bg-slate-100 md:h-[440px]" />
        </div>
        <div className="mt-10 grid grid-cols-12 gap-6 lg:gap-8">
          <div className="col-span-12 space-y-5 lg:col-span-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-5 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
          <aside className="col-span-12 space-y-6 lg:col-span-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </aside>
        </div>
      </div>
    </main>
  );
}
