import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MAIN",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "Admin Panel",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        href: "/dashboard",
        icon: "dashboard",
        title: "Dashboard",
      },
      {
        href: "/dashboard/ai",
        icon: "bot",
        title: "AI Employee",
      },
      {
        href: "/dashboard/leads",
        icon: "users",
        title: "Leads",
      },
      {
        href: "/dashboard/customers",
        icon: "users",
        title: "Customers",
      },
      {
        href: "/dashboard/conversations",
        icon: "messages",
        title: "Conversations",
      },
      {
        href: "/dashboard/calendar",
        icon: "calendar",
        title: "Calendar",
      },
    ],
  },
  {
    title: "CHANNELS",
    items: [
      {
        href: "/dashboard/integrations/instagram",
        icon: "instagram",
        title: "Instagram",
      },
      {
        href: "/dashboard/integrations/facebook",
        icon: "facebook",
        title: "Facebook",
      },
      {
        href: "/dashboard/integrations/whatsapp",
        icon: "whatsapp",
        title: "WhatsApp",
      },
      {
        href: "/dashboard/integrations/phone",
        icon: "phone",
        title: "Phone",
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        href: "/onboarding",
        icon: "settings",
        title: "Business Setup",
      },
      {
        href: "/dashboard/integrations",
        icon: "link",
        title: "Integrations",
      },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "Billing",
        authorizeOnly: UserRole.USER,
      },
      {
        href: "/dashboard/settings",
        icon: "settings",
        title: "Settings",
      },
    ],
  },
];
