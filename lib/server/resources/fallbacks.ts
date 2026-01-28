import "server-only";

type FallbackResource = { title: string; url: string; resource_type: string };

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
    },
  },
  {
    keywords: ["next.js", "nextjs", "next js", "app router", "server component"],
    resource: {
      title: "Next.js Docs",
      url: "https://nextjs.org/docs",
      resource_type: "documentation",
    },
  },
  {
    keywords: ["typescript", "ts ", "type script"],
    resource: {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
      resource_type: "documentation",
    },
  },
  {
    keywords: ["html", "css", "javascript", "js ", "dom", "web api", "mdn"],
    resource: {
      title: "MDN Web Docs",
      url: "https://developer.mozilla.org/en-US/docs/Web",
      resource_type: "documentation",
    },
  },
];

/**
 * Returns a safe fallback resource for a step when the original URL failed validation.
 * Chooses by step title/description keywords; default is MDN.
 */
export function getFallbackResource(
  stepTitle: string,
  stepDescription: string
): FallbackResource {
  const text = `${stepTitle} ${stepDescription}`.toLowerCase();
  for (const { keywords, resource } of FALLBACKS) {
    if (keywords.some((k) => text.includes(k))) {
      return resource;
    }
  }
  return {
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/docs/Web",
    resource_type: "documentation",
  };
}
