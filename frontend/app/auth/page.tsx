import { AuthForm } from "@/components/auth/AuthForm"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
          認証ページ
        </h1>
        <AuthForm />
      </div>
    </div>
  )
}
