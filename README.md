
## 🚀 Project Overview
### By ASHIK 

HSTU Mess Finder is a full-stack web application for managing and discovering student mess accommodations. It allows mess owners to list their properties and students to search, filter, and view available messes by location and category.

## ✨ Features

- Mess owner registration, login, and dashboard
- Create, edit, and manage mess listings
- Search and filter messes by location, category, and price
- Detailed mess information pages
- Amenities, images, and contact info for each mess
- Admin dashboard with analytics
- Responsive, modern UI (Next.js, Tailwind CSS)
- PostgreSQL database (Neon)

## 🛠️ Tech Stack

- Next.js (App Router, API routes)
- React, TypeScript
- Tailwind CSS
- PostgreSQL (Neon)
- Lucide Icons
- Shadcn UI components

## ⚡ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ashik-hstu/mess-management.git
cd mess-management
```

### 2. Install dependencies

```bash
pnpm install
# or
yarn install
# or
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgres_connection_url
JWT_SECRET=your_jwt_secret
```

### 4. Set up the database

Run the SQL scripts in the `scripts/` folder to create tables and seed data:

```bash
psql "$DATABASE_URL" < scripts/001-create-tables.sql
psql "$DATABASE_URL" < scripts/002-seed-data.sql
```

### 5. Start the development server

```bash
pnpm dev
# or
yarn dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

## 🧑‍💻 Project Structure

- `app/` — Next.js app directory (pages, API routes, UI)
- `components/` — Reusable UI components
- `lib/` — Utility functions and database client
- `hooks/` — Custom React hooks
- `public/` — Static assets and images
- `scripts/` — SQL scripts for DB setup
- `styles/` — Global styles

## 📝 Contribution

1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
