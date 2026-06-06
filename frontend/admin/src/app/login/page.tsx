import { Metadata } from "next";
import { LoginForm } from "@/features/admin/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Master Within Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-display font-semibold text-text">
            Master Within
          </h1>
          <p className="mt-1 text-sm text-muted">Operator Console</p>
        </div>
        <div className="bg-surface rounded-lg border border-border shadow-md p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
