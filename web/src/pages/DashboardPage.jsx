import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { getJobsRequest } from "../api/jobsApi";
import { getSearchProfileRequest } from "../api/searchProfileApi";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchProfile, setSearchProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [jobCount, setJobCount] = useState(0);
  const [isJobsLoading, setIsJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

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

    loadSearchProfile();
    loadJobs();

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

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Mentett állások
            </p>

            <p className="mt-3 text-4xl font-black text-slate-950">
              0
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Itt jelennek majd meg az elmentett pozíciók.
            </p>
          </article>

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
      </section>
    </main>
  );
}

export default DashboardPage;