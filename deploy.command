#!/bin/bash

cd "$(dirname "$0")"

echo ""
echo "======================================"
echo "       TUNETRACK GIT DEPLOY"
echo "======================================"
echo ""

git status

echo ""
echo "Pilih jenis update:"
echo ""
echo "  1)  Fix UI / UX"
echo "  2)  New Section"
echo "  3)  Add Product"
echo "  4)  Fix Database"
echo ""

read -p "Pilih [1-4]: " CHOICE

case $CHOICE in
    1)
        MESSAGE="fix ui ux"
        ;;
    2)
        MESSAGE="new section"
        ;;
    3)
        MESSAGE="add product"
        ;;
    4)
        MESSAGE="fix database"
        ;;
    *)
        echo ""
        echo "❌ Pilihan tidak valid."
        read -p "Press Enter to close..."
        exit 1
        ;;
esac

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
