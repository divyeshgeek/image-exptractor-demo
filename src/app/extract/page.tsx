"use client";

import { FormEvent, useState } from "react";

type ExtractedImage = {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

type ExtractResponse = {
  url: string;
  title: string;
  images: ExtractedImage[];
  count: number;
  error?: string;
};

export default function ExtractPage() {
  const [url, setUrl] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json()) as ExtractResponse;

      if (!response.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Image Extractor</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Enter a webpage URL. Crawlee opens it in headless Chromium and returns every image it finds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none ring-blue-600 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Extracting..." : "Extract Images"}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">Page</p>
            <h2 className="mt-1 text-xl font-semibold">{result.title || "Untitled page"}</h2>
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block break-all text-sm text-blue-600 hover:underline"
            >
              {result.url}
            </a>
            <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {result.count} image{result.count === 1 ? "" : "s"} found
            </p>
          </div>

          {result.images.length === 0 ? (
            <p className="text-sm text-zinc-500">No images found on this page.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.images.map((image) => (
                <article
                  key={image.src}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.src}
                      alt={image.alt || "Extracted image"}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-2 p-4">
                    {image.alt && <p className="text-sm font-medium">{image.alt}</p>}
                    {(image.width || image.height) && (
                      <p className="text-xs text-zinc-500">
                        {image.width ?? "?"} x {image.height ?? "?"}
                      </p>
                    )}
                    <a
                      href={image.src}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-xs text-blue-600 hover:underline"
                    >
                      {image.src}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
