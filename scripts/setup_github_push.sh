#!/bin/bash
# GitHub Push Script

echo "Initializing Git repository and pushing to GitHub..."

git init
git remote add origin YOUR_GITHUB_REPO_URL
git add .
git commit -m "Initial commit of unified Candid + LCARS app"
git branch -M main
git push -u origin main
