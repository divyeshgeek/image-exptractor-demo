import { execSync } from "node:child_process";

if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "1") {
  console.log("Skipping Playwright browser download (pre-installed in image).");
  process.exit(0);
}

execSync("npx playwright install chromium", { stdio: "inherit" });
