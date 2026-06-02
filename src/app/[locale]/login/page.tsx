"use client";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuthGate } from "@/hooks/useAuth";
import type { LoginMethod } from "@/lib/constants";
import { setMockSession, validateMockLogin } from "@/lib/mock-auth-client";
import { cn } from "@/lib/utils";
import { ArrowLeft, Leaf, Link2, Mail, Phone, User } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

const METHOD_OPTIONS: {
  id: LoginMethod;
  labelKey: string;
  icon: typeof Phone;
}[] = [
  { id: "phone", labelKey: "login.continuePhone", icon: Phone },
  { id: "email", labelKey: "login.continueEmail", icon: Mail },
  { id: "username", labelKey: "login.continueUsername", icon: User },
];

const METHOD_FIELD_KEYS: Record<
  LoginMethod,
  { labelKey: string; type: string; placeholder: string; autoComplete: string }
> = {
  phone: {
    labelKey: "login.phoneNumber",
    type: "tel",
    placeholder: "+213000000000",
    autoComplete: "tel",
  },
  email: {
    labelKey: "login.email",
    type: "email",
    placeholder: "owner@tasks.cash",
    autoComplete: "email",
  },
  username: {
    labelKey: "login.username",
    type: "text",
    placeholder: "owner",
    autoComplete: "username",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const { mounted, ready } = useAuthGate("public");
  const [loginMethod, setLoginMethod] = useState<LoginMethod | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const field = useMemo(() => {
    if (!loginMethod) return null;
    const keys = METHOD_FIELD_KEYS[loginMethod];
    return {
      label: t(keys.labelKey),
      type: keys.type,
      placeholder: keys.placeholder,
      autoComplete: keys.autoComplete,
    };
  }, [loginMethod, t]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!loginMethod) return;

    setSubmitting(true);
    setError("");

    if (validateMockLogin(loginMethod, identifier, password)) {
      setMockSession();
      router.push("/dashboard");
    } else {
      setError(t("login.invalidCredentials"));
    }

    setSubmitting(false);
  };

  const handleBack = () => {
    setLoginMethod(null);
    setIdentifier("");
    setPassword("");
    setError("");
  };

  const handleMethodSelect = (method: LoginMethod) => {
    setLoginMethod(method);
    setIdentifier("");
    setPassword("");
    setError("");
  };

  if (!mounted || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-40 top-1/4 h-[28rem] w-[28rem] animate-pulse rounded-full bg-emerald-500/15 blur-[100px]" />
        <div
          className="absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-600/10 blur-[100px]"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.8))]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 shadow-glow backdrop-blur-md">
            <Leaf className="h-8 w-8 text-emerald-400" strokeWidth={1.75} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Agro<span className="text-emerald-400">Pulse</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{t("meta.appTagline")}</p>
        </div>

        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-white/[0.08]",
            "bg-zinc-900/45 shadow-card backdrop-blur-2xl",
            "ring-1 ring-emerald-500/10"
          )}
        >
          <div className="p-6 sm:p-8">
            <div key={loginMethod ?? "select"} className="login-step-in">
              {!loginMethod ? (
                <>
                  <h2 className="text-center text-xl font-semibold text-white">
                    {t("login.welcome")}
                  </h2>
                  <p className="mt-1.5 text-center text-sm text-zinc-400">
                    {t("login.chooseMethod")}
                  </p>

                  <div className="mt-8 space-y-3">
                    {METHOD_OPTIONS.map(({ id, labelKey, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleMethodSelect(id)}
                        className={cn(
                          "group flex w-full items-center gap-4 rounded-2xl border border-zinc-700/50",
                          "bg-zinc-800/30 px-5 py-5 text-start backdrop-blur-sm",
                          "transition-all duration-300 ease-out",
                          "hover:-translate-y-0.5 hover:border-emerald-500/45 hover:bg-emerald-500/[0.07] hover:shadow-glow",
                          "active:translate-y-0 active:scale-[0.99]",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                            "border border-emerald-500/25 bg-emerald-500/10",
                            "transition-all duration-300 group-hover:border-emerald-400/50 group-hover:bg-emerald-500/20"
                          )}
                        >
                          <Icon className="h-6 w-6 text-emerald-400" />
                        </div>
                        <span className="text-base font-medium text-zinc-100 sm:text-lg">
                          {t(labelKey)}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleBack}
                    className={cn(
                      "-ms-2 mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5",
                      "text-sm text-zinc-400 transition-all duration-200",
                      "hover:bg-zinc-800/60 hover:text-emerald-400"
                    )}
                  >
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    {t("common.back")}
                  </button>

                  <h2 className="text-xl font-semibold text-white">{t("login.signIn")}</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {t("login.enterIdentifierPassword", {
                      field: field!.label.toLowerCase(),
                    })}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <Input
                      label={field!.label}
                      type={field!.type}
                      placeholder={field!.placeholder}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError("");
                      }}
                      autoComplete={field!.autoComplete}
                      className="border-zinc-700/80 bg-zinc-800/60"
                    />
                    <Input
                      label={t("login.password")}
                      type="password"
                      placeholder={t("login.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      autoComplete="current-password"
                      className="border-zinc-700/80 bg-zinc-800/60"
                    />
                    {error && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400"
                      >
                        {error}
                      </p>
                    )}
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      className="shadow-glow"
                      disabled={submitting}
                    >
                      {submitting ? t("common.signingIn") : t("common.login")}
                    </Button>

                    <div className="flex items-center justify-center gap-3 pt-1 sm:gap-4">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-emerald-400"
                      >
                        {t("login.forgotPassword")}
                      </button>
                      <span className="h-3 w-px bg-zinc-700" aria-hidden />
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-emerald-400"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {t("login.linkAccount")}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/[0.06] px-6 py-5 sm:px-8">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
