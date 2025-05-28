import { getUserById } from '@/features/auth/api/authApi';
import type { UserProfile } from '@/features/report/types/report.types';
import { useEffect, useRef, useState } from 'react';
import type { User as ApiUser } from '../../types/user.types';

// Module-level cache for user profiles
const profileCache = new Map<string, UserProfile>();
// Module-level map for pending requests to avoid duplicate fetches
const pendingRequests = new Map<string, Promise<ApiUser>>();

export function useUserProfile(userId?: string) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // To ensure we don't set state on an unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      if (mountedRef.current) {
        setUser(null);
        setLoading(false);
        setError(null);
      }
      return;
    }

    const fetchUser = async () => {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      // Check cache first
      if (profileCache.has(userId)) {
        if (mountedRef.current) {
          setUser(profileCache.get(userId)!);
          setLoading(false);
        }
        return;
      }

      // Check if a request for this user is already pending
      let requestPromise = pendingRequests.get(userId);

      if (!requestPromise) {
        // If no pending request, create one
        requestPromise = getUserById(userId);
        pendingRequests.set(userId, requestPromise);
      }

      try {
        const apiUserData: ApiUser = await requestPromise;

        const userProfileData: UserProfile = {
          id: apiUserData.id,
          username: apiUserData.username,
          email: apiUserData.email,
          createdAt: apiUserData.created_at || new Date().toISOString(),
          avatarUrl: apiUserData.profile_picture || undefined,
        };

        if (mountedRef.current) {
          setUser(userProfileData);
          profileCache.set(userId, userProfileData); // Cache the successful result
        }
      } catch (err: any) {
        if (mountedRef.current) {
          let errorMessage = 'Failed to load user profile.';
          if (err.response) {
            if (err.response.status === 429) {
              errorMessage = 'Too many requests for user profiles. Please try again in a moment.';
            } else if (err.response.data && typeof err.response.data.message === 'string') {
              errorMessage = err.response.data.message;
            } else if (typeof err.response.data === 'string') {
              errorMessage = err.response.data;
            } else if (err.response.statusText) {
              errorMessage = `Error ${err.response.status}: ${err.response.statusText}`;
            }
          } else if (err.message) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        // Remove from pending requests map once settled (either success or failure)
        pendingRequests.delete(userId);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}