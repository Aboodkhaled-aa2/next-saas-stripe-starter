import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const rawSiteUrl = env.NEXT_PUBLIC_APP_URL;
const site_url = rawSiteUrl?.startsWith("http") ? rawSiteUrl.replace(/\/+$/, "") : "https://www.smartcleaningdesk.com";

export const siteConfig: SiteConfig = {
  name: "Smart Cleaning Desk",
  description: "Smart Cleaning Desk helps cleaning businesses manage customer messages, leads, and daily operations effortlessly.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://twitter.com/miickasmt",
    github: "https://github.com/mickasmt/next-saas-stripe-starter",
  },
  mailSupport: "support@smartcleaningdesk.com",
};

export const footerLinks: SidebarNavItem[] = [
  { title: "Company", items: [{ title: "About", href: "#" }, { title: "Enterprise", href: "#" }, { title: "Terms", href: "/terms" }, { title: "Privacy", href: "/privacy" }] },
  { title: "Product", items: [{ title: "Security", href: "#" }, { title: "Customization", href: "#" }, { title: "Customers", href: "#" }, { title: "Changelog", href: "#" }] },
  { title: "Docs", items: [{ title: "Introduction", href: "#" }, { title: "Installation", href: "#" }, { title: "Output", href: "#" }, { title: "Code Blocks", href: "#" }] },
];
