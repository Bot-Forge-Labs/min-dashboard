# Minbot Dashboard

A comprehensive, modern Discord bot management dashboard built with Next.js 14, Supabase, and TypeScript. This dashboard provides a beautiful interface for managing Discord servers, users, commands, moderation actions, roles, giveaways, and announcements.

![Discord Bot Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 📊 Dashboard Overview
- **Real-time Statistics** - Server count, user count, command usage, moderation actions
- **Beautiful Glass-morphism UI** - Modern emerald-themed design with backdrop blur effects
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Loading States** - Smooth skeleton loading animations

### 🎭 Role Management
- **Discord Role Sync** - Import roles directly from your Discord server
- **Custom Role Creation** - Create roles with custom colors, permissions, and settings
- **Permission Badges** - Visual representation of role permissions
- **Role Deletion** - Remove custom roles (bot-managed roles are protected)
- **Guild Selection** - Manage roles across multiple Discord servers

### 🛡️ Moderation System
- **Moderation Logs** - Track all moderation actions with detailed information
- **Punishment Management** - View and manage active punishments
- **User Management** - Monitor server members and their activities
- **Action History** - Complete audit trail of moderation activities

### 🎮 Bot Management
- **Command Overview** - View all available bot commands with usage statistics
- **Server Management** - Monitor connected Discord servers
- **Analytics Dashboard** - Detailed insights into bot performance
- **Settings Panel** - Configure bot settings and preferences

### 🎁 Community Features
- **Giveaway Management** - Create and manage server giveaways
- **Announcement System** - Send formatted announcements to channels
- **Reaction Roles** - Set up reaction-based role assignment
- **Event Tracking** - Monitor community engagement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Discord Bot Token
- Supabase account
- Vercel account (for deployment)

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/discord-bot-dashboard.git
cd discord-bot-dashboard
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

### 3. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token

# Optional: Discord OAuth (for user authentication)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
\`\`\`

### 4. Database Setup

1. **Create Supabase Project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Migrations**
   \`\`\`bash
   # Execute the SQL scripts in order:
   # 1. scripts/create-tables.sql
   # 2. scripts/seed-data.sql
   # 3. scripts/update-roles-table.sql (if needed)
   \`\`\`

3. **Set up Row Level Security (RLS)**
   - Enable RLS on all tables in Supabase dashboard
   - Configure policies based on your authentication needs

### 5. Discord Bot Setup

1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application
   - Go to "Bot" section and create a bot
   - Copy the bot token

2. **Bot Permissions**
   Your bot needs these permissions:
   - `View Channels`
   - `Manage Roles`
   - `Manage Messages`
   - `Read Message History`
   - `Send Messages`
   - `Use Slash Commands`

3. **Invite Bot to Server**
   \`\`\`
   https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268435456&scope=bot%20applications.commands
   \`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🚀 Deployment

### Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Environment Variables**
   Add these environment variables in Vercel:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DISCORD_BOT_TOKEN=your_discord_bot_token
   \`\`\`

3. **Deploy**
   - Vercel will automatically deploy your application
   - Your dashboard will be available at `https://your-project.vercel.app`

### Alternative Deployment Options

- **Netlify**: Works with minor configuration changes
- **Railway**: Great for full-stack applications
- **DigitalOcean App Platform**: Scalable hosting option
- **Self-hosted**: Deploy on your own VPS

## 📁 Project Structure

\`\`\`
discord-bot-dashboard/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   ├── roles/                    # Role management components
│   ├── moderation/               # Moderation components
│   └── ...                       # Other feature components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configuration
│   ├── types/                    # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── scripts/                      # Database scripts
│   ├── create-tables.sql         # Database schema
│   ├── seed-data.sql             # Sample data
│   └── update-roles-table.sql    # Schema updates
├── hooks/                        # Custom React hooks
├── middleware.ts                 # Next.js middleware
└── package.json                  # Dependencies and scripts
\`\`\`

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications

### Backend
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Discord API** - Discord bot integration
- **Next.js API Routes** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🔧 Configuration

### Database Schema

The application uses the following main tables:

- `guilds` - Discord server information
- `users` - Discord user data
- `commands` - Bot command definitions
- `mod_logs` - Moderation action logs
- `roles` - Discord role management
- `giveaways` - Giveaway management
- `announcements` - Server announcements
- `reaction_roles` - Reaction role configurations

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `DISCORD_BOT_TOKEN` | Discord bot token | ✅ |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | ❌ |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret | ❌ |

## 📚 API Documentation

### Role Management

#### Sync Discord Roles
```http
POST /api/sync-discord-roles
Content-Type: application/json

{
  "guildId": "123456789012345678"
}
