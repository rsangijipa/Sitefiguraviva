import { NextResponse } from "next/server";

import {
  listFavorites,
  saveFavorite,
} from "@/features/awareness-tree/lib/server/quote-repository";
import { getBearerSupabaseUserId } from "@/lib/auth/supabase-session";

/**
 * Resolve de quem sao as favoritas desta requisicao.
 *
 * O dono é sempre o usuário do bearer token Supabase, nunca um identificador
 * enviado no corpo ou na query.
 */
async function resolveOwner(request: Request) {
  const uid = await getBearerSupabaseUserId(request);

  if (!uid) {
    return {
      error: NextResponse.json(
        { error: "Sessao nao autenticada" },
        { status: 401 },
      ),
    };
  }

  return { ownerId: uid };
}

export async function GET(request: Request) {
  const { ownerId, error } = await resolveOwner(request);

  if (error) {
    return error;
  }

  try {
    const favorites = await listFavorites(ownerId as string);
    return NextResponse.json({ favorites });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel carregar as favoritas" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  let body: { sessionId?: unknown; quoteId?: unknown; isFavorite?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  if (
    typeof body.quoteId !== "string" ||
    body.quoteId.length === 0 ||
    body.quoteId.length > 128
  ) {
    return NextResponse.json({ error: "quoteId invalido" }, { status: 400 });
  }

  if (typeof body.isFavorite !== "boolean") {
    return NextResponse.json({ error: "isFavorite invalido" }, { status: 400 });
  }

  const { ownerId, error } = await resolveOwner(request);

  if (error) {
    return error;
  }

  try {
    const favorites = await saveFavorite({
      sessionId: ownerId as string,
      quoteId: body.quoteId,
      isFavorite: body.isFavorite,
    });
    return NextResponse.json({ ok: true, favorites });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel salvar a favorita" },
      { status: 503 },
    );
  }
}
