#!/usr/bin/env bash
set -e

echo "🚀 Setting up NUVENDRY Full-Stack Environment..."

# 1. Backend venv & dependencies
echo "📦 Installing Backend Python dependencies..."
python3 -m venv backend/venv
backend/venv/bin/pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt
backend/venv/bin/pip install greenlet email-validator aiosqlite

# 2. Frontend packages
echo "📦 Installing Frontend Node dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Setup Complete! Use ./scripts/test.sh to run tests or ./scripts/seed.sh to seed PostgreSQL."

