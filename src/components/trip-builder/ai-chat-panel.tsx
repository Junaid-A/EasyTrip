"use client";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Props = {
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
};

export function AIChatPanel({ messages, input, onInputChange, onSend }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-950">Ask AI to refine your trip</p>
        <p className="text-xs text-slate-500">Change hotel style, budget, area, or sightseeing</p>
      </div>

      <div className="max-h-[340px] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "assistant"
                ? "bg-white text-slate-800"
                : "ml-auto bg-slate-900 text-white"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Example: Show me a cheaper 4 star option in Sukhumvit"
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
        />
        <button
          type="button"
          onClick={onSend}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Send
        </button>
      </div>
    </div>
  );
}