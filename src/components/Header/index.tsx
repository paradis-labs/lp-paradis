import { ArrowRightDown } from "@solar-icons/react";
import type { NavBar as NavBarContent } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedHref } from "@/lib/locale-href";
import Button from "../Button";
import { NavBar } from "../NavBar";
import { NavActiveProvider } from "../NavBar/NavActiveContext";
import type {
  MobileMenuButton,
  MobileMenuLink,
} from "../NavBar/NavBarMobileMenu";

const HOME_LABEL: Record<Locale, string> = {
  en: "Paradis — home",
  pt: "Paradis — início",
};

interface HeaderProps extends NavBarContent {
  locale: Locale;
}

// O hash de secção de um link do CMS, calculado sobre o `url` CRU, antes do
// prefixo de locale — é o que o `NavActiveProvider` observa.
const sectionHash = (url: string) =>
  url.includes("#") ? url.split("#")[1] : undefined;

export default async function Header({ locale, ...args }: HeaderProps) {
  const logoSrc = args.logo?.image?.url ?? "/logo.svg";
  const logoHref = localizedHref(args.logo?.url ?? "/", locale);
  const logoWidth = args.logo?.width ?? 134;
  const logoHeight = args.logo?.height ?? 25;

  // Os destinos são resolvidos aqui, no servidor, uma vez, e servem a barra e
  // o menu mobile. Os componentes de cliente não importam `@/i18n` — ver o
  // custo medido em `lib/locale-href.ts`.
  const links: MobileMenuLink[] = args.links.map((link) => ({
    key: link.key,
    label: link.label,
    href: localizedHref(link.url, locale),
    hash: sectionHash(link.url),
    openInNewTab: link.openInNewTab,
  }));

  const buttons: MobileMenuButton[] = args.buttons.map((btn) => ({
    key: btn.key,
    label: btn.label,
    href: btn.url.trim() ? localizedHref(btn.url, locale) : null,
    variant: btn.variant,
    openInNewTab: btn.openInNewTab,
  }));

  const sectionIds = links
    .map((link) => link.hash)
    .filter((hash): hash is string => !!hash);

  return (
    <NavActiveProvider ids={sectionIds}>
      <NavBar.Root>
        <NavBar.Logo
          imgSrc={logoSrc}
          href={logoHref}
          width={logoWidth}
          height={logoHeight}
          label={HOME_LABEL[locale]}
        />
        <NavBar.ItemList>
          {links.map((link) => (
            <NavBar.Item
              key={link.key}
              href={link.href}
              hash={link.hash}
              openInNewTab={link.openInNewTab}
            >
              {link.label}
            </NavBar.Item>
          ))}
        </NavBar.ItemList>
        {/* A partir de `md` o switch e os CTAs ficam na barra; abaixo disso
            vivem dentro do menu mobile, que os recebe por props. */}
        <div className="hidden items-center gap-2.5 justify-self-end md:flex">
          <NavBar.LocaleSwitch locale={locale} className="pr-4 pl-2.5" />
          {buttons.map((btn) => {
            const variant = btn.variant;
            // O CTA primário leva o disco com a seta, como no mockup.
            const disc = variant === "primary";
            if (!btn.href) {
              return (
                <Button key={btn.key} size="sm" variant={variant}>
                  {btn.label}
                </Button>
              );
            }
            return (
              <Button
                key={btn.key}
                href={btn.href}
                openInNewTab={btn.openInNewTab}
                size="sm"
                variant={variant}
                textSwap
                trailingIcon={disc ? ArrowRightDown : undefined}
                circleIcon={disc}
              >
                {btn.label}
              </Button>
            );
          })}
        </div>
        <NavBar.MobileMenu
          links={links}
          buttons={buttons}
          socialLinks={args.socialLinks}
          locale={locale}
        />
      </NavBar.Root>
    </NavActiveProvider>
  );
}
