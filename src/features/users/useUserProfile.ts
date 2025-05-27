import type { UserProfile } from '@/features/report/types/report.types';
import { useEffect, useState } from 'react';

const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    username: 'john_doe',
    email: 'john@example.com',
    createdAt: '2023-01-15T08:00:00Z'
  },
  {
    id: 'user-2',
    username: 'jane_smith',
    email: 'jane@example.com',
    createdAt: '2023-02-20T10:30:00Z'
  }
];

export function useUserProfile(userId?: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API call
        // const response = await apiClient.get(`/users/${userId}`);
        // const userData = toCamelCase(response.data);
        
        // Mock implementation
        const mockUser = MOCK_USERS.find(u => u.id === userId) || {
          id: userId,
          username: `user_${userId.slice(0, 6)}`,
          email: `${userId.slice(0, 6)}@example.com`,
          createdAt: new Date().toISOString()
        };
        
        setUser(mockUser);
      } catch (error) {
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}