export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 space-y-10 lg:col-span-9">
            <div className="space-y-4 border-b border-slate-100 py-12">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
              <div className="h-14 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
              <div className="h-6 w-full max-w-3xl animate-pulse rounded bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-5">
                  <div className="aspect-[4/3] animate-pulse rounded-[2.5rem] bg-slate-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-8 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
          <aside className="col-span-12 space-y-8 lg:col-span-3">
            <div className="h-72 animate-pulse rounded-[3rem] bg-slate-100" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
