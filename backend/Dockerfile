# マルチステージビルド
FROM python:3.13-slim AS base

# 環境変数
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# 開発ステージ
FROM base AS development

COPY requirements.txt .
RUN pip install -r requirements.txt

# ホットリロード対応（ボリュームマウントで同期）
COPY . .

EXPOSE 8000

# 本番ステージ（将来用）
FROM base AS production

COPY requirements.txt .
RUN pip install --no-dev -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
