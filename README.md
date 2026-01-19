# Pinak

A modern monorepo project built with Turborepo, featuring a Node.js API, Expo React Native mobile app, and Vite React web app. This setup provides a scalable foundation for full-stack development with shared packages for UI components, TypeScript configurations, and ESLint rules.

## Tech Stack

- **Monorepo Management**: Turborepo
- **Language**: TypeScript
- **Linting & Formatting**: ESLint, Prettier
- **API**: Node.js, Express, Prisma (PostgreSQL), Zod validation
- **Mobile**: Expo, React Native, Expo Router
- **Web**: Vite, React
- **Shared Packages**: UI components (React), TypeScript configs, ESLint configs

## Apps and Packages

### Apps

- **`apps/api`**: Node.js REST API with Express, Prisma ORM, PostgreSQL database, rate limiting, logging, and input validation.
- **`apps/mobile`**: Expo React Native app with navigation, haptic feedback, and shared UI components.
- **`apps/web`**: Vite-based React web app with shared UI components.

### Packages

- **`packages/ui`**: Shared React component library (buttons, cards, etc.).
- **`packages/eslint-config`**: Shared ESLint configurations for consistent code quality.
- **`packages/types`**: Shared TypeScript type definitions.
- **`packages/typescript-config`**: Shared TypeScript configurations for apps and packages.

## Prerequisites

- Node.js >= 18
- npm (or yarn/pnpm)
- PostgreSQL database (local or cloud, e.g., Prisma Postgres)
- For mobile: Expo CLI (`npm install -g @expo/cli`)

## Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd pinak
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env` in each app directory:
     ```bash
     cp apps/api/.env.example apps/api/.env
     cp apps/web/.env.example apps/web/.env
     cp apps/mobile/.env.example apps/mobile/.env
     ```
   - Edit each `.env` file with your actual values (see `ENV_SETUP.md` for details).
   - For the API, ensure `DATABASE_URL` points to your PostgreSQL database.

4. **Set up the database**:
   - Navigate to the API app:
     ```bash
     cd apps/api
     ```
   - Generate Prisma client:
     ```bash
     npm run prisma:generate
     ```
   - Run database migrations:
     ```bash
     npm run prisma:migrate:dev
     ```
   - (Optional) Open Prisma Studio to view/edit data:
     ```bash
     npm run prisma:studio
     ```

5. **Build shared packages** (if needed):
   ```bash
   npm run build
   ```

## Running the Project

### All Apps

```bash
npm run dev
```

### Individual Apps

- **API**:
  ```bash
  npm run dev:api  # or cd apps/api && npm run dev
  ```
- **Web**:
  ```bash
  npm run dev:web  # or cd apps/web && npm run dev
  ```
- **Mobile**:
  ```bash
  npm run dev:mobile  # or cd apps/mobile && npm run dev
  ```
  Then use Expo Go app or simulator.

## Building

### All Apps and Packages

```bash
npm run build
```

### Individual Apps

- **API**: `cd apps/api && npm run build`
- **Web**: `cd apps/web && npm run build`
- **Mobile**: `cd apps/mobile && npx expo build`

## Other Commands

- **Linting**: `npm run lint`
- **Type Checking**: `npm run check-types`
- **Formatting**: `npm run format`
- **Prisma Studio**: `npm run prisma:studio`

## Project Structure

```
pinak/
├── apps/
│   ├── api/          # Node.js Express API with Prisma
│   ├── mobile/       # Expo React Native app
│   └── web/          # Vite React app
├── packages/
│   ├── ui/           # Shared React components
│   ├── eslint-config/# Shared ESLint configs
│   ├── types/        # Shared TypeScript types
│   └── typescript-config/  # Shared TS configs
├── package.json
├── turbo.json
└── README.md
```

## Contributing

1. Follow the existing code style (ESLint + Prettier).
2. Run tests and linting before committing.
3. Use conventional commits for PRs.

## License

See `LICENSE` file.

```
cd my-turborepo

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
