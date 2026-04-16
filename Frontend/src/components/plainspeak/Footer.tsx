import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
    >
      <div className="mx-auto max-w-5xl px-6 py-8">
        <nav
          aria-label="Footer navigation"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-400"
        >
          <p className="text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} PlainSpeak Now
          </p>

          <ul className="flex items-center gap-6">
            <li>
              <Link
                to="/terms"
                className="hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
              >
                Terms
              </Link>
            </li>

            <li>
              <Link
                to="/privacy"
                className="hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
              >
                Privacy
              </Link>
            </li>

            <li>
              <Link
                to="/contact"
                className="hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

