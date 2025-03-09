type NavLink = {
  href: string;
  label: string;
};

export const links: NavLink[] = [
  { href: "/", label: "home" },
  { href: "/favourites ", label: "favourites" },
  { href: "/bookings ", label: "bookings" },
  { href: "/reservations", label: "reservations" },
  { href: "/reviews ", label: "reviews" },
  { href: "/rentals/create ", label: "create rental" },
  { href: "/rentals", label: "my rentals" },
  { href: "/admin", label: "admin" },
  { href: "/profile ", label: "profile" },
];
