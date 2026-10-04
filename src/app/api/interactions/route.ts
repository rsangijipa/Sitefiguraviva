import { NextResponse } from "next/server";

import { registerInteractions } from "@/features/awareness-tree/lib/server/quote-repository";
import {
  INTERACTION_ACTIONS,
  THEME_SLUGS,
} from "@/features/awareness-tree/types/quote";
import type {
  InteractionAction,
  InteractionPayload,
  ThemeFilter,
} from "@/features/awareness-tree/types/quote";
import { getBearerSupabaseUserId } from "@/lib/auth/supabase-session";

/** teto de itens aceitos por requisição */
const MAX_ITEMS = 200;

function isAction(value: unknown): value is InteractionAction {
  return (
    typeof value === "string" &&
    (INTERACTION_ACTIONS as readonly string[]).includes(value)
  );
}

function isTheme(value: unknown): value is ThemeFilter {
  return (
    value === "all" ||
    (typeof value === "string" &&
      (THEME_SLUGS as readonly string[]).includes(value))
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const items = Array.isArray(body) ? body : [body];

  if (items.length === 0) {
    return NextResponse.json({ ok: true });
  }

  if (items.length > MAX_ITEMS) {
    return NextResponse.json(
      { error: `Maximo de ${MAX_ITEMS} interacoes por requisicao` },
      { status: 413 },
    );
  }

  const uid = await getBearerSupabaseUserId(request);
  if (!uid) {
    return NextResponse.json(
      { error: "Sessao nao autenticada" },
      { status: 401 },
    );
  }

  const payloads: InteractionPayload[] = [];

  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      return NextResponse.json({ error: "Payload invalido" }, { status: 400 });
    }

    const candidate = item as Record<string, unknown>;

    // Allowlist: antes bastava `actionType` ser truthy e qualquer string
    // chegava à persistência, poluindo a análise posterior.
    if (!isAction(candidate.actionType)) {
      return NextResponse.json(
        { error: "actionType invalido" },
        { status: 400 },
      );
    }

    if (candidate.theme !== undefined && !isTheme(candidate.theme)) {
      return NextResponse.json({ error: "theme invalido" }, { status: 400 });
    }

    if (
      candidate.quoteId !== undefined &&
      (typeof candidate.quoteId !== "string" || candidate.quoteId.length > 128)
    ) {
      return NextResponse.json({ error: "quoteId invalido" }, { status: 400 });
    }

    payloads.push({
      sessionId: uid,
      actionType: candidate.actionType,
      quoteId: candidate.quoteId as string | undefined,
      theme: candidate.theme as ThemeFilter | undefined,
    });
  }

  try {
    await registerInteractions(payloads);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel salvar as interacoes" },
      { status: 503 },
    );
  }
}
