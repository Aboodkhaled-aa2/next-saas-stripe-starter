import { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPages } from "contentlayer/generated";

import { constructMetadata, getBlurDataURL } from "@/lib/utils";
import { Mdx } from "@/components/content/mdx-components";

import "@/styles/mdx.css";

export async function generateStaticParams() {
  return allPages.map((page) => ({
    slug: page.slugAsParams,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata | undefined> {
  const page = allPages.find((page) => page.slugAsParams === params.slug);

  if (!page) {
    return;
  }

  const { title, description } = page;

  return constructMetadata({
    title: `${title} – Smart Cleaning Desk`,
    description,
  });
}

export default async function PagePage({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const page = allPages.find(
    (page) => page.slugAsParams === params.slug,
  );

  if (!page) {
    notFound();
  }

  const images = await Promise.all(
    page.images.map(async (src: string) => ({
      src,
      blurDataURL: await getBlurDataURL(src),
    })),
  );

  return (
    <article className="container max-w-3xl bg-[#020617] py-6 text-white lg:py-12">
      <div className="space-y-4">
        <h1 className="inline-block font-heading text-4xl text-white lg:text-5xl">
          {page.title}
        </h1>

        {page.description && (
          <p className="text-xl text-slate-400">{page.description}</p>
        )}
      </div>

      <hr className="my-6 border-slate-800" />

      <Mdx code={page.body.code} images={images} />
    </article>
  );
}
