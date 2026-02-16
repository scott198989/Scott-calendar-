# Scott's Calendar

A full-featured personal calendar application built with Next.js 14, featuring an alternating work schedule, school tracking, pet care reminders, payday tracking, and multi-user collaboration.

## Features

- **Full CRUD Events** - Create, read, update, and delete events with full form support
- **Alternating Work Schedule** - Auto-generated short/long week shifts (8:30 PM - 10:00 AM)
- **School Schedule** - Monday & Wednesday classes (10:30 AM - 5:00 PM)
- **Gunner Reminders** - Pet bathroom reminders before/after work shifts
- **Pay Day Tracking** - ISOFlex (short-week Wednesdays) and VA Disability (1st of month)
- **3 Calendar Views** - Month, Week, and Day views with smooth transitions
- **Color-Coded Categories** - 10 color options with custom icons
- **User Authentication** - Admin and User roles with NextAuth
- **Comments** - Users can comment on events
- **Push Notifications** - Web Push API for event reminders
- **Responsive Design** - Mobile-friendly with sidebar drawer
- **Dark Mode** - Automatic system preference detection

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v5
- **Icons**: Lucide React
- **Notifications**: Web Push API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud: Neon, Supabase, Vercel Postgres, etc.)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for session encryption
- `NEXTAUTH_URL` - Your app URL (http://localhost:3000 for dev)

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

### 5. Seed the database

Visit the admin page after logging in as admin, or call:

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates the admin account, default categories, and 6 months of scheduled events.

**Default admin login:**
- Email: `scott@calendar.app`
- Password: `admin123`

## Schedule Reference

| Type | Schedule | Details |
|------|----------|---------|
| **Work (Short Week)** | Wed, Thu, Fri | 8:30 PM - 10:00 AM next day |
| **Work (Long Week)** | Wed, Thu, Fri, Sat | 8:30 PM - 10:00 AM next day |
| **School** | Mon & Wed | 10:30 AM - 5:00 PM |
| **ISOFlex Pay** | Wed (short weeks) | Every other Wednesday |
| **VA Disability** | 1st of month | Monthly |
| **Gunner** | Work days | Before (7:30 PM) & after (10:00 AM) |

Week pattern starts **Feb 18, 2026 = Short Week**, then alternates.

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Set up a PostgreSQL database (Vercel Postgres, Neon, or Supabase)
5. Deploy

The `vercel.json` and build scripts are pre-configured.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |
