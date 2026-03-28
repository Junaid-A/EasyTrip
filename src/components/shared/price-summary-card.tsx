import { formatCurrency } from "@/lib/helpers/format";

type PriceSummaryCardProps = {
  basePrice: number;
  additions?: number;
  totalPrice: number;
};

export function PriceSummaryCard({
  basePrice,
  additions = 0,
  totalPrice,
}: PriceSummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500">Price Summary</p>
          <h3 className="text-xl font-semibold text-slate-900">
            {formatCurrency(totalPrice)}
          </h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Base package</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Add-ons</span>
            <span>{formatCurrency(additions)}</span>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}