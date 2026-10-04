import "server-only";
import { sanitizeEditorialHtml } from "@/lib/editorial-html.server";

export function SafeHtmlServer({
  html,
  className,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(html) }}
    />
  );
}
