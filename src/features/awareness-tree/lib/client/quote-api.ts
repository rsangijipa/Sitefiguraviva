import type { Quote, ThemeFilter } from "@/features/awareness-tree/types/quote";
import { QUOTES } from "@/features/awareness-tree/data/quotes";

type QuotesResponse = {
  quotes: Quote[];
};

export async function fetchQuotesByTheme(
  theme: ThemeFilter,
): Promise<QuotesResponse> {
  const quotes =
    theme === "all" ? QUOTES : QUOTES.filter((quote) => quote.theme === theme);

  return { quotes };
}
