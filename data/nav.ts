// data/nav.ts
export type NavItem = { label: string; href: string };

// Edit this array to add/remove/rename pages.
// Every item will show in the nav automatically.
export const NAV_ITEMS: NavItem[] = [
  { label: "Portfolio", href: "/" },
  { label: "Methodology", href: "/methodology" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
