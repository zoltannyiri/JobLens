import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getSavedJobsRequest, unsaveJobRequest } from "../api/savedJobsApi";

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

function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSavedJobs() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getSavedJobsRequest({
          page: pagination.page,
          limit: pagination.limit,
        });

        if (!isMounted) {
          return;
        }

        setJobs(result.jobs);

        setPagination((current) => ({
          ...current,
          ...result.pagination,
        }));
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Nem sikerült betölteni a mentett állásokat."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, [pagination.page, pagination.limit]);

  async function handleRemove(jobId) {
    setError("");
    setRemovingJobId(jobId);

    try {
      await unsaveJobRequest(jobId);

      setJobs((current) =>
        current.filter((job) => job.id !== jobId)
      );

      setPagination((current) => {
        const nextTotal = Math.max(current.total - 1, 0);
        const nextTotalPages = Math.ceil(
          nextTotal / current.limit
        );

        return {
          ...current,
          total: nextTotal,
          totalPages: nextTotalPages,
        };
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Nem sikerült eltávolítani az állást a mentések közül."
      );
    } finally {
      setRemovingJobId(null);
    }
  }

  function goToPage(page) {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    setPagination((current) => ({
      ...current,
      page,
    }));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white">
              J
            </div>

            <div>
              <p className="font-black text-slate-950">
                JobLens
              </p>

              <p className="text-xs text-slate-500">
                Intelligens álláskeresés
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Vissza az áttekintéshez
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.18em] text-blue-600 uppercase">
            Gyűjtemény
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Mentett állások
          </h1>

          <p className="mt-2 text-slate-500">
            Itt találod azokat az állásokat, amelyeket későbbre
            elmentettél.
          </p>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mentett állások száma:{" "}
            <strong className="text-slate-900">
              {pagination.total}
            </strong>
          </p>

          <Link
            to="/jobs"
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            További állások keresése →
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Mentett állások betöltése...
              </p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-black text-slate-900">
              Még nincs mentett állásod
            </h2>

            <p className="mt-2 text-slate-500">
              Ments el egy számodra érdekes pozíciót, hogy később
              könnyen megtaláld.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Állások böngészése
            </Link>
          </section>
        ) : (
          <div className="space-y-5">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row">
                  <div className="min-w-0">
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

                    <h2 className="mt-4 text-xl font-black text-slate-950">
                      {job.title}
                    </h2>

                    <p className="mt-2 font-semibold text-slate-700">
                      {job.company || "Ismeretlen cég"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      <span>
                        Helyszín:{" "}
                        <strong className="text-slate-700">
                          {job.location || "Nincs megadva"}
                        </strong>
                      </span>

                      <span>
                        Közzétéve:{" "}
                        <strong className="text-slate-700">
                          {formatDate(job.publishedAt)}
                        </strong>
                      </span>

                      <span>
                        Elmentve:{" "}
                        <strong className="text-slate-700">
                          {formatDate(job.savedAt)}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleRemove(job.id)}
                      disabled={removingJobId === job.id}
                      className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      {removingJobId === job.id
                        ? "Eltávolítás..."
                        : "Eltávolítás"}
                    </button>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
                    >
                      Részletek
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                goToPage(pagination.page - 1)
              }
              disabled={pagination.page === 1}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Előző
            </button>

            <span className="text-sm font-semibold text-slate-600">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                goToPage(pagination.page + 1)
              }
              disabled={
                pagination.page === pagination.totalPages
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Következő
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}

export default SavedJobsPage;