# Playwright image includes Chromium + OS libraries required at runtime.
# Tag must match the "playwright" version in package.json.
FROM mcr.microsoft.com/playwright:v1.60.0-noble

WORKDIR /app

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./

# Install all deps (devDependencies needed for `next build`)
RUN npm ci

COPY . .

RUN npm run build

# Drop devDependencies after build to keep the image smaller
RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
