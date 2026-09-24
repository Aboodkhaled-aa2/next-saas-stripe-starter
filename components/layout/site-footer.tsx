import * as React from "react";
import Link from "next/link";

import { footerLinks, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";

import { NewsletterForm } from "../forms/newsletter-form";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn("border-t", className)}>
      <div className="container grid max-w-6xl grid-cols-2 gap-6 py-14 md:grid-cols-5">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <span className="text-sm font-medium text-foreground">
              {section.title}
            </span>

            <ul className="mt-4 list-inside space-y-3">
              {section.items?.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="col-span-full flex flex-col items-start gap-5 sm:col-span-1 md:col-span-2 md:items-end">
          <div className="text-left md:text-right">
            <p className="text-sm font-medium text-foreground">
              Need help?
            </p>

            <a
              href="mailto:supportsmartcleaningdesk@gmail.com"
              className="mt-2 inline-block text-sm text-muted-foreground hover:text-primary"
            >
              supportsmartcleaningdesk@gmail.com
            </a>
          </div>

          <NewsletterForm />
        </div>
      </div>

      <div className="border-t py-4">
        <div className="container flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-left text-sm text-muted-foreground">
            © {new Date().getFullYear()} Smart Cleaning Desk. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
