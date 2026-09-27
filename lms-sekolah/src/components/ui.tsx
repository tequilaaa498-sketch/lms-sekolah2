import Link from "next/link";

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-5xl sm:text-6xl text-lms-dark">{title}</h1>
        {subtitle && <p className="mt-3 text-lms-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PillButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-lms-primary px-6 py-3.5 text-white transition hover:opacity-90 disabled:opacity-60 ${
        props.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

export function PillLinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full bg-lms-primary px-6 py-3.5 text-white transition hover:opacity-90"
    >
      {children}
    </Link>
  );
}

export function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[29px] bg-lms-primary/20 px-6 py-5">
      <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-lms-primary font-display text-2xl text-lms-primary">
        {value}
      </span>
      <span className="text-lms-dark">{label}</span>
    </div>
  );
}

export function ActionCard({
  href,
  badge,
  title,
  description,
}: {
  href: string;
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-[29px] border-4 border-dashed border-lms-primary bg-lms-bg p-6 transition hover:bg-lms-primary/10"
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lms-primary text-sm font-medium text-lms-dark">
        {badge}
      </span>
      <p className="font-sans text-xl font-semibold text-lms-dark">{title}</p>
      <p className="mt-2 text-sm text-lms-muted">{description}</p>
    </Link>
  );
}

export function StatusBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-lms-primary-badge px-4 py-1.5 text-xs text-lms-dark whitespace-nowrap">
      {children}
    </span>
  );
}

export function DataTable({
  columns,
  children,
}: {
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="hidden gap-4 px-6 py-3 text-lg font-semibold text-lms-label sm:grid"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function DataRow({
  values,
  columns,
}: {
  values: React.ReactNode[];
  columns: number;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-2 rounded-2xl border-3 border-lms-primary bg-lms-bg px-6 py-4 sm:gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {values.map((v, i) => (
        <div key={i} className="flex items-center font-semibold text-lms-dark">
          {v}
        </div>
      ))}
    </div>
  );
}

export function TextField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-lms-dark">{label}</span>
      <input
        {...props}
        className={`w-full rounded-2xl border-3 border-lms-primary bg-lms-bg px-5 py-4 text-lms-dark outline-none placeholder:text-lms-muted ${
          props.className ?? ""
        }`}
      />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-lms-dark">{label}</span>
      <select
        {...props}
        className={`w-full rounded-2xl border-3 border-lms-primary bg-lms-bg px-5 py-4 text-lms-dark outline-none ${
          props.className ?? ""
        }`}
      >
        {children}
      </select>
    </label>
  );
}
