import { SendIcon } from "lucide-react";

export function ChatInput({ value, onChange, onSubmit, disabled }) {
  return (
    <form onSubmit={onSubmit} className="p-3 sm:p-4 border-t border-base-300 bg-base-100">
      <div className="flex items-center gap-2 sm:gap-3">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Type a message..."
          className="input input-bordered flex-1 rounded-xl bg-base-300/40 border-base-300 placeholder:text-base-content/60 text-sm sm:text-base h-10 sm:h-12"
        />
        <button
          type="submit"
          disabled={disabled}
          className="btn rounded-xl bg-linear-to-r from-amber-500 to-orange-500 border-none disabled:btn-disabled min-h-10 h-10 sm:min-h-12 sm:h-12 px-3 sm:px-4"
        >
          <SendIcon className="size-4 sm:size-5" />
        </button>
      </div>
    </form>
  );
}
