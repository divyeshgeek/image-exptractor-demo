export type ExtractedImage = {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type ExtractImagesResult = {
  url: string;
  title: string;
  images: ExtractedImage[];
  count: number;
};

function normalizeUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    return new URL(rawUrl, baseUrl).href;
  } catch {
    return null;
  }
}

function isLikelyImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?|$)/i.test(url);
}

export async function extractImagesFromUrl(targetUrl: string): Promise<ExtractImagesResult> {
  const { PlaywrightCrawler, Configuration } = await import("@crawlee/playwright");

  const images = new Map<string, ExtractedImage>();
  let pageTitle = "";
  let loadedUrl = targetUrl;

  const config = new Configuration({
    persistStorage: false,
  });

  const crawler = new PlaywrightCrawler(
    {
      maxRequestsPerCrawl: 1,
      headless: true,
      launchContext: {
        launchOptions: {
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        },
      },
      async requestHandler({ page, log }) {
        loadedUrl = page.url();
        pageTitle = await page.title();

        const collected = await page.evaluate(() => {
          const results: Array<{
            src: string;
            alt: string;
            width: number | null;
            height: number | null;
          }> = [];

          const imgElements = Array.from(document.querySelectorAll("img"));
          for (const img of imgElements) {
            const src =
              img.currentSrc ||
              img.getAttribute("src") ||
              img.getAttribute("data-src") ||
              img.getAttribute("data-lazy-src") ||
              "";

            if (!src) continue;

            results.push({
              src,
              alt: img.alt || "",
              width: img.naturalWidth || img.width || null,
              height: img.naturalHeight || img.height || null,
            });
          }

          const sourceElements = Array.from(document.querySelectorAll("source[srcset], source[src]"));
          for (const source of sourceElements) {
            const srcset = source.getAttribute("srcset");
            const src = source.getAttribute("src");

            if (srcset) {
              for (const part of srcset.split(",")) {
                const candidate = part.trim().split(/\s+/)[0];
                if (candidate) {
                  results.push({ src: candidate, alt: "", width: null, height: null });
                }
              }
            } else if (src) {
              results.push({ src, alt: "", width: null, height: null });
            }
          }

          const metaImages = Array.from(
            document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"], link[rel="image_src"]'),
          );

          for (const meta of metaImages) {
            const content = meta.getAttribute("content") || meta.getAttribute("href");
            if (content) {
              results.push({ src: content, alt: "meta image", width: null, height: null });
            }
          }

          return results;
        });

        for (const item of collected) {
          const normalized = normalizeUrl(item.src, loadedUrl);
          if (!normalized) continue;
          if (!images.has(normalized)) {
            images.set(normalized, {
              src: normalized,
              alt: item.alt,
              width: item.width,
              height: item.height,
            });
          }
        }

        const cssImages = await page.evaluate(() => {
          const urls: string[] = [];
          for (const element of Array.from(document.querySelectorAll("*"))) {
            const style = window.getComputedStyle(element);
            const background = style.backgroundImage;
            if (!background || background === "none") continue;

            const match = background.match(/url\(["']?(.*?)["']?\)/);
            if (match?.[1]) urls.push(match[1]);
          }
          return urls;
        });

        for (const cssUrl of cssImages) {
          const normalized = normalizeUrl(cssUrl, loadedUrl);
          if (!normalized || images.has(normalized)) continue;
          if (isLikelyImageUrl(normalized) || normalized.startsWith("data:image")) {
            images.set(normalized, {
              src: normalized,
              alt: "background image",
              width: null,
              height: null,
            });
          }
        }

        log.info(`Extracted ${images.size} images from ${loadedUrl}`);
      },
    },
    config,
  );

  await crawler.run([targetUrl]);

  return {
    url: loadedUrl,
    title: pageTitle,
    images: Array.from(images.values()),
    count: images.size,
  };
}
