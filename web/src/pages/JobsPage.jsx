import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getJobsRequest, getMatchedJobsRequest } from "../api/jobsApi";

const initialFilters = {
  search: "",
  seniority: "",
  remoteType: "",
};

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

function getRemoteTypeLabel(value) {
  const labels = {
    REMOTE: "Remote",
    HYBRID: "Hibrid",
    ONSITE: "Irodai",
  };

  return labels[value] || value || "Nincs megadva";
}

function getSeniorityLabel(value) {
  const labels = {
    INTERN: "Gyakornok",
    JUNIOR: "Junior",
    MEDIOR: "Medior",
    SENIOR: "Senior",
    LEAD: "Lead",
  };

  return labels[value] || value || "Nincs megadva";
}

function JobsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [submittedFilters, setSubmittedFilters] =
    useState(initialFilters);

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("matched");
  const [minimumMatch, setMinimumMatch] = useState(20);

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      setIsLoading(true);
      setError("");

      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
        };

        let result;

        if (viewMode === "matched") {
          result = await getMatchedJobsRequest({
            ...params,
            minimumMatch,
          });
        } else {
          result = await getJobsRequest({
            ...submittedFilters,
            ...params,
          });
        }

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
              "Nem sikerült betölteni az állásokat."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [ submittedFilters, pagination.page, pagination.limit, viewMode, minimumMatch ]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    setPagination((current) => ({
      ...current,
      page: 1,
    }));

    setSubmittedFilters({
      search: filters.search.trim(),
      seniority: filters.seniority,
      remoteType: filters.remoteType,
    });
  }

  function handleReset() {
    setFilters(initialFilters);
    setSubmittedFilters(initialFilters);

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
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
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Vissza az áttekintéshez
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.18em] text-blue-600 uppercase">
            Álláskeresés
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Álláshirdetések
          </h1>

          <p className="mt-2 text-slate-500">
            Böngéssz az adatbázisban található állások között.
          </p>
        </div>

        <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setViewMode("matched");

              setPagination((current) => ({
                ...current,
                page: 1,
              }));
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              viewMode === "matched"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Neked ajánlott
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("all");

              setPagination((current) => ({
                ...current,
                page: 1,
              }));
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              viewMode === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Minden állás
          </button>
        </div>

        {viewMode === "all" && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Keresés
              </span>

              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Pozíció, cég, helyszín..."
                className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Tapasztalati szint
              </span>

              <select
                name="seniority"
                value={filters.seniority}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Mindegy</option>
                <option value="INTERN">Gyakornok</option>
                <option value="JUNIOR">Junior</option>
                <option value="MEDIOR">Medior</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Munkavégzés
              </span>

              <select
                name="remoteType"
                value={filters.remoteType}
                onChange={handleChange}
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Mindegy</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hibrid</option>
                <option value="ONSITE">Irodai</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Szűrők törlése
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Keresés
            </button>
          </div>
        </form>
        )}

        {viewMode === "matched" && (
          <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-black text-slate-900">
                  Személyre szabott találatok
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Az állásokat a keresési profilod alapján
                  rangsoroljuk.
                </p>
              </div>

              <label className="block sm:w-56">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Minimum egyezés
                </span>

                <select
                  value={minimumMatch}
                  onChange={(event) => {
                    setMinimumMatch(Number(event.target.value));

                    setPagination((current) => ({
                      ...current,
                      page: 1,
                    }));
                  }}
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value={0}>Minden találat</option>
                  <option value={20}>Legalább 20%</option>
                  <option value={40}>Legalább 40%</option>
                  <option value={60}>Legalább 60%</option>
                  <option value={80}>Legalább 80%</option>
                </select>
              </label>
            </div>
          </section>
        )}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {viewMode === "matched"
              ? "Személyre szabott találatok:"
              : "Összes találat:"}{" "}
            <strong className="text-slate-900">
              {pagination.total}
            </strong>
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

              <p className="mt-4 text-sm font-semibold text-slate-500">
                Állások betöltése...
              </p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-black text-slate-900">
              Nincs találat
            </h2>

            <p className="mt-2 text-slate-500">
              Próbálj más keresési feltételeket használni.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {typeof job.matchPercentage === "number" && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            job.matchPercentage >= 80
                              ? "bg-emerald-100 text-emerald-800"
                              : job.matchPercentage >= 60
                                ? "bg-blue-100 text-blue-800"
                                : job.matchPercentage >= 40
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {job.matchPercentage}% egyezés
                        </span>
                      )}
                      {job.seniority && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          {getSeniorityLabel(job.seniority)}
                        </span>
                      )}

                      {job.remoteType && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {getRemoteTypeLabel(job.remoteType)}
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

                      {(job.experienceMin !== null ||
                        job.experienceMax !== null) && (
                        <span>
                          Tapasztalat:{" "}
                          <strong className="text-slate-700">
                            {job.experienceMin ?? 0}–
                            {job.experienceMax ?? "?"} év
                          </strong>
                        </span>
                      )}
                    </div>

                    {job.matchedReasons?.length > 0 && (
                      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                        <p className="text-xs font-black tracking-wide text-blue-700 uppercase">
                          Miért ajánljuk?
                        </p>

                        <ul className="mt-3 space-y-2">
                          {job.matchedReasons.map((reason) => (
                            <li
                              key={reason}
                              className="flex gap-2 text-sm text-slate-700"
                            >
                              <span className="font-black text-blue-600">
                                ✓
                              </span>

                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="mt-4 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                      Forrás: {job.source}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-end">
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

export default JobsPage;