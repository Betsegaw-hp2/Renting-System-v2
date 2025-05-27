import { useUserProfile } from "@/features/users/useUserProfile";


export const UserCell = ({ userId }: { userId: string }) => {
  const { user, loading, error } = useUserProfile(userId);

  if (loading) return <div className="h-4 w-24 animate-pulse rounded bg-muted" />;
  if (error) return <span className="text-red-500">Error</span>;

  return (
    <div className="flex items-center gap-2">
      {user?.avatarUrl && (
        <img 
          src={user.avatarUrl} 
          alt={user.username}
          className="h-6 w-6 rounded-full"
        />
      )}
      <div>
        <div className="font-medium">{user?.username || 'Unknown User'}</div>
        <div className="text-sm text-muted-foreground">{user?.email}</div>
      </div>
    </div>
  );
};