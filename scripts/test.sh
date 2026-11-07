#!/usr/bin/env bash
set -e

echo "🧪 Running NUVENDRY Full Test Suite..."

# Backend Pytest Suite
echo "🔬 [1/2] Executing Backend Pytest Suite..."
PYTHONPATH=backend backend/venv/bin/pytest backend/app/tests -v

# Frontend Build & Typechecks
echo "⚡ [2/2] Validating Frontend TypeScript & Production Build..."
cd frontend
npm run build
cd ..

echo "🎉 All tests and builds completed successfully!"

