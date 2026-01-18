# Environment Variables Setup

This monorepo uses **centralized environment variable management**. All environment variables are stored in a single `.env` file at the root of the monorepo.

## Setup

1. Copy the root `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values (database URLs, secrets, API URLs, etc.)

## How it Works

- **All apps load from the root `.env` file**
- **API (Express)**: Configured to load from `../../.env` (monorepo root)
- **Web (Vite)**: `envDir` set to monorepo root in `vite.config.ts`
- **Future apps**: Configure them to load from the root `.env`

## Benefits

- ✅ Single source of truth for all environment variables
- ✅ Easy to manage and update
- ✅ No duplication across apps
- ✅ Consistent values across the monorepo

## Important Notes

- **Never commit `.env` files** - they're already in `.gitignore`
- **Vite (Web app)**: Only variables prefixed with `VITE_` are exposed to the client-side code
- **Turborepo**: Environment files are included in build cache invalidation

## Development

After setting up the `.env` file, you can run the apps:

```bash
# All apps
npm run dev

# Individual apps
cd apps/api && npm run dev
cd apps/web && npm run dev
```

## Production

For production deployments, set environment variables in your hosting platform (Vercel, Railway, etc.) instead of using `.env` files.
