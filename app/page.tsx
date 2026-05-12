import { LoginForm } from "@/modules/auth/components/login-form";

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>SnackieVerse</h1>
      <LoginForm />
    </main>
  );
}