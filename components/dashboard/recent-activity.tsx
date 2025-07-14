import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { getRecentActivity } from "@/lib/supabase/queries";
import { AlertCircle } from "lucide-react";

const getTypeColor = (action: string) => {
  switch (action.toLowerCase()) {
    case "ban":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "warn":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "kick":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "timeout":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "unban":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
};

export async function RecentActivity() {
  const activities = await getRecentActivity(10);

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-emerald-400/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Recent Activity</CardTitle>
        <CardDescription className="text-emerald-200/80">
          Latest moderation actions across all servers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-emerald-400/40 mx-auto mb-4" />
            <p className="text-emerald-200/60 mb-2">No recent activity</p>
            <p className="text-sm text-emerald-300/40">
              Configure your Supabase connection to see moderation logs
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-emerald-400/10"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium capitalize">
                    {activity.action ?? "Unknown"}
                  </span>
                  <Badge
                    variant="outline"
                    className={getTypeColor(activity.action ?? "")}
                  >
                    {activity.action ?? "unknown"}
                  </Badge>
                </div>
                <div className="text-sm text-emerald-200/70">
                  {activity.user_username || activity.user_id}
                  {activity.moderator_username &&
                    ` by ${activity.moderator_username}`}
                </div>
              </div>
              <span className="text-xs text-emerald-300/60">
                {activity.created_at
                  ? formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })
                  : "Unknown time"}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
