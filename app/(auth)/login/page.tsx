import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full z-10">
        <LoginForm />
      </div>
    </main>
  );
}
