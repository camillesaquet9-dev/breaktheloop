import "server-only";

import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Sanitising Markdown → HTML pipeline.
 *
 * We extend the default rehype-sanitize schema minimally:
 *   - allow `<sup>` for ordinal markers (3^e année),
 *   - allow class attributes on <code> and <pre> so syntax-highlighting
 *     classes survive (we don't highlight yet, but planning ahead).
 *
 * No inline HTML, no <iframe>, no <object>, no <script>. Even if I write
 * something sketchy in a Markdown file it would be stripped before reaching
 * the DOM.
 */
const schema: typeof defaultSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "sup", "sub"],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "className"],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

export async function renderMarkdownToHtml(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
