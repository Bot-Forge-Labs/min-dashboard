import { PublicLeaderboard } from "../../../../components/leveling/public-leaderboard"
import { notFound } from "next/navigation"

interface PublicLeaderboardPageProps {
  params: {
    guildId: string
  }
}

async function getGuildInfo(guildId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/public`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching guild info:", error)
    return null
  }
}

export async function generateMetadata({ params }: PublicLeaderboardPageProps) {
  const guild = await getGuildInfo(params.guildId)

  if (!guild) {
    return {
      title: "Leaderboard Not Found",
      description: "The requested leaderboard could not be found.",
    }
  }

  return {
    title: `${guild.name} - XP Leaderboard | Minbot`,
    description: `View the XP leaderboard for ${guild.name}. See who's leading in levels and experience points!`,
    openGraph: {
      title: `${guild.name} - XP Leaderboard`,
      description: `View the XP leaderboard for ${guild.name}`,
      images: guild.icon ? [`https://cdn.discordapp.com/icons/${params.guildId}/${guild.icon}.png`] : [],
    },
    twitter: {
      card: "summary",
      title: `${guild.name} - XP Leaderboard`,
      description: `View the XP leaderboard for ${guild.name}`,
    },
  }
}

export default async function PublicLeaderboardPage({ params }: PublicLeaderboardPageProps) {
  const guild = await getGuildInfo(params.guildId)

  if (!guild) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
      <PublicLeaderboard guildId={params.guildId} guild={guild} />
    </div>
  )
}
