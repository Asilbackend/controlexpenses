FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
#RUN pip3 install --no-cache-dir vosk

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg \
  && rm -rf /var/lib/apt/lists/*
RUN pip3 install --no-cache-dir vosk --break-system-packages

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app ./app
COPY --from=builder /app/server ./server
COPY --from=builder /app/stt ./stt
COPY --from=builder /app/lib ./lib

EXPOSE 3000
CMD ["npm","run","start"]

