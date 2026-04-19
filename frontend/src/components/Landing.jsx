export default function Landing({ setView }) {
  return (
    <main className="flex flex-col items-center justify-center mt-32 px-6 text-center">
      <h1 className="text-6xl font-extrabold tracking-tight">
        University <span className="text-indigo-500">Lost & Found</span>
      </h1>
      <p className="mt-6 text-slate-400 text-lg max-w-xl">
        A secure platform for the Faculty of Engineering.
      </p>
      {/* The button has been removed to allow users to focus on the items below */}
    </main>
  );
}