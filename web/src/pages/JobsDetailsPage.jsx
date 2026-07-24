import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { getJobByIdRequest } from "../api/jobsApi";

function formatDate(value) {
  if (!value) {
    return "Nincs megadva";
  }

  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function JobDetailsPage() {
  const { jobId } = useParams();

  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadJob() {
      try {
        const result = await getJobByIdRequest(jobId);

        if (isMounted) {
          setJob(result);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Nem sikerült betölteni az álláshirdetést."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Álláshirdetés betöltése...
          </p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <section className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">
            Nem sikerült megnyitni az állást
          </h1>

          <p className="mt-3 text-slate-500">
            {error || "Az álláshirdetés nem található."}
          </p>

          <Link
            to="/jobs"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
          >
            Vissza az állásokhoz
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white">
              J
            </div>

            <p className="font-black text-slate-950">
              JobLens
            </p>
          </Link>

          <Link
            to="/jobs"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Vissza az állásokhoz
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 py-10">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 p-8">
            <div className="flex flex-wrap gap-2">
              {job.seniority && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {job.seniority}
                </span>
              )}

              {job.remoteType && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {job.remoteType}
                </span>
              )}

              {job.roleType && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {job.roleType}
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
              {job.title}
            </h1>

            <p className="mt-3 text-lg font-bold text-slate-700">
              {job.company || "Ismeretlen cég"}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span>
                Helyszín:{" "}
                <strong className="text-slate-800">
                  {job.location || "Nincs megadva"}
                </strong>
              </span>

              <span>
                Közzétéve:{" "}
                <strong className="text-slate-800">
                  {formatDate(job.publishedAt)}
                </strong>
              </span>

              <span>
                Forrás:{" "}
                <strong className="text-slate-800">
                  {job.source}
                </strong>
              </span>
            </div>
          </header>

          <div className="grid gap-8 p-8 md:grid-cols-[1fr_260px]">
            <section>
              <h2 className="text-xl font-black text-slate-950">
                Állásleírás
              </h2>

              <div className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
                {job.description ||
                  "Ehhez az álláshirdetéshez nincs részletes leírás."}
              </div>
            </section>

            <aside className="h-fit rounded-2xl bg-slate-50 p-5">
              <h2 className="font-black text-slate-900">
                Részletek
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">
                    Minimum tapasztalat
                  </dt>

                  <dd className="mt-1 font-bold text-slate-900">
                    {job.experienceMin !== null
                      ? `${job.experienceMin} év`
                      : "Nincs megadva"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Maximum tapasztalat
                  </dt>

                  <dd className="mt-1 font-bold text-slate-900">
                    {job.experienceMax !== null
                      ? `${job.experienceMax} év`
                      : "Nincs megadva"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-500">
                    Munkavégzés
                  </dt>

                  <dd className="mt-1 font-bold text-slate-900">
                    {job.remoteType || "Nincs megadva"}
                  </dd>
                </div>
              </dl>

              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 block rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Jelentkezés az eredeti oldalon
              </a>
            </aside>
          </div>
        </article>
      </section>
    </main>
  );
}

export default JobDetailsPage;