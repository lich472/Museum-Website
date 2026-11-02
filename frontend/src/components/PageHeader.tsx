interface Props {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
}

export default function PageHeader({ eyebrow, title, description, image }: Props) {
  return (
    <header className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 text-white border-b-[5px]">
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30"
          />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
          {eyebrow}
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>

        <span aria-hidden="true" className="mt-5 block h-1 w-16 rounded-full bg-amber-500" />

        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">
          {description}
        </p>
      </div>
    </header>
  );
}