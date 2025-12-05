# マルチステージビルド
FROM node:20-alpine AS base

WORKDIR /app

# 開発ステージ
FROM base AS development

# package.jsonのみコピー（キャッシュ効率化）
COPY package*.json ./

RUN npm install

# ホットリロード対応（ボリュームマウントで同期）
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ビルドステージ
FROM base AS builder

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 本番ステージ（将来用）
FROM base AS production

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
