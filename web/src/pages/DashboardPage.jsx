import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { getJobsRequest } from "../api/jobsApi";
import { getSearchProfileRequest } from "../api/searchProfileApi";
import { getSavedJobsRequest } from "../api/savedJobsApi";
import { importCareerjetJobsRequest } from "../api/jobImportApi";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchProfile, setSearchProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [jobCount, setJobCount] = useState(0);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [savedJobCount, setSavedJobCount] = useState(0);
  const [isSavedJobsLoading, setIsSavedJobsLoading] = useState(true);
  const [savedJobsError, setSavedJobsError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSearchProfile() {
      try {
        const profile = await getSearchProfileRequest();

        if (isMounted) {
          setSearchProfile(profile);
        }
      } catch (error) {
        if (
          error.response?.status !== 404 &&
          isMounted
        ) {
          setProfileError(
            error.response?.data?.message ||
              "Nem sikerült betölteni a keresési profilt."
          );
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    }

    async function loadJobs() {
      try {
        const result = await getJobsRequest({
          page: 1,
          limit: 1,
        });

        if (isMounted) {
          setJobCount(result.pagination.total)
        }
      } catch (error) {
        if (isMounted) {
          setJobsError(
            error.response?.data?.message ||
              "Nem sikerült betölteni az állások számát."
          );
        }
      } finally {
        if (isMounted) {
          setIsJobsLoading(false);
        }
      }
    }

    async function loadSavedJobs() {
      try {
        const result = await getSavedJobsRequest({
          page: 1,
          limit: 1,
        });

        if (isMounted) {
          setSavedJobCount(result.pagination.total)
        }
      } catch (error) {
        if (isMounted) {
          setSavedJobsError(
            error.response?.data?.message ||
              "Nem sikerült betölteni az elmentett állások számát."
          );
        }
      } finally {
        if (isMounted) {
          setIsSavedJobsLoading(false);
        }
      }
    }

    loadSearchProfile();
    loadJobs();
    loadSavedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Kijelentkezési hiba:", error);
    }
  }

  async function handleCareerjetImport() {
    setIsImporting(true);
    setImportMessage("");
    setImportError("");

    try {
      const result = await importCareerjetJobsRequest({
        keywords: searchProfile?.positionTitle || "",
        location: searchProfile?.locations?.[0] || "",
        page: 1,
        pageSize: 20,
      });

      setImportMessage(
        `Import kész: ${result.statistics.created} új, ` + `${result.statistics.updated} frissített, ` + `${result.statistics.skipped} kihagyott állás.`
      );

      const jobsResult = await getJobsRequest({
        page: 1,
        limit: 1,
      });

      setJobCount(jobsResult.pagination.total);
    } catch (error) {
      setImportError(
        error.response?.data?.message || "Nem sikerült importálni a Careerjet állásokat."
      );
    } finally {
      setIsImporting(false);
    }
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

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.18em] text-blue-600 uppercase">
            Áttekintés
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Szia, {user?.name}!
          </h1>

          <p className="mt-2 text-slate-500">
            Itt fogod látni a keresési profilodhoz illő
            állásokat.
          </p>
        </div>

        {profileError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {profileError}
          </div>
        )}

        {jobsError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {jobsError}
          </div>
        )}

        {savedJobsError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {savedJobsError}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to="/jobs"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-500">
              Elérhető állások
            </p>

            {isJobsLoading ? (
              <div className="mt-5 flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                <span className="text-sm text-slate-500">
                  Betöltés...
                </span>
              </div>
            ) : (
              <p className="mt-3 text-4xl font-black text-slate-950">
                {jobCount}
              </p>
            )}

            <p className="mt-2 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700">
              Állások megtekintése →
            </p>
          </Link>

          <Link
            to="/saved-jobs"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-slate-500">
              Mentett állások
            </p>

            {isSavedJobsLoading ? (
              <div className="mt-5 flex items-center gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                <span className="text-sm text-slate-500">
                  Betöltés...
                </span>
              </div>
            ) : (
              <p className="mt-3 text-4xl font-black text-slate-950">
                {savedJobCount}
              </p>
            )}

            <p className="mt-2 text-sm font-semibold text-blue-600 transition group-hover:text-blue-700">
              Mentések megtekintése →
            </p>
          </Link>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Keresési profil
            </p>

            {isProfileLoading ? (
              <div className="mt-5 flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

                <span className="text-sm text-slate-500">
                  Betöltés...
                </span>
              </div>
            ) : searchProfile ? (
              <>
                <p className="mt-3 text-lg font-black text-slate-950">
                  {searchProfile.positionTitle}
                </p>

                <p className="mt-2 text-sm text-emerald-700">
                  Aktív keresési profil
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 text-lg font-black text-slate-950">
                  Nincs beállítva
                </p>

                <p className="mt-2 text-sm text-amber-700">
                  Hozd létre a keresési profilodat.
                </p>
              </>
            )}
          </article>
        </div>

        <section className="mt-8 rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-blue-300 uppercase">
                Keresési profil
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {searchProfile
                  ? searchProfile.positionTitle
                  : "Állítsd be, milyen munkát keresel"}
              </h2>

              {searchProfile ? (
                <>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Tapasztalati szint:{" "}
                    <strong className="text-white">
                      {searchProfile.seniority}
                    </strong>
                  </p>

                  {searchProfile.technologies?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {searchProfile.technologies.map(
                        (technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                          >
                            {technology}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Add meg a pozíciót, tapasztalati szintet,
                  technológiákat és kizárt kulcsszavakat.
                </p>
              )}
            </div>

            <Link
              to="/search-profile"
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              {searchProfile
                ? "Profil szerkesztése"
                : "Profil létrehozása"}
            </Link>
          </div>
        </section>
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold tracking-[0.18em] text-blue-600 uppercase">
                Careerjet import
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                Új álláshirdetések lekérése
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                A keresési profil pozíciója és első helyszíne alapján
                lekéri a Careerjet legfrissebb állásait.
              </p>

              {searchProfile && (
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Keresés: {searchProfile.positionTitle || "nincs pozíció"}
                  {" · "}
                  {searchProfile.locations?.[0] || "nincs helyszín"}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCareerjetImport}
              disabled={isImporting || !searchProfile}
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting
                ? "Állások lekérése..."
                : "Állások frissítése"}
            </button>
          </div>

          {!searchProfile && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              Előbb hozz létre keresési profilt.
            </div>
          )}

          {importMessage && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {importMessage}
            </div>
          )}

          {importError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {importError}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;