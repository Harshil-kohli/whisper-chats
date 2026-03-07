import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import api from "../lib/axios";

export const useChats = () => {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const token = await getToken();
      const res = await api.get("/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
  });
};

export const useGetOrCreateChat = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId) => {
      const token = await getToken();
      const res = await api.post(
        `/chats/with/${participantId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["chats"] }),
  });
};
