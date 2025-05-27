import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/features/users/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export const UserCard = ({ userId, label }: { userId: string; label: string }) => {
  const { user, loading } = useUserProfile(userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        {loading ? (
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>
                {user?.username?.slice(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.username || 'Unknown User'}</p>
              <p className="text-sm text-muted-foreground">
                {user?.email || 'No email available'}
              </p>
              <p className="text-sm">
                User ID: <code className="text-xs">{userId}</code>
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};