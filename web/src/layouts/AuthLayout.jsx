function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
      </div>

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <header className="mb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/30">
              J
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                JobLens
              </p>

              <p className="text-xs font-medium text-slate-500">
                Találd meg a valóban releváns állásokat
              </p>
            </div>
          </div>

          {eyebrow && (
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-blue-600 uppercase">
              {eyebrow}
            </p>
          )}

          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </header>

        {children}

        {footer && (
          <div className="mt-7 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            {footer}
          </div>
        )}
      </section>
    </main>
  );
}

export default AuthLayout;