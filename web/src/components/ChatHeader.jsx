import { useSocketStore } from "../lib/socket";

import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";

export function ChatHeader({ participant, chatId }) {
  const navigate = useNavigate();
  const { onlineUsers, typingUsers } = useSocketStore();
  const isOnline = onlineUsers.has(participant?._id);
  // const isTyping = !!typingUsers.get(chatId);
  const typingUserId = typingUsers.get(chatId);
  const isTyping = typingUserId && typingUserId === participant?._id;

  return (
    <div className="h-14 sm:h-16 px-3 sm:px-6 border-b border-base-300 flex items-center gap-3 sm:gap-4 bg-base-200/80">
      <button 
        onClick={() => navigate('/chat')}
        className="md:hidden btn btn-ghost btn-sm btn-circle"
      >
        <ArrowLeftIcon className="w-5 h-5" />
      </button>
      <div className="relative">
        <img src={participant?.avatar} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-base-300/40" alt="" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-sm sm:text-base truncate">{participant?.name}</h2>
        <p className="text-xs text-base-content/70">
          {isTyping ? "typing..." : isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
}
