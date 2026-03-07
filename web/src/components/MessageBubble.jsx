import { formatTime } from "../lib/utils";

export function MessageBubble({ message, currentUser }) {
  const isMe = message.sender?._id === currentUser?._id;

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} px-2 sm:px-0`}>
      <div
        className={`max-w-[85%] sm:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl ${
          isMe
            ? "bg-linear-to-r from-amber-500 to-orange-500 text-primary-content"
            : "bg-base-300/40 text-base-content"
        }`}
      >
        <p className="text-sm break-words">{message.text}</p>
        <p className={`text-xs mt-1 ${isMe ? "text-primary-content/80" : "text-base-content/70"}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
