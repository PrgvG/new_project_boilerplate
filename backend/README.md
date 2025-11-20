# Backend

Express backend with TypeScript, Prisma, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Run migrations (if needed):
```bash
npm run prisma:migrate
```

## Development

```bash
npm run dev
```

## Prisma Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Environment Variables

- `DATABASE_URL` - MongoDB connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

