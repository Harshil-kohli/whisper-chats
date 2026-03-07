import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import { useAuth } from "@clerk/clerk-react";

export const useCurrentUser = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = await getToken();
      const { data } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
};
