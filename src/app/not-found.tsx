import Link from "next/link";
import { Sparkles, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-inner">
        <Sparkles className="w-8 h-8 fill-primary/20" />
      </div>

      <span className="text-sm font-bold uppercase tracking-wider text-primary">
        404 Error
      </span>
      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-2 mb-3">
        Page Not Found
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
        The creator tool or page you are looking for might have been moved or does not exist.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/en"
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/en/tools/youtube-thumbnail-downloader"
          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors"
        >
          <span>Thumbnail Downloader</span>
        </Link>
      </div>
    </div>
  );
}
