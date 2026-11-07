#!/usr/bin/env bash
set -e

echo "🌱 Seeding PostgreSQL Database with Real Demo Scenario..."
PYTHONPATH=backend backend/venv/bin/python backend/seed_demo.py
echo "✅ Database Seeded Successfully!"

