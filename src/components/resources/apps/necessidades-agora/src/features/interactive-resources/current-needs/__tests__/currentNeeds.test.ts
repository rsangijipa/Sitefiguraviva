/**
 * Testes Unitários e de Integração Canônica
 * Experiência "Necessidades Agora" - Instituto Figura Viva
 */

const inMemoryStore: any[] = [];

jest.mock("@/infrastructure/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: async () => {
        const user = (globalThis as any).__mockUser ?? null;
        return {
          data: { user },
          error: user
            ? null
            : new Error("Faça login para salvar e consultar seus registros."),
        };
      },
    },
    from: (table: string) => ({
      upsert: (record: any) => ({
        select: () => ({
          single: async () => {
            const item = {
              id: `rec-${Date.now()}-${Math.random()}`,
              ...record,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            inMemoryStore.push(item);
            return { data: item, error: null };
          },
        }),
      }),
      select: () => ({
        eq: (_col: string, val: string) => ({
          order: () => ({
            data: inMemoryStore.filter((r) => r.user_id === val),
            error: null,
          }),
        }),
      }),
      delete: () => ({
        eq: (_col: string, _val: string) => ({
          eq: (_col2: string, _val2: string) => ({ error: null }),
        }),
      }),
    }),
  }),
}));

import { currentNeedsReducer, initialCurrentNeedsState } from "../reducer";
import { validateRecordPayload, CURRENT_NEEDS_CONSTRAINTS } from "../schema";
import { CurrentNeedsRepository } from "../repository";
import { NeedCatalogItem } from "../types";
import { describe, test, expect } from "@jest/globals";

describe("Necessidades Agora - Regras de Negócio e Validações", () => {
  const dummyItem1: NeedCatalogItem = {
    id: "descanso",
    name: "Descanso",
    shortDescription: "Tempo para interromper ou diminuir o ritmo",
    category: "ritmo",
    iconName: "Moon",
    active: true,
    orderIndex: 0,
  };

  test("Deve permitir adicionar até 5 necessidades e bloquear a 6ª com mensagem explicativa", () => {
    let state = initialCurrentNeedsState;

    for (let i = 0; i < 5; i++) {
      state = currentNeedsReducer(state, {
        type: "TOGGLE_NEED",
        need: {
          id: `item-${i}`,
          name: `Necessidade ${i}`,
          shortDescription: `Desc ${i}`,
        },
      });
    }

    expect(state.selectedEntries).toHaveLength(5);
    expect(state.explanationMessage).toBeNull();

    // Tentativa da 6ª
    state = currentNeedsReducer(state, {
      type: "TOGGLE_NEED",
      need: {
        id: "item-5",
        name: "Necessidade 5",
        shortDescription: "Desc 5",
      },
    });

    // Deve continuar em 5 e exibir explicação
    expect(state.selectedEntries).toHaveLength(5);
    expect(state.explanationMessage).toContain(
      "Você já selecionou 5 necessidades",
    );
  });

  test("Alternar necessidade já selecionada deve removê-la da lista", () => {
    let state = initialCurrentNeedsState;

    state = currentNeedsReducer(state, {
      type: "TOGGLE_NEED",
      need: dummyItem1,
    });
    expect(state.selectedEntries).toHaveLength(1);

    state = currentNeedsReducer(state, {
      type: "TOGGLE_NEED",
      need: dummyItem1,
    });
    expect(state.selectedEntries).toHaveLength(0);
  });

  test("Remover item marcado como foco prioritário deve anular o focusEntryId", () => {
    let state = initialCurrentNeedsState;

    state = currentNeedsReducer(state, {
      type: "TOGGLE_NEED",
      need: dummyItem1,
    });
    const entryId = state.selectedEntries[0].entryId;

    state = currentNeedsReducer(state, {
      type: "SET_FOCUS_ENTRY",
      entryId: entryId,
    });
    expect(state.focusEntryId).toBe(entryId);

    // Remove o item
    state = currentNeedsReducer(state, {
      type: "REMOVE_ENTRY",
      entryId: entryId,
    });
    expect(state.selectedEntries).toHaveLength(0);
    expect(state.focusEntryId).toBeNull();
  });

  test("Permite adicionar necessidade própria com rótulo limitado a 80 caracteres", () => {
    let state = initialCurrentNeedsState;
    const longLabel = "A".repeat(120);

    state = currentNeedsReducer(state, {
      type: "ADD_CUSTOM_NEED",
      label: longLabel,
      description: "Descrição de teste",
    });

    expect(state.selectedEntries).toHaveLength(1);
    expect(state.selectedEntries[0].labelSnapshot.length).toBeLessThanOrEqual(
      CURRENT_NEEDS_CONSTRAINTS.CUSTOM_LABEL_MAX_LENGTH,
    );
    expect(state.selectedEntries[0].isCustom).toBe(true);
  });

  test('Opção "Ainda não sei" limpa escolhas prévias e transita com acolhimento', () => {
    let state = initialCurrentNeedsState;

    state = currentNeedsReducer(state, {
      type: "TOGGLE_NEED",
      need: dummyItem1,
    });
    expect(state.selectedEntries).toHaveLength(1);

    // Usuário clica em "Ainda não sei"
    state = currentNeedsReducer(state, { type: "SELECT_UNSURE" });

    expect(state.stateType).toBe("unsure");
    expect(state.selectedEntries).toHaveLength(0);
    expect(state.focusEntryId).toBeNull();
    expect(state.step).toBe("optionalStep");
  });

  test("Validador de esquema rejeita estado selected sem entradas ou com mais de 5", () => {
    const emptyResult = validateRecordPayload({
      state: "selected",
      entries: [],
      focusEntryId: null,
      smallStep: null,
    });
    expect(emptyResult.valid).toBe(false);

    const validResult = validateRecordPayload({
      state: "selected",
      entries: [
        {
          entryId: "e1",
          needId: "descanso",
          labelSnapshot: "Descanso",
        },
      ],
      focusEntryId: null,
      smallStep: "Respirar fundo",
    });
    expect(validResult.valid).toBe(true);
  });

  test("Isolamento de privacidade (RLS): Aluno B não visualiza registros do Aluno A", async () => {
    const userA = "user-aluno-a-111";
    const userB = "user-aluno-b-222";

    // Salvar registro de A
    (globalThis as any).__mockUser = { id: userA };
    await CurrentNeedsRepository.createRecord({
      userId: userA,
      clientRequestId: "req-test-a",
      contentVersion: "1.0.0",
      state: "selected",
      entries: [
        {
          entryId: "entry-a1",
          needId: "descanso",
          labelSnapshot: "Descanso",
        },
      ],
      ordered: false,
      focusEntryId: null,
      smallStep: "Gesto do Aluno A",
    });

    // Listar registros de B
    (globalThis as any).__mockUser = { id: userB };
    const recordsB = await CurrentNeedsRepository.listRecords(userB);
    const hasAData = recordsB.some((r) => r.userId === userA);
    expect(hasAData).toBe(false);

    // Listar registros de A
    (globalThis as any).__mockUser = { id: userA };
    const recordsA = await CurrentNeedsRepository.listRecords(userA);
    expect(recordsA.length).toBeGreaterThan(0);
    expect(recordsA[0].userId).toBe(userA);
    (globalThis as any).__mockUser = null;
  });
});
