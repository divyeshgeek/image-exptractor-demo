import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-widest text-blue-600">Next.js + Crawlee</p>
      <h1 className="mb-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Extract images from any webpage
      </h1>
      <p className="mb-8 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Paste a URL and get all images found on the page. Powered by @crawlee/browser and Playwright.
      </p>
      <Link
        href="/extract"
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Open Image Extractor
      </Link>
    </div>
  );
}
