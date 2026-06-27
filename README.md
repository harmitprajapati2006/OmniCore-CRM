# EstateFlow CRM

EstateFlow is a production-ready, cloud-based, mobile-first Real Estate CRM designed for sales teams to manage leads, schedule follow-ups, organize properties, and track field attendance seamlessly.

## Features

- **Mobile-First Design**: Fully responsive interface optimized for mobile with a bottom navigation bar, touch-friendly targets, and smooth sliding animations.
- **Lead Management**: Complete lead tracking with status pipelines, temperature indicators, and automated assignment options (round-robin).
- **Property Catalog**: Manage properties with image galleries, detailed specifications (BHK, size, amenities), and one-click sharing links.
- **Follow-up Reminders**: Tabbed dashboard for overdue, today's, and upcoming follow-ups, with quick actions.
- **Communication Integration**: 
  - One-click WhatsApp deep-linking.
  - Click-to-call integration.
  - Twilio Voice bridge / webhook infrastructure included.
- **Team & Attendance Management**: GPS-based check-in/out for field executives with late-arrival detection.
- **Social Media Calendar**: Manage your team's social media content, schedule posts, and generate captions with AI.
- **Multi-Tenant Architecture**: Built on Supabase with Row Level Security (RLS) ensuring strict isolation across different organizations.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database & Auth**: Supabase (Postgres)
- **Storage**: Supabase Storage
- **Hosting Strategy**: Vercel ready

## Prerequisites

- Node.js 18+
- Supabase Project (Database, Auth, Storage)

## Environment Variables

Create a `.env.local` file based on the provided `.env.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

# Integrations (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
RESEND_API_KEY=
OPENAI_API_KEY=
WEBHOOK_SECRET=your_secure_webhook_secret
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Apply Migrations**:
   Run the SQL scripts in `supabase/migrations/` sequentially on your Supabase SQL Editor.

3. **Seed Database**:
   Populate your database with sample data:
   ```bash
   npx tsx scripts/seed.ts
   ```
   *Login credentials for the sample admin user will be printed in the console.*

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Open App**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Architecture Notes

- **Adapters**: External services (Twilio, Email, AI) use a clean adapter pattern (`src/services/`) ensuring UI components remain decoupled.
- **Dry-Run Mode**: Services like messaging and calling default to "dry-run" mode, logging to the console until API keys are provided.
- **Webhooks**: Located in `src/app/api/webhooks/`, ready to receive leads from platforms like Facebook Ads, MagicBricks, Housing.com, or Zapier.

## License

MIT License.
