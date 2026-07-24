import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../layouts/AuthLayout";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setFieldErrors([]);
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      const responseData = requestError.response?.data;

      setError(
        responseData?.message ||
          "Nem sikerült létrehozni a fiókot."
      );

      setFieldErrors(responseData?.errors || []);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Új fiók"
      title="Regisztráció"
      description="Hozd létre a fiókodat, majd állítsd be, milyen állásokat keresel."
      footer={
        <>
          Már van fiókod?{" "}
          <Link
            to="/login"
            className="font-bold text-blue-600 transition hover:text-blue-700"
          >
            Bejelentkezés
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Név
          </span>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Teljes neved"
            required
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            E-mail-cím
          </span>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="pelda@email.hu"
            required
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Jelszó
          </span>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Legalább 8 karakter"
              required
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-20 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((current) => !current)
              }
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              {showPassword ? "Elrejtés" : "Mutatás"}
            </button>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Legalább 8 karakter, kisbetű, nagybetű és szám.
          </p>
        </label>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting
            ? "Regisztráció..."
            : "Fiók létrehozása"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;