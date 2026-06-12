import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full z-10">
        <SignupForm />
      </div>
    </main>
  );
}
