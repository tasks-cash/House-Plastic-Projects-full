# AgroPulse

Greenhouse finance management system — frontend prototype with mock data.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4070](http://localhost:4070)

Production build:

```bash
pnpm build
pnpm start
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Redirects to `/login` |
| `/login` | Mock login (phone, email, or username) |
| `/dashboard` | Overview with summary stats |
| `/sales` | Sales management |
| `/debts` | Debts management |
| `/expenses` | Expenses management |
| `/employees` | Employees |
| `/tasks` | Tasks |
| `/daily-reports` | Daily reports |

## Mock login

| Method | Value |
|--------|-------|
| Email | `owner@tasks.cash` |
| Username | `owner` |
| Phone | `+213000000000` |
| Password | `1421998A` |

Session is stored in `localStorage` as `agropulse_auth=true`. Logout clears it.

## Android app

Native WebView wrapper lives in `android/`. Open that folder in Android Studio to build the **AgroPulse** APK. It loads `https://agro.rafalszelenc.store/login`.

## Notes

Frontend-only prototype. No MongoDB, JWT, API routes, or backend required.
# House-Plastic-Projects-full
