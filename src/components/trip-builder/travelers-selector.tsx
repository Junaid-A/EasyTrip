"use client";

type Props = {
  adults: number;
  children: number;
  rooms: number;
  onChange: (values: { adults?: number; children?: number; rooms?: number }) => void;
};

function Counter({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-800"
          >
            -
          </button>
          <span className="w-8 text-center text-sm font-semibold text-slate-950">{value}</span>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-slate-800"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function TravelersSelector({ adults, children, rooms, onChange }: Props) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-950">Who is travelling?</p>
        <p className="text-xs text-slate-500">Set travellers and rooms</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Counter label="Adults" value={adults} min={1} onChange={(next) => onChange({ adults: next })} />
        <Counter label="Children" value={children} min={0} onChange={(next) => onChange({ children: next })} />
        <Counter label="Rooms" value={rooms} min={1} onChange={(next) => onChange({ rooms: next })} />
      </div>
    </div>
  );
}