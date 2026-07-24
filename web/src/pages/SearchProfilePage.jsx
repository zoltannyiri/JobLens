import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createSearchProfileRequest,
  deleteSearchProfileRequest,
  getSearchProfileRequest,
  updateSearchProfileRequest,
} from "../api/searchProfileApi";

const initialFormData = {
  positionTitle: "",
  seniority: "JUNIOR",
  experienceMin: 0,
  experienceMax: 3,
  locations: "",
  remoteOnly: false,
  technologies: "",
  includedKeywords: "",
  excludedKeywords: "",
  notificationsEnabled: true,
};

function parseListInput(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function SearchProfilePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    initialFormData
  );

  const [profileExists, setProfileExists] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const profile =
          await getSearchProfileRequest();

        if (!isMounted) {
          return;
        }

        setFormData({
          positionTitle: profile.positionTitle || "",
          seniority: profile.seniority || "JUNIOR",
          experienceMin: profile.experienceMin ?? 0,
          experienceMax: profile.experienceMax ?? 3,
          locations: (profile.locations || []).join(", "),
          remoteOnly: profile.remoteOnly ?? false,
          technologies: (profile.technologies || []).join(", "),
          includedKeywords: (profile.includedKeywords || []).join(", "),
          excludedKeywords: (profile.excludedKeywords || []).join(", "),
          notificationsEnabled:
            profile.notificationsEnabled ?? true,
        });

        setProfileExists(true);
      } catch (requestError) {
        if (
          requestError.response?.status !== 404 &&
          isMounted
        ) {
          setError(
            requestError.response?.data?.message ||
              "Nem sikerült betölteni a keresési profilt."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? ""
              : Number(value)
            : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setFieldErrors([]);
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        positionTitle: formData.positionTitle.trim(),
        seniority: formData.seniority,

        experienceMin:
          formData.experienceMin === ""
            ? null
            : Number(formData.experienceMin),

        experienceMax:
          formData.experienceMax === ""
            ? null
            : Number(formData.experienceMax),

        locations: parseListInput(formData.locations),
        remoteOnly: formData.remoteOnly,

        technologies: parseListInput(
          formData.technologies
        ),

        includedKeywords: parseListInput(
          formData.includedKeywords
        ),

        excludedKeywords: parseListInput(
          formData.excludedKeywords
        ),

        notificationsEnabled:
          formData.notificationsEnabled,
      };

      const savedProfile = profileExists
        ? await updateSearchProfileRequest(payload)
        : await createSearchProfileRequest(payload);

      setProfileExists(true);

      setFormData({
        positionTitle: savedProfile.positionTitle || "",
        seniority: savedProfile.seniority || "JUNIOR",
        experienceMin: savedProfile.experienceMin ?? 0,
        experienceMax: savedProfile.experienceMax ?? 3,
        locations: (savedProfile.locations || []).join(", "),
        remoteOnly: savedProfile.remoteOnly ?? false,
        technologies:
          (savedProfile.technologies || []).join(", "),
        includedKeywords:
          (savedProfile.includedKeywords || []).join(", "),
        excludedKeywords:
          (savedProfile.excludedKeywords || []).join(", "),
        notificationsEnabled:
          savedProfile.notificationsEnabled ?? true,
      });

      setSuccessMessage(
        profileExists
          ? "A keresési profil sikeresen frissült."
          : "A keresési profil sikeresen létrejött."
      );
    } catch (requestError) {
      const responseData =
        requestError.response?.data;

      setError(
        responseData?.message ||
          "Nem sikerült elmenteni a keresési profilt."
      );

      setFieldErrors(
        responseData?.errors || []
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd a keresési profilodat?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await deleteSearchProfileRequest();

      setFormData(initialFormData);
      setProfileExists(false);
      setSuccessMessage(
        "A keresési profil törölve lett."
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Nem sikerült törölni a keresési profilt."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Keresési profil betöltése...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
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

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-[0.18em] text-blue-600 uppercase">
            Beállítások
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Keresési profil
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-slate-500">
            Add meg, milyen állásokat szeretnél látni.
            A JobLens ezek alapján rangsorolja és szűri
            majd a hirdetéseket.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-950">
                Alapadatok
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pozíció, tapasztalati szint és munkavégzési
                forma.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Keresett pozíció
                </span>

                <input
                  type="text"
                  name="positionTitle"
                  value={formData.positionTitle}
                  onChange={handleChange}
                  placeholder="Junior Frontend Developer"
                  required
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Tapasztalati szint
                </span>

                <select
                  name="seniority"
                  value={formData.seniority}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="INTERN">
                    Gyakornok
                  </option>

                  <option value="JUNIOR">
                    Junior
                  </option>

                  <option value="MEDIOR">
                    Medior
                  </option>

                  <option value="SENIOR">
                    Senior
                  </option>

                  <option value="LEAD">
                    Lead
                  </option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  name="remoteOnly"
                  checked={formData.remoteOnly}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-slate-300 text-blue-600"
                />

                <span>
                  <span className="block text-sm font-bold text-slate-800">
                    Csak remote állások
                  </span>

                  <span className="text-xs text-slate-500">
                    Csak teljesen távolról végezhető munkák
                  </span>
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Minimum tapasztalat
                </span>

                <div className="relative">
                  <input
                    type="number"
                    name="experienceMin"
                    value={formData.experienceMin}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-400">
                    év
                  </span>
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Maximum tapasztalat
                </span>

                <div className="relative">
                  <input
                    type="number"
                    name="experienceMax"
                    value={formData.experienceMax}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-400">
                    év
                  </span>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-950">
                Helyszín és technológiák
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Több értéket vesszővel válassz el.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Helyszínek
                </span>

                <input
                  type="text"
                  name="locations"
                  value={formData.locations}
                  onChange={handleChange}
                  placeholder="Budapest, Győr, Remote"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Például: Budapest, Győr, Remote
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Technológiák
                </span>

                <input
                  type="text"
                  name="technologies"
                  value={formData.technologies}
                  onChange={handleChange}
                  placeholder="React, JavaScript, Node.js"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Az általad használt vagy keresett technológiák
                </p>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-950">
                Kulcsszavak
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Segíts pontosabban meghatározni, mi számít
                releváns állásnak.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Tartalmazandó kulcsszavak
                </span>

                <textarea
                  name="includedKeywords"
                  value={formData.includedKeywords}
                  onChange={handleChange}
                  rows="4"
                  placeholder="frontend developer, React, junior"
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Ezek növelik majd a találat relevanciáját.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Kizárt kulcsszavak
                </span>

                <textarea
                  name="excludedKeywords"
                  value={formData.excludedKeywords}
                  onChange={handleChange}
                  rows="4"
                  placeholder="senior, lead, architect, full stack"
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Ezeket tartalmazó állásokat kizárhatjuk.
                </p>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <label className="flex items-start gap-4">
              <input
                type="checkbox"
                name="notificationsEnabled"
                checked={
                  formData.notificationsEnabled
                }
                onChange={handleChange}
                className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600"
              />

              <span>
                <span className="block font-black text-slate-900">
                  Állásértesítések engedélyezése
                </span>

                <span className="mt-1 block text-sm leading-6 text-slate-500">
                  Értesítést kaphatsz, amikor a profilodhoz
                  illő új állást találunk.
                </span>
              </span>
            </label>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              <p className="font-bold">{error}</p>

              {fieldErrors.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {fieldErrors.map((item, index) => (
                    <li key={`${item.field}-${index}`}>
                      {item.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="flex flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              {profileExists && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  {isDeleting
                    ? "Törlés..."
                    : "Keresési profil törlése"}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting
                ? "Mentés..."
                : profileExists
                  ? "Módosítások mentése"
                  : "Keresési profil létrehozása"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default SearchProfilePage;