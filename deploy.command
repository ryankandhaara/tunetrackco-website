#!/bin/bash

cd "$(dirname "$0")"

echo ""
echo "======================================"
echo "       TUNETRACK GIT DEPLOY"
echo "======================================"
echo ""

git status

echo ""
read -p "Commit message: " MESSAGE

if [ -z "$MESSAGE" ]; then
    MESSAGE="update website"
fi

echo ""
echo "Adding files..."
git add .

echo ""
echo "Creating commit..."
git commit -m "$MESSAGE"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Commit gagal / tidak ada perubahan."
    read -p "Press Enter to close..."
    exit 1
fi

echo ""
echo "Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Push gagal."
    read -p "Press Enter to close..."
    exit 1
fi

echo ""
echo "======================================"
echo "       ✅ DEPLOY SUCCESS"
echo "======================================"
echo ""
echo "GitHub sudah menerima commit."
echo "Vercel akan auto-deploy."
echo ""

read -p "Press Enter to close..."
