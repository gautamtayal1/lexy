import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/db/convex/_generated/api";

export function useCurrentUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current);
  return {
    isLoading: isLoading || (isAuthenticated && user === null),
    isAuthenticated: isAuthenticated && user !== null,
  };
}