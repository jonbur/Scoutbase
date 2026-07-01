import { PremisesNav } from "@/components/premises/PremisesNav";

type PremisesPageHeaderProps = {
  premisesId: string;
  premisesName: string;
  address: string;
  eyebrow: string;
  description?: string;
};

export function PremisesPageHeader({
  premisesId,
  premisesName,
  address,
  eyebrow,
  description,
}: PremisesPageHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {premisesName}
        </h1>
        <p className="mt-1 text-slate-600">{address}</p>
        {description ? (
          <p className="mt-4 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      <PremisesNav premisesId={premisesId} />
    </div>
  );
}
