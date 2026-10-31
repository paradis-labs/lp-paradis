import type { Project } from "@/content";
import type { Locale } from "@/i18n/routing";
import ProductCard from "../ProductCard";
import Reveal from "../Reveal";

const EMPTY: Record<Locale, string> = {
  en: "No products yet.",
  pt: "Ainda não há produtos.",
};

// A grelha de `/products` do v3 (`products-listing-page`): um cartão por
// projecto, pela ordem authorada. O cartão leva à página de detalhe do produto
// (`v3-product-detail`); o site externo fica no botão "Visit" dessa página.
export default function ProductsListing({
  items,
  locale,
}: {
  items: Project[];
  locale: Locale;
}) {
  if (items.length === 0) {
    return (
      <section className="flex w-full justify-center px-3 pt-6 pb-24 md:px-4 xl:px-0">
        <p className="w-full max-w-7xl text-lg text-muted-foreground">
          {EMPTY[locale]}
        </p>
      </section>
    );
  }

  return (
    <section className="flex w-full justify-center pt-6 pb-24">
      <Reveal
        group
        className="grid w-full max-w-7xl grid-cols-1 gap-6 px-3 min-[900px]:grid-cols-2 md:px-4 xl:px-0"
      >
        {items.map((project, index) => (
          <ProductCard
            key={project.key}
            project={project}
            number={index + 1}
            locale={locale}
            style={
              {
                "--rv-delay": `${(index * 0.12).toFixed(2)}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </Reveal>
    </section>
  );
}
