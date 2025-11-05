import SingleBlog from "@/components/Blog/SingleBlog";
import blogData from "@/static/blogData";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";
import { generatePageMetadata, getKeywords } from '@/lib/metadata';

// Generate static params for SSG
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'id' }
  ]
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const isIndonesian = locale === 'id';
  
  const title = isIndonesian
    ? "Blog & Artikel - Teknologi dan Strategi Digital"
    : "Blog & Articles - Technology and Digital Strategy";
    
  const description = isIndonesian
    ? "Tetap terdepan dengan artikel blog terbaru dari Genfity. Kami menyediakan wawasan mendalam tentang teknologi, AI, inovasi, dan strategi bisnis digital untuk membantu transformasi dan pertumbuhan perusahaan Anda."
    : "Stay ahead with Genfity's latest blog articles. We provide in-depth insights on technology, AI, innovation, and digital business strategies to help transform and grow your business.";

  return generatePageMetadata({
    title,
    description,
    keywords: getKeywords('base', locale as 'id' | 'en', [
      ...(isIndonesian
        ? ['blog teknologi', 'artikel AI', 'strategi digital', 'inovasi bisnis', 'tutorial']
        : ['technology blog', 'AI articles', 'digital strategy', 'business innovation', 'tutorials']
      )
    ]),
    locale,
    ogImage: `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isIndonesian ? 'Wawasan Teknologi & Bisnis Digital' : 'Technology & Digital Business Insights')}&locale=${locale}`,
  });
}

const Blog = () => {
  return (
    <>
      <Breadcrumb
        pageName="Blogs"
        description="Stay ahead of the curve with our latest blog posts. We provide in-depth articles, case studies, and expert insights on technology, innovation, AI, and business strategies to help you transform and grow."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
            {blogData.map((blog) => (
              <div key={blog.id} className="w-full ">
                <SingleBlog blog={blog} />
              </div>
            ))}
          </div>

          <div className="-mx-4 flex flex-wrap" data-wow-delay=".15s">
            <div className="w-full px-4">
              <ul className="flex items-center justify-center pt-8">
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    Prev
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    1
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    2
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    3
                  </a>
                </li>
                <li className="mx-1">
                  <span className="flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color">
                    ...
                  </span>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    12
                  </a>
                </li>
                <li className="mx-1">
                  <a
                    href="#0"
                    className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white"
                  >
                    Next
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
