# 🚀 Candid + LCARS Unified Application

This project merges the functional backend of the **Candid Connections** app (with ArangoDB and API support) and the fully styled **LCARS Observation Lounge** frontend using Tailwind CSS and React components.

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + LCARS Design Tokens
- **Database**: ArangoDB (via arangojs)
- **Deployment**: Docker + Docker Compose
- **Layout**: Fully modular LCARS `<LcarsShell />` wrapping all pages

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

App will run at: [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

### 1. Build and Run via Docker Compose

```bash
docker-compose up --build
```

This launches:
- `app`: Next.js 15 frontend with LCARS UI
- `db`: ArangoDB instance on port `8529`

### 2. Access App

- Web: [http://localhost:3000](http://localhost:3000)
- ArangoDB UI: [http://localhost:8529](http://localhost:8529) (root/password)

---

## 🗂 Project Structure

```
/app             # App Router pages and layout
/components      # LCARS-styled UI components
/public/fonts    # (If added) LCARS/Okuda font files
/tailwind.config.ts  # LCARS theme tokens
/docker-compose.yml  # Multi-service definition
```

---

## 🖖 Credits

- LCARS styles adapted from [EthanThatOneKid/thelcars](https://github.com/EthanThatOneKid/thelcars)
- Candid backend architecture powered by ArangoDB and custom utilities

---

## ✅ TODO

- [ ] Verify all ArangoDB logic and route bindings
- [ ] Connect LCARS panels to dynamic data
- [ ] Add user authentication if needed

---

## 🚀 Deployment Scripts

### 1. GitHub Setup

To initialize a Git repo and push to GitHub:

```bash
chmod +x scripts/setup_github_push.sh
./scripts/setup_github_push.sh
```

> Replace `YOUR_GITHUB_REPO_URL` in the script with your actual GitHub URL.

---

### 2. Deploy to EC2 via Docker

```bash
chmod +x scripts/deploy_to_ec2.sh
./scripts/deploy_to_ec2.sh ec2-user@YOUR_EC2_IP /path/to/your-key.pem
```

This will:
- Upload the zipped project
- Install Docker and Compose on the EC2
- Deploy the full stack

---

### 3. ArangoDB Seeding

The seed script runs **automatically** via Docker at container startup.

You can also run it manually (if needed):

```bash
docker exec -it <arangodb-container-id> node /docker-entrypoint-initdb.d/seed_arangodb.js
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root with the following contents:

```env
# ArangoDB Settings
ARANGO_URL=http://localhost:8529
ARANGO_ROOT_PASSWORD=password

# Example external API key (replace as needed)
# NEXT_PUBLIC_API_KEY=your-api-key-here
```

This file is automatically ignored by Git and not committed.

