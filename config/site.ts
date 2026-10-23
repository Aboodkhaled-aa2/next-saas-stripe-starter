import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const DEFAULT_SITE_URL = "https://www.smartcleaningdesk.com";

function resolveSiteUrl(value?: string): string {
  const rawValue = value?.trim();

  if (!rawValue) {
    return DEFAULT_SITE_URL;
  }

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  try {
    const parsed = new URL(candidate);

    if (
      (parsed.protocol !== "https:" && parsed.protocol !== "http:") ||
      !parsed.hostname
    ) {
      return DEFAULT_SITE_URL;
    }

    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

const site_url = resolveSiteUrl(env.NEXT_PUBLIC_APP_URL);

export const siteConfig: SiteConfig = {
  name: "Smart Cleaning Desk",
  description:
    "Smart Cleaning Desk helps cleaning businesses manage customer messages, leads, and daily operations effortlessly.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://twitter.com/miickasmt",
    github: "https://github.com/mickasmt/next-saas-stripe-starter",
  },
  mailSupport: "support@smartcleaningdesk.com",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "#" },
      { title: "Enterprise", href: "#" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Product",
    items: [
      { title: "Security", href: "#" },
      { title: "Customization", href: "#" },
      { title: "Customers", href: "#" },
      { title: "Changelog", href: "#" },
    ],
  },
  {
    title: "Docs",
    items: [
      { title: "Introduction", href: "#" },
      { title: "Components", href: "#" },
      { title: "Code Blocks", href: "#" },
    ],
  },
];
