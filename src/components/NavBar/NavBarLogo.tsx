import Image from "next/image";
import Link from "next/link";

interface NavBarLogoProps {
  imgSrc: string;
  href?: string;
  width?: number;
  height?: number;
  /** O nome acessível do link, que leva à home. */
  label: string;
}

export default function NavBarLogo({
  imgSrc,
  href = "/",
  width = 134,
  height = 25,
  label,
}: NavBarLogoProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-10 items-center justify-self-start"
    >
      <Image src={imgSrc} alt="" width={width} height={height} priority />
    </Link>
  );
}
