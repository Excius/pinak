# Environment Variables Setup

This monorepo uses **individual environment variable files** for each app. Each app has its own `.env` file in its directory for better isolation and easier management.

## Setup

1. Copy the `.env.example` to `.env` in each app directory:

   ```bash
   # API
   cp apps/api/.env.example apps/api/.env

   # Web
   cp apps/web/.env.example apps/web/.env

   # Mobile
   cp apps/mobile/.env.example apps/mobile/.env
   ```

2. Edit each `.env` file with your actual values

## How it Works

- **API (Express)**: Loads from `apps/api/.env`
- **Web (Vite)**: Loads from `apps/web/.env` (VITE_ prefixed vars exposed to client)
- **Mobile (Expo)**: Loads from `apps/mobile/.env` (EXPO_PUBLIC_ prefixed vars exposed to client)

## Benefits

- ✅ Isolated environment variables per app
- ✅ Easier to manage app-specific configurations
- ✅ No cross-app dependency issues
- ✅ Clear separation of concerns

## Important Notes

- **Never commit `.env` files** - they're already in `.gitignore`
- **Vite (Web app)**: Only variables prefixed with `VITE_` are exposed to the client-side code
- **Expo (Mobile app)**: Only variables prefixed with `EXPO_PUBLIC_` are exposed to the client-side code
- **Turborepo**: Environment files are included in build cache invalidation

## Development

After setting up the `.env` files in each app directory, you can run the apps:

```bash
# All apps
npm run dev

# Individual apps
cd apps/api && npm run dev
cd apps/web && npm run dev
cd apps/mobile && npm run dev
```

## Production

For production deployments, set environment variables in your hosting platform (Vercel, Railway, etc.) instead of using `.env` files.
