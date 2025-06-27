import Link from 'next/link';

export default function Home() {
  return (
    <>
      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
        <h1 className="text-5xl font-bold mb-4">Surface Planner</h1>
        <p className="text-xl mb-6">Design your perfect apartment floor or wall with interactive walls and tile layouts.</p>
        <Link href="/planner" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded shadow hover:bg-gray-100 transition">Start Designing</Link>
      </section>
      <footer className="py-4 text-center text-sm text-gray-500">
        © 2025 Surface Planner
      </footer>
    </>
  );
}
