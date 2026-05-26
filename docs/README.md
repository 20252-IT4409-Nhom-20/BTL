# HackerNews Clone Docs

Welcome to the official developer documentation for the HackerNews Clone fullstack monorepo. This documentation covers both the React frontend and Express/MongoDB backend architectures, coding standards, and system design decisions.

## Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **NPM** or **Yarn**
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)

### 2. Setup & Installation
Clone the repository and install dependencies in both workspace roots:

#### Backend Setup
```bash
cd be
npm install
cp .env.example .env # Add your MONGO_URI and JWT_SECRET
npm run dev
```

#### Frontend Setup
```bash
cd fe
npm install
cp .env.local.example .env.local # Update VITE_API_URL
npm run dev
```

---

## Directory Overview

* **`fe/`**: Vite + React single-page application built using highly modular, feature-based architecture.
* **`be/`**: Express.js RESTful API, structured using Controller-Service-Repository patterns.
* **`docs/`**: Centralized technical documentation, guides, and Architecture Decision Records (ADRs).
