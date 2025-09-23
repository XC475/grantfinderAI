import { login, signup } from "@/app/login/actions";

export default function LoginPage() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form method="POST">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-x-4">
          <button
            formAction={login}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
