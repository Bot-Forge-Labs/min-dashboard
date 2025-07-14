# 🤖 Minbot Dashboard

A modern, feature-rich dashboard for managing Minies Cottage built with Next.js, Supabase, and shadcn/ui.

![Discord Bot Dashboard](https://img.shields.io/badge/Discord-Bot%20Dashboard-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 📊 **Real-time Analytics** - Monitor server statistics and user activity
- 🎭 **Role Management** - Create, edit, and sync Discord roles with permissions
- ⚡ **Command Management** - Organize and manage bot commands with subcommands
- 🛡️ **Moderation Tools** - Track moderation actions and user punishments
- 🎉 **Giveaway System** - Create and manage server giveaways
- 📢 **Announcements** - Send and schedule server announcements
- 🔄 **Reaction Roles** - Set up automatic role assignment via reactions
- 👥 **User Management** - View and manage server members
- 🔐 **Discord OAuth** - Secure authentication with Discord
- 📱 **Responsive Design** - Works perfectly on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Discord Bot Token
- Supabase account
- Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/discord-bot-dashboard.git
cd discord-bot-dashboard
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Discord Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Database Setup

Run the database migration scripts:

```bash
# Execute in your Supabase SQL editor or via CLI
psql -h your-supabase-host -U postgres -d postgres -f scripts/create-tables.sql
psql -h your-supabase-host -U postgres -d postgres -f scripts/seed-data.sql
psql -h your-supabase-host -U postgres -d postgres -f scripts/update-roles-table.sql
```

### 4. Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token to your environment variables
5. Enable required bot permissions:
   - Manage Roles
   - Manage Channels
   - Send Messages
   - Manage Messages
   - Read Message History
   - Add Reactions

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your dashboard!

## 🌐 Deployment

### Deploy to Vercel

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables**
   
   Go to your Vercel dashboard → Project Settings → Environment Variables and add:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | \`NEXT_PUBLIC_SUPABASE_URL\` | Your Supabase project URL | Production |
   | \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Your Supabase anon key | Production |
   | \`SUPABASE_SERVICE_ROLE_KEY\` | Your Supabase service role key | Production |
   | \`DISCORD_BOT_TOKEN\` | Your Discord bot token | Production |
   | \`NEXT_PUBLIC_DISCORD_CLIENT_ID\` | Your Discord client ID | Production |
   | \`DISCORD_CLIENT_SECRET\` | Your Discord client secret | Production |
   | \`NEXTAUTH_URL\` | Your production URL | Production |
   | \`NEXTAUTH_SECRET\` | Random secret string | Production |

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Alternative Deployment Options

- **Netlify**: Connect your GitHub repository
- **Railway**: One-click deployment with database
- **DigitalOcean App Platform**: Container-based deployment

## 📁 Project Structure

```
discord-bot-dashboard/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard-specific components
│   ├── roles/                    # Role management components
│   └── ...                       # Other feature components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configuration
│   ├── types/                    # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── scripts/                      # Database scripts
│   ├── create-tables.sql         # Initial table creation
│   ├── seed-data.sql             # Sample data insertion
│   └── update-roles-table.sql    # Schema updates
├── hooks/                        # Custom React hooks
└── middleware.ts                 # Next.js middleware
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ | - |
| `DISCORD_BOT_TOKEN` | Discord bot token | ✅ | - |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | Discord application client ID | ✅ | - |
| `DISCORD_CLIENT_SECRET` | Discord application client secret | ✅ | - |
| `NEXTAUTH_URL` | Application URL | ✅ | http://localhost:3000 |
| `NEXTAUTH_SECRET` | NextAuth.js secret | ✅ | - |

### Discord Bot Permissions

Minbot needs the following permissions:

- `Manage Roles` (268435456)
- `Manage Channels` (16)
- `Send Messages` (2048)
- `Manage Messages` (8192)
- `Read Message History` (65536)
- `Add Reactions` (64)

**Permission Integer**: \`268521472\`

**Invite URL Template**:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=268521472&scope=bot
```

## 📚 API Documentation

### Role Sync Endpoint

Sync Discord roles with your database.

**Endpoint**: `POST /api/sync-discord-roles`

**Request Body**:
```json
{
  "guildId": "123456789012345678"
}
```

**Response**:
```json
{
  "success": true,
  "count": 15,
  "message": "Successfully synced 15 roles from Discord"
}
```

### Error Handling

The API provides detailed error messages for common issues:

- **401 Unauthorized**: Invalid Discord bot token
- **403 Forbidden**: Bot lacks permissions
- **404 Not Found**: Guild not found
- **500 Internal Server Error**: Database or server issues

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git fork https://github.com/yourusername/discord-bot-dashboard.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open Pull Request**
   - Describe your changes
   - Include screenshots if applicable
   - Reference any related issues

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
```
Error: Database connection failed
```
**Solution**: Check your Supabase URL and anon key in environment variables.

#### Discord API Errors
```
Error: Invalid Discord bot token
```
**Solution**: Verify your bot token in Vercel environment variables.

#### Role Sync Issues
```
Error: Bot does not have permission to access this guild
```
**Solution**: Ensure your bot has the required permissions and is added to the server.

### Debug Mode

Enable debug logging by adding to your environment:
```env
NODE_ENV=development
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Supabase](https://supabase.com/) - The open source Firebase alternative
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Discord.js](https://discord.js.org/) - Discord API library inspiration
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: [GitHub Issues](https://github.com/yourusername/discord-bot-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/discord-bot-dashboard/discussions)
- **Discord**: Join our [Discord Server](https://discord.gg/your-invite) for community support

---

**Made with ❤️ for the Discord community**

*Star ⭐ this repository if you found it helpful!*
