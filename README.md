# MoneyTrack — Personal Money Management

A complete personal finance tracker: income, expenses, budgets, savings
goals, and reports, with Supabase authentication and a Postgres database
protected by Row Level Security. Built with Next.js (App Router),
TypeScript, Tailwind CSS, and Recharts, ready to deploy on Vercel.

## 1. Features

- Email/password auth (register, login, forgot/reset password) via Supabase Auth
- Dashboard with real-time balance, income, expenses, savings, charts, budget
  and savings-goal progress, and recent transactions
- Transactions: add/edit/delete, search, filter, sort, pagination
- Dedicated Income and Expense entry pages with custom categories
- Monthly budgets per category with automatic spend tracking and status
  (normal / near limit / exceeded)
- Savings goals with a full contribution history (deposits and withdrawals),
  never a single overwritten "current amount"
- Reports with date-range filters, five chart types, a detailed table, and
  CSV export
- Category management with safe delete (reassign or leave uncategorized)
- Settings: profile, currency, date format, theme (light/dark/system), and
  password change
- Fully responsive, dark mode, loading/empty/error states, toast notifications
- Every table protected by Postgres Row Level Security — a user can never
  read or write another user's data, even by editing an id in a request

## 2. Technology stack

- Next.js 14 (App Router) + TypeScript + React
- Tailwind CSS
- Supabase (Postgres + Auth) via `@supabase/ssr` and `@supabase/supabase-js`
- Recharts for charts, Lucide React for icons
- Deploys to Vercel, no traditional server process required

## 3. Folder structure

```
app/
  (auth)/            login, register, forgot-password, reset-password
  (dashboard)/        dashboard, transactions, income, expenses, budgets,
                       savings, reports, categories, settings
  auth/callback/      Supabase auth code exchange route
components/
  ui/                 Button, Input, Select, Modal, Card, Badge, etc.
  layout/              Sidebar, Header, MobileNav, DashboardShell
  dashboard/, charts/, transactions/, budgets/, savings/, categories/, settings/, reports/
  providers/          Theme and Toast providers
lib/
  supabase/           browser client, server client, middleware helper
  actions/             server actions (all database writes go through these)
  data/                 finance.ts — all totals/aggregations, derived from raw rows
  utils/, validations/
types/                 Database types + shared app types
supabase/
  migrations/0001_init.sql   full schema, RLS policies, triggers, seed function
  seed_demo.sql              OPTIONAL demo data — never runs automatically
```

## 4. Requirements

- Node.js 18.18+ (Node 20 LTS recommended)
- npm
- A free Supabase account (https://supabase.com)
- A Vercel account for deployment (optional for local use)

## 5. Local installation

```bash
npm install
```

## 6. Supabase setup

1. Go to https://supabase.com/dashboard and create a new project.
2. Wait for the project to finish provisioning.
3. Open **SQL Editor** in the left sidebar.
4. Open `supabase/migrations/0001_init.sql` from this project, copy its
   entire contents, paste into a new SQL Editor query, and click **Run**.
   This creates every table, index, trigger, and RLS policy, and sets up a
   function that automatically creates a profile and default categories for
   every new user.
5. Go to **Authentication -> Providers** and confirm **Email** is enabled
   (it is by default).
6. Go to **Authentication -> URL Configuration** and set:
   - **Site URL**: your local URL for now, e.g. `http://localhost:3000`
     (update this to your Vercel URL after deploying — see step 8 below)
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` (and later
     your Vercel domain's `/auth/callback`)
7. Go to **Project Settings -> API**. You'll need two values from this page:
   - **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys -> anon public** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 7. Environment variables

Copy the example file and fill in the two values from step 6.7 above:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

These are safe to expose in the browser — they are the public anon key,
which is designed for client-side use and is enforced by Row Level Security
on the server. Never put a Supabase **service role** key in this project or
in any `NEXT_PUBLIC_` variable.

## 8. Running locally

```bash
npm run dev
```

Open http://localhost:3000. Register an account — a profile and the default
categories (Food, Transport, Salary, etc.) are created for you automatically.
You'll land on `/dashboard` after login.

## 9. Optional demo data

`supabase/seed_demo.sql` is provided but **does nothing by itself**. To try
it: find your user id in Supabase under **Authentication -> Users**, replace
`YOUR-USER-UUID-HERE` in the file with that id, and run it manually in the
SQL Editor. It never runs automatically and never touches a real account
without you explicitly doing this.

## 10. GitHub setup

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/moneytrack.git
git push -u origin main
```

(`.env.local` is already excluded via `.gitignore` — never commit it.)

## 11. Vercel deployment

1. Go to https://vercel.com/new and import your GitHub repository.
2. In **Environment Variables**, add the same two variables from step 7:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy**. Vercel will detect Next.js automatically — no extra
   build configuration is needed.
4. Once deployed, copy your Vercel domain (e.g. `https://moneytrack.vercel.app`).
5. Back in Supabase **Authentication -> URL Configuration**, update:
   - **Site URL** to your Vercel domain
   - **Redirect URLs**: add `https://your-domain.vercel.app/auth/callback`
6. Test on the live site: register a new account, add an expense, add
   income, and confirm the dashboard totals update correctly.

## 12. Troubleshooting

- **"Invalid login credentials" on a correct password** — the account may
  not exist yet, or email confirmation is required. Check Supabase
  **Authentication -> Providers -> Email** settings; disable "Confirm email"
  while testing locally if you want instant sign-in after registration.
- **Redirected back to `/login` after signing in** — check that your
  Supabase **Redirect URLs** include the exact origin you're testing from
  (including the correct port for local dev).
- **Dashboard shows GH₵ 0.00 everywhere** — this is correct for a brand new
  account with no transactions yet; add a transaction to see it update.
- **Build fails on Vercel citing environment variables** — double-check both
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in
  the Vercel project's Environment Variables (Production **and** Preview).
- **RLS errors ("new row violates row-level security policy")** — this means
  a write was attempted with a mismatched or missing `user_id`. All writes in
  this app go through server actions in `lib/actions/*`, which always derive
  the user id from the authenticated session — never from client input. If
  you added a custom query, make sure you do the same.

## 13. Security notes

- Row Level Security is enabled on every user-data table (`profiles`,
  `categories`, `transactions`, `budgets`, `savings_goals`,
  `savings_contributions`). Every policy checks `auth.uid()` against the
  row's `user_id`, so no user can read or write another user's data even by
  editing an id client-side.
- All mutations run through Next.js Server Actions (`lib/actions/*`), which
  call `getAuthenticatedUser()` to read the verified session server-side —
  the app never trusts a `user_id` sent from the browser.
- Only the Supabase **anon** key is ever used, and only via
  `NEXT_PUBLIC_*` variables. The service role key is never used or required
  by this app.
- Passwords are handled entirely by Supabase Auth; this app never sees or
  stores raw passwords itself.

## 14. Changing the currency later

Settings -> Preferences lets any user switch their currency and symbol at
any time; the change applies immediately across the whole app because every
amount is formatted using the profile's stored `currency_symbol` rather than
a hard-coded value.
#   m o n e y t r a c k  
 