import { useUserProfile } from "@/features/users/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

export const UserCompactCard = ({ userId, label }: { userId: string; label: string }) => {
  const { user } = useUserProfile(userId);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user?.avatarUrl} />
        <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user?.username || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground truncate">
          {label} · <code className="text-[0.7rem]">{userId}</code>
        </p>
      </div>
    </div>
  );
};