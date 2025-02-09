'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "./contexts/UserContext";

interface ApiError {
  message: string;
}

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    // Get the callback URL from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl');

    // If user is already logged in, redirect to callback URL or organizations page
    if (user) {
      router.push(callbackUrl || '/organizations');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    // Get the callback URL from the URL parameters
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get('callbackUrl');

    if (isLogin) {
      try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Invalid email or password");
        }

        // Store user data in context and localStorage
        setUser(data.data.user);
        router.push(callbackUrl || "/organizations");
      } catch (error) {
        const err = error as Error | ApiError;
        setError('message' in err ? err.message : "Something went wrong. Please try again.");
      }
    } else {
      try {
        const name = formData.get("name") as string;
        const res = await fetch("http://localhost:8080/api/auth/signup", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Something went wrong");
          setLoading(false);
          return;
        }

        // Auto login after successful registration
        const loginRes = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const loginData = await loginRes.json();

        if (!loginRes.ok) {
          setError("Registration successful. Please login.");
        } else {
          // Store user data in context and localStorage
          setUser(loginData.data.user);
          router.push(callbackUrl || "/organizations");
        }
      } catch (error) {
        const err = error as Error | ApiError;
        setError('message' in err ? err.message : "Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Form */}
      <div className="w-full lg:w-[520px] min-h-screen flex flex-col">
        <div className="flex flex-col flex-grow px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8">
          {/* Logo section */}
          <div>
            <h1 className="text-[28px] font-semibold text-[#1A73E8]">
              Workly
            </h1>
            <p className="text-[#5f6368] text-[16px] mt-1">
              Welcome to the new way of work.
            </p>
          </div>

          {/* Form section */}
          <div className="flex-grow flex flex-col justify-center max-w-[400px] w-full mx-auto -mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {/* Form header */}
                <div className="mb-6">
                  <h2 className="text-[24px] font-normal text-[#202124] mb-1">
                    {isLogin ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-[14px] text-[#5f6368]">
                    {isLogin
                      ? "Sign in to continue to your workspace"
                      : "Get started with your new workspace"}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                    {error}
                  </div>
                )}

                {/* Form inputs */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div>
                          <label className="block text-[14px] text-[#5f6368] mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            className="w-full h-[48px] px-3 bg-[#f8f9fa] text-[16px] text-[#202124] rounded-lg border border-[#dadce0] focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 outline-none transition-all"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-[14px] text-[#5f6368] mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full h-[48px] px-3 bg-[#f8f9fa] text-[16px] text-[#202124] rounded-lg border border-[#dadce0] focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 outline-none transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] text-[#5f6368] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full h-[48px] px-3 bg-[#f8f9fa] text-[16px] text-[#202124] rounded-lg border border-[#dadce0] focus:border-[#1a73e8] focus:ring-4 focus:ring-[#1a73e8]/10 outline-none transition-all"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[48px] bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[16px] font-medium rounded-[4px] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-[14px] text-[#1a73e8] hover:text-[#1557b0] transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:block flex-1 bg-[#1a73e8] relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

        <div className="relative h-full flex items-center p-12">
          <div className="max-w-xl mx-auto">
            <h2 className="text-[32px] font-semibold text-white mb-8">
              Sign up to get full access to the Workly work hub:
            </h2>

            <div className="space-y-4">
              {[
                "Use search to find every work file across all your connected tools.",
                "See projects, goals, and work updates for every person and team.",
                "Create, assign or access workflows and protocols across every team."
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 bg-white/[0.08] rounded-lg p-4"
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-[15px] text-white/90">{text}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[15px] text-white/80">
                Workly brings information from all your tools together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
