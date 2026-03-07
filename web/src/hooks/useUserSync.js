import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "../lib/axios";

function useUserSync() {
  const { isSignedIn, getToken } = useAuth();

  const {
    mutate: syncUser,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await api.post(
        "/auth/callback",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
  });

  useEffect(() => {
    if (isSignedIn && !isPending && !isSuccess) {
      syncUser();
    }
  }, [isSignedIn, syncUser, isPending, isSuccess]);

  return { isSynced: isSuccess, isSyncing: isPending };
}
export default useUserSync;
