import { FeatureLd, InfoLd, Testimonialtype } from "types";

export const infos: InfoLd[] = [
  {
    title: "Smart Cleaning Desk",
    description:
      "Smart Cleaning Desk helps cleaning businesses manage customer messages, leads, and daily operations with powerful automation and an all-in-one dashboard.",
    image: "/_static/illustrations/work-from-home.jpg",
    list: [
      {
        title: "Smart Scheduling",
        description: "Easily manage and schedule cleaning appointments for your team with automated reminders.",
        icon: "nextjs",
      },
      {
        title: "Client & Lead Management",
        description: "Track customer messages, requests, and daily operations all in one dashboard.",
        icon: "google",
      },
      {
        title: "Automated Operations",
        description: "Streamline your cleaning workflows and boost team productivity effortlessly.",
        icon: "settings",
      },
    ],
  },
];

export const features: FeatureLd[] = [
  {
    title: "Smart Scheduling",
    description: "Easily manage and schedule cleaning appointments for your team with automated reminders.",
    link: "/",
    icon: "nextjs",
  },
  {
    title: "Client & Lead Management",
    description: "Track customer messages, requests, and daily operations all in one dashboard.",
    link: "/",
    icon: "google",
  },
];

export const testimonials: Testimonialtype[] = [];
