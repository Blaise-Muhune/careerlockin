import "server-only";

export type FallbackResource = {
  title: string;
  url: string;
  resource_type: "documentation" | "article" | "course" | "video";
  publisher: string;
};

const FALLBACKS: Array<{
  keywords: string[];
  resource: FallbackResource;
}> = [
  {
    keywords: ["react", "jsx", "hooks", "components"],
    resource: {
      title: "React Learn",
      url: "https://react.dev/learn",
      resource_type: "documentation",
      publisher: "React",
    },
  },
  {
    keywords: ["next.js", "nextjs", "app router", "server component"],
    resource: {
      title: "Next.js Docs",
      url: "https://nextjs.org/docs",
      resource_type: "documentation",
      publisher: "Vercel",
    },
  },
  {
    keywords: ["tanstack", "react query", "server state"],
    resource: {
      title: "TanStack Query Docs",
      url: "https://tanstack.com/query/latest/docs/framework/react/overview",
      resource_type: "documentation",
      publisher: "TanStack",
    },
  },
  {
    keywords: ["playwright", "cypress", "e2e", "end-to-end"],
    resource: {
      title: "Playwright Docs",
      url: "https://playwright.dev/docs/intro",
      resource_type: "documentation",
      publisher: "Playwright",
    },
  },
  {
    keywords: ["vitest", "jest", "unit test", "testing library"],
    resource: {
      title: "Testing Library Docs",
      url: "https://testing-library.com/docs/react-testing-library/intro/",
      resource_type: "documentation",
      publisher: "Testing Library",
    },
  },
  {
    keywords: ["a11y", "accessib", "wcag", "aria"],
    resource: {
      title: "WAI-ARIA Authoring Practices",
      url: "https://www.w3.org/WAI/ARIA/apg/",
      resource_type: "documentation",
      publisher: "W3C WAI",
    },
  },
  {
    keywords: ["typescript", "type script"],
    resource: {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
      resource_type: "documentation",
      publisher: "TypeScript",
    },
  },
  {
    keywords: ["html", "css", "javascript", "dom", "web api", "mdn"],
    resource: {
      title: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web",
      resource_type: "documentation",
      publisher: "MDN",
    },
  },
  {
    keywords: ["python", "django", "flask", "fastapi"],
    resource: {
      title: "Python Docs",
      url: "https://docs.python.org/3/",
      resource_type: "documentation",
      publisher: "Python",
    },
  },
  {
    keywords: ["sql", "postgres", "database", "query"],
    resource: {
      title: "PostgreSQL Tutorial",
      url: "https://www.postgresql.org/docs/current/tutorial.html",
      resource_type: "documentation",
      publisher: "PostgreSQL",
    },
  },
  {
    keywords: ["aws", "cloud", "s3", "lambda", "ec2"],
    resource: {
      title: "AWS Documentation",
      url: "https://docs.aws.amazon.com/",
      resource_type: "documentation",
      publisher: "Amazon Web Services",
    },
  },
  {
    keywords: ["docker", "container", "kubernetes", "k8s"],
    resource: {
      title: "Docker Docs",
      url: "https://docs.docker.com/",
      resource_type: "documentation",
      publisher: "Docker",
    },
  },
  {
    keywords: ["git", "github", "version control"],
    resource: {
      title: "Git Documentation",
      url: "https://git-scm.com/doc",
      resource_type: "documentation",
      publisher: "Git",
    },
  },
  {
    keywords: ["product manager", "product management", "roadmap", "prd"],
    resource: {
      title: "Lenny's Newsletter",
      url: "https://www.lennysnewsletter.com/",
      resource_type: "article",
      publisher: "Lenny's Newsletter",
    },
  },
  {
    keywords: ["ux", "ui", "design", "figma", "wireframe"],
    resource: {
      title: "Figma Learn",
      url: "https://help.figma.com/hc/en-us",
      resource_type: "documentation",
      publisher: "Figma",
    },
  },
  {
    keywords: ["content", "writing", "copy", "seo", "blog"],
    resource: {
      title: "Google Search Essentials",
      url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
      resource_type: "documentation",
      publisher: "Google",
    },
  },
  {
    keywords: ["data analysis", "excel", "spreadsheet", "tableau", "power bi"],
    resource: {
      title: "Google Data Analytics resources",
      url: "https://grow.google/certificates/data-analytics/",
      resource_type: "course",
      publisher: "Google",
    },
  },
  {
    keywords: ["machine learning", "ml ", "deep learning", "pytorch", "tensorflow"],
    resource: {
      title: "scikit-learn User Guide",
      url: "https://scikit-learn.org/stable/user_guide.html",
      resource_type: "documentation",
      publisher: "scikit-learn",
    },
  },
  {
    keywords: ["interview", "system design", "leetcode", "coding interview"],
    resource: {
      title: "Tech Interview Handbook",
      url: "https://www.techinterviewhandbook.org/",
      resource_type: "article",
      publisher: "Tech Interview Handbook",
    },
  },
  {
    keywords: ["marketing", "growth", "analytics", "campaign"],
    resource: {
      title: "HubSpot Marketing Resources",
      url: "https://blog.hubspot.com/marketing",
      resource_type: "article",
      publisher: "HubSpot",
    },
  },
];

const DEFAULT_FALLBACK: FallbackResource = {
  title: "Google Career Certificates / Grow with Google",
  url: "https://grow.google/certificates/",
  resource_type: "course",
  publisher: "Google",
};

/**
 * Curated canonical resource when web_search grounding leaves a step empty.
 */
export function getFallbackResource(
  stepTitle: string,
  stepDescription: string,
  targetRole?: string
): FallbackResource {
  const text = `${stepTitle} ${stepDescription} ${targetRole ?? ""}`.toLowerCase();
  for (const { keywords, resource } of FALLBACKS) {
    if (keywords.some((k) => text.includes(k))) {
      return resource;
    }
  }
  return DEFAULT_FALLBACK;
}
