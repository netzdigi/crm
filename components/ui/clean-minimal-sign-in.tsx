"use client"

import * as React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";

import {LogIn, Lock, Mail} from "lucide-react";

type OAuthProvider = "oauth_google" | "oauth_facebook" | "oauth_apple";

const SignIn2 = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Моля, въведи имейл и парола.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Моля, въведи валиден имейл адрес.");
      return;
    }
    if (!isLoaded) return;

    setError("");
    setSubmitting(true);
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("Входът изисква допълнителна стъпка. Провери имейла си.");
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.message ??
          "Неуспешен вход. Провери въведените данни и опитай отново."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (strategy: OAuthProvider) => {
    if (!isLoaded) return;
    setError("");
    setOauthLoading(strategy);
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      setOauthLoading(null);
      setError(
        err?.errors?.[0]?.message ?? "Входът не бе успешен. Опитай отново."
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white rounded-xl  z-1">
      <div className="w-full max-w-sm bg-gradient-to-b from-sky-50/50 to-white  rounded-3xl shadow-xl shadow-opacity-10 p-8 flex flex-col items-center border border-blue-100 text-black">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white mb-6 shadow-lg shadow-opacity-5">
          <LogIn className="w-7 h-7 text-black" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Вход с имейл
        </h2>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Влез в акаунта си, за да управляваш бизнеса си от едно място.
        </p>
        <div className="w-full flex flex-col gap-3 mb-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-4 h-4" />
            </span>
            <input
              placeholder="Имейл"
              type="email"
              value={email}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              placeholder="Парола"
              type="password"
              value={password}
              className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 text-black text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer text-xs select-none"></span>
          </div>
          <div className="w-full flex justify-end">
          {error && (
            <div className="text-sm text-red-500 text-left">{error}</div>
          )}
            <button className="text-xs  hover:underline font-medium">
              Забравена парола?
            </button>
          </div>
        </div>
        <button
          onClick={handleSignIn}
          disabled={submitting || !isLoaded}
          className="w-full bg-gradient-to-b from-gray-700 to-gray-900 text-white font-medium py-2 rounded-xl shadow hover:brightness-105 cursor-pointer transition mb-4 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Вход…" : "Вход"}
        </button>
        <div className="flex items-center w-full my-2">
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
          <span className="mx-2 text-xs text-gray-400">Или влез с</span>
          <div className="flex-grow border-t border-dashed border-gray-200"></div>
        </div>
        <div className="flex gap-3 w-full justify-center mt-2">
          <button
            type="button"
            onClick={() => handleOAuthSignIn("oauth_google")}
            disabled={!isLoaded || oauthLoading !== null}
            aria-label="Влез с Google"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-6 h-6"
            />
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn("oauth_facebook")}
            disabled={!isLoaded || oauthLoading !== null}
            aria-label="Влез с Facebook"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/448224/facebook.svg"
              alt="Facebook"
              className="w-6 h-6"
            />
          </button>
          <button
            type="button"
            onClick={() => handleOAuthSignIn("oauth_apple")}
            disabled={!isLoaded || oauthLoading !== null}
            aria-label="Влез с Apple"
            className="flex items-center justify-center w-12 h-12 rounded-xl border bg-white hover:bg-gray-100 transition grow disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/511330/apple-173.svg"
              alt="Apple"
              className="w-6 h-6"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export { SignIn2 };
