type MetricCardProps = {
  title: string;
  value: string;
  description: string;
};

export default function MetricCard({
  title,
  value,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className="mt-2 text-3xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}