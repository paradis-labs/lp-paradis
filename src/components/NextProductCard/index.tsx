import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/Glyphs";
import type { Project } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedHref } from "@/lib/locale-href";

const COPY: Record<Locale, { cta: string; newTab: string; cursor: string }> = {
  en: {
    cta: "View product",
    newTab: "(opens in a new tab)",
    cursor: "Explore",
  },
  pt: {
    cta: "Ver produto",
    newTab: "(abre num novo separador)",
    cursor: "Explorar",
  },
};

// O cartão largo de "Next product" no detalhe de produto: texto à esquerda
// (5fr) e capa à direita (7fr); abaixo de 1024px empilha, com a capa em cima.
// Uma âncora inteira, com o mesmo destino do `ProductCard`: o detalhe quando o
// projecto tem slug, o site externo quando não tem.
export default function NextProductCard({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const copy = COPY[locale];
  const className =
    "group grid overflow-hidden rounded-2xl border bg-cloud text-foreground transition-[border-color] duration-400 ease-soft hover:border-haze lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] motion-reduce:transition-none";

  const body = (
    <>
      <div className="order-2 flex flex-col justify-between gap-10 p-10 lg:order-none">
        <div className="flex flex-col gap-4">
          {project.category ? (
            <span className="text-[15px] leading-6 text-[#5b656a]">
              {project.category}
            </span>
          ) : null}
          <h3 className="gradient-text pb-1 font-gilroy text-[56px] leading-none font-bold tracking-[-0.035em] break-words">
            {project.title}
          </h3>
          <p className="max-w-105 text-lg leading-7 text-pretty text-[#31373d]">
            {project.description}
          </p>
        </div>
        <div className="flex flex-col gap-6">
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
          <FakeButton>{copy.cta}</FakeButton>
        </div>
      </div>
      <div
        data-cursor-text={copy.cursor}
        className="relative flex min-h-80 items-center justify-center overflow-hidden bg-cover-ground lg:min-h-115"
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover transition-transform duration-500 ease-[ease] group-hover:scale-[1.065] motion-reduce:transition-none"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-gilroy text-[56px] font-bold tracking-[-0.03em] text-white/90"
          >
            {project.title}
          </span>
        )}
      </div>
    </>
  );

  return project.slug ? (
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
  );
}

// O "View product": o aspecto do `Button` primary com `circleIcon` e
// `textSwap`, mas um `<span>`, porque não pode haver um link dentro do link do
// cartão. O `Button` não renderiza um `span` com as camadas (o `asChild` perde
// o `swap`), por isso as camadas estão aqui, com o `group` do cartão a
// comandar o hover. `aria-hidden`: o nome do link já é o título do produto.
function FakeButton({ children }: { children: string }) {
  return (
    <span
      aria-hidden="true"
      className="relative isolate inline-flex min-h-12 items-center gap-3 self-start overflow-hidden rounded-full border-2 border-primary bg-primary py-1.5 pr-[7px] pl-6 text-base font-medium text-nowrap text-white transition-colors duration-500 ease-fill group-hover:text-primary"
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span className="block size-full translate-y-[101%] rounded-t-[50%] bg-white transition-[transform,border-radius] duration-500 ease-fill group-hover:translate-y-0 group-hover:rounded-none" />
      </span>
      <span className="relative z-10 inline-flex items-center gap-3">
        <span className="relative inline-grid overflow-hidden">
          <span className="col-start-1 row-start-1 block transition-transform duration-800 ease-roll group-hover:-translate-y-full">
            {children}
          </span>
          <span className="col-start-1 row-start-1 block translate-y-full transition-transform duration-800 ease-roll group-hover:translate-y-0">
            {children}
          </span>
        </span>
        <span className="relative inline-flex size-7.5 shrink-0 overflow-hidden rounded-full bg-white text-primary transition-colors duration-500 ease-fill group-hover:bg-primary group-hover:text-white">
          <span className="absolute inset-0 flex items-center justify-center transition-transform duration-800 ease-roll group-hover:-translate-y-full">
            <ArrowRight size={18} />
          </span>
          <span className="absolute inset-0 flex translate-y-full items-center justify-center transition-transform duration-800 ease-roll group-hover:translate-y-0">
            <ArrowRight size={18} />
          </span>
        </span>
      </span>
    </span>
  );
}
