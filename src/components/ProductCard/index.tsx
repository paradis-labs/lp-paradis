import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedHref } from "@/lib/locale-href";

const COPY: Record<Locale, { newTab: string; cursor: string }> = {
  en: { newTab: "(opens in a new tab)", cursor: "Explore" },
  pt: { newTab: "(abre num novo separador)", cursor: "Explorar" },
};

// O cartão de produto do v3, partilhado pela listagem `/products` e pelo
// "More Products" do detalhe: categoria e número, título, capa, descrição e
// tags. Uma âncora inteira.
//
// Leva à página de detalhe do produto quando ele tem slug, e ao site externo
// (num novo separador) quando não tem — um projecto sem slug não tem página.
export default function ProductCard({
  project,
  number,
  locale,
  style,
}: {
  project: Project;
  /** A posição na lista, a partir de 1; mostrada com dois dígitos. */
  number: number;
  locale: Locale;
  style?: React.CSSProperties;
}) {
  const copy = COPY[locale];
  const internal = Boolean(project.slug);
  const className =
    "group flex w-full flex-col gap-5 rounded-2xl border bg-cloud p-5 text-foreground transition-[border-color] duration-400 ease-soft hover:border-haze md:p-7 motion-reduce:transition-none";

  const body = (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[15px] leading-6 text-[#5b656a]">
          {project.category}
        </span>
        <span className="text-xl leading-7 text-[#5b656a] tabular-nums">
          {String(number).padStart(2, "0")}
        </span>
      </div>
      <h2 className="font-gilroy text-[30px] leading-[1.1] font-medium tracking-[-0.02em] md:text-4xl">
        {project.title}
      </h2>
      <div
        data-cursor-text={copy.cursor}
        className="relative flex h-65 items-center justify-center overflow-hidden rounded-xl bg-primary md:h-95"
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage.url}
            alt=""
            fill
            sizes="(min-width: 900px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-[ease] group-hover:scale-[1.065] motion-reduce:transition-none"
          />
        ) : (
          // Sem capa, a área fica com o nome — uma imagem partida ou um buraco
          // na grelha seriam piores.
          <span
            aria-hidden="true"
            className="font-gilroy text-5xl font-bold tracking-[-0.02em] text-white/90"
          >
            {project.title}
          </span>
        )}
      </div>
      <p className="max-w-130 text-lg leading-7 text-pretty text-muted-foreground">
        {project.description}
      </p>
      {project.tags.length > 0 ? (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border bg-white px-4 py-2 text-sm leading-5 text-primary"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );

  // A revelação vive num invólucro e não no cartão: a regra de `[data-rv-item]`
  // reescreve a `transition` para opacidade e deslocamento, e o contorno do
  // hover deixava de transitar.
  return (
    <div data-rv-item style={style} className="flex">
      {internal ? (
        <Link
          href={localizedHref(`/products/${project.slug}`, locale)}
          aria-label={project.title}
          className={className}
        >
          {body}
        </Link>
      ) : (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.title} ${copy.newTab}`}
          className={className}
        >
          {body}
        </a>
      )}
    </div>
  );
}
