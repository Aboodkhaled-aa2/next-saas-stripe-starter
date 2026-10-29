import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const configuredSiteUrl = env.NEXT_PUBLIC_APP_URL?.trim();
const vercelSiteUrl = process.env.VERCEL_URL?.trim()
  ? `https://${process.env.VERCEL_URL.trim()}`
  : undefined;

function getValidSiteUrl() {
  for (const candidate of [configuredSiteUrl, vercelSiteUrl, "https://www.smartcleaningdesk.com"]) {
    if (!candidate || candidate.toLowerCase() === "undefined" || candidate.toLowerCase() === "null") continue;
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.origin;
      }
    } catch {
      // Try the next safe candidate.
    }
  }
  return "https://www.smartcleaningdesk.com";
}

const site_url = getValidSiteUrl();

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
  mailSupport: "supportsmartcleaningdesk@gmail.com",
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
      { title: "Installation", href: "#" },
      { title: "Components", href: "#" },
      { title: "Code Blocks", href: "#" },
    ],
  },
];
