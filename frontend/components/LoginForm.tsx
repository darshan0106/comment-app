"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiLogin } from "@/lib/api";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiLogin({ email, password });
      login(data.accessToken);
      router.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-sm mx-auto p-8 border rounded-lg shadow-sm bg-white"
    >
      <h2 className="text-2xl font-semibold text-center">Login</h2>
      <div>
        <label className="block text-sm font-medium text-slate-600">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded-md"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-slate-800 text-white p-2 rounded-md hover:bg-slate-900"
      >
        Login
      </button>

      <p className="text-center text-sm text-slate-600 pt-2">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-slate-800 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
