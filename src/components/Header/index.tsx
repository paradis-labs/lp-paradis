import Link from "next/link";
import type { NavBar as NavBarContent } from "@/content";
import type { Locale } from "@/i18n/routing";
import { localizedHref } from "@/lib/locale-href";
import Button from "../Button";
import { NavBar } from "../NavBar";
import { NavActiveProvider } from "../NavBar/NavActiveContext";

interface HeaderProps extends NavBarContent {
  locale: Locale;
}

export default async function Header({ locale, ...args }: HeaderProps) {
  const logoSrc = args.logo?.image?.url ?? "/logo.svg";
  const logoLightSrc = args.logo?.imageLight?.url ?? logoSrc;
  const logoHref = localizedHref(args.logo?.url ?? "/", locale);
  const logoWidth = args.logo?.width ?? 134;
  const logoHeight = args.logo?.height ?? 25;

  const sectionIds = args.links
    .map((link) => link.url)
    .filter((url): url is string => !!url?.includes("#"))
    .map((url) => url.split("#")[1]);

  return (
    <NavActiveProvider ids={sectionIds}>
      <NavBar.Root>
        <NavBar.Logo
          imgSrc={logoSrc}
          href={logoHref}
          width={logoWidth}
          height={logoHeight}
        />
        <NavBar.MobileMenu
          logoSrc={logoLightSrc}
          logoHref={logoHref}
          logoWidth={logoWidth}
          logoHeight={logoHeight}
        >
          <NavBar.ItemList>
            {args.links.map((link) => (
              <NavBar.Item
                key={link.key}
                href={link.url}
                locale={locale}
                openInNewTab={link.openInNewTab}
              >
                {link.label}
              </NavBar.Item>
            ))}
          </NavBar.ItemList>
          <NavBar.ButtonWrap>
            <NavBar.LocaleSwitch className="px-2 py-2" locale={locale} />
            {args.buttons.map((btn) => {
              if (!btn.url.trim()) {
                return (
                  <Button
                    key={btn.key}
                    size="sm"
                    className={btn.variant === "outline" ? "bg-white" : ""}
                    variant={btn.variant}
                  >
                    {btn.label}
                  </Button>
                );
              }

              return (
                <Button
                  key={btn.key}
                  asChild
                  size="sm"
                  className={btn.variant === "outline" ? "bg-white" : ""}
                  variant={btn.variant}
                >
                  {/* UM único filho: restrição do `Slot` usado pelo `asChild`. */}
                  <Link
                    href={localizedHref(btn.url, locale)}
                    target={btn.openInNewTab ? "_blank" : undefined}
                    rel={btn.openInNewTab ? "noopener noreferrer" : undefined}
                  >
                    {btn.label}
                  </Link>
                </Button>
              );
            })}
          </NavBar.ButtonWrap>
        </NavBar.MobileMenu>
      </NavBar.Root>
    </NavActiveProvider>
  );
}
