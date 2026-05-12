// src/components/TrackerCard.tsx

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function TrackerCard({ title, children }: Props) {
  return (
    <div className="rounded-2xl bg-zinc-900 p-5 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      {children}
    </div>
  );
}