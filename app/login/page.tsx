import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Sign in</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded border px-3 py-2" />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" required className="w-full rounded border px-3 py-2" />
        </div>
        <button type="submit" className="w-full rounded bg-black py-2 text-white">
          Sign in
        </button>
      </form>
    </div>
  )
}