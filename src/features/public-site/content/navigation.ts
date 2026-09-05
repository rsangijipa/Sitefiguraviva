export interface PublicNavItem {
  label: string;
  href: string;
}

export const PUBLIC_NAV_ITEMS: PublicNavItem[] = [
  { label: "Instituto", href: "/instituto" },
  { label: "Formações", href: "/formacoes" },
  { label: "Recursos", href: "/recursos" },
  { label: "Biblioteca", href: "/public-library" },
  { label: "Galeria", href: "/public-gallery" },
  { label: "Blog", href: "/blog" },
];
