import React from "react";
import { useLocation } from "react-router-dom";

import { Link } from "@heroui/link";
import { 
  Navbar as HeroUINavbar, 
  NavbarBrand, NavbarContent, NavbarItem, 
  NavbarMenuToggle, NavbarMenu, NavbarMenuItem } from "@heroui/navbar";
import { BotMessageSquare, CircleUserRound } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "Page",
      href: "/page",
    },
  ];

  return (
    <HeroUINavbar 
      isBordered 
      maxWidth="xl" 
      position="sticky" 
      isMenuOpen={isMenuOpen} 
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="sm:hidden" justify="center">
        <NavbarMenuToggle/>
      </NavbarContent>

      <NavbarBrand>
        <Link href="/" className="flex gap-2">
          <BotMessageSquare className="h-8 w-8"/>
          <p className="font-bold text-inherit"> VRT </p>
        </Link>
      </NavbarBrand>

      <NavbarContent justify="center" className="hidden sm:flex">
        <NavbarItem isActive={location.pathname === "/features"}>
          <Link href="/features" color="foreground"> 
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive={location.pathname === "/page"}>
          <Link href="/page" color="foreground"> 
            Page 
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem isActive={location.pathname === "/profile"}>
          <Link href="/profile" color="foreground"> 
            <CircleUserRound className="h-7 w-7"/>
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu
        motionProps={{
          initial: { opacity: 0, y: -50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
          transition: { duration: 0.2 },
        }}
      >
        {menuItems.map((item) => (
          <NavbarMenuItem key={item.label} isActive={location.pathname === item.href}>
            <Link href={item.href} color="foreground"> 
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>

    </HeroUINavbar>
  );
}