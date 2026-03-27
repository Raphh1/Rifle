export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-6">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          Rifle
        </span>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
      </div>
    </div>
  );
}
