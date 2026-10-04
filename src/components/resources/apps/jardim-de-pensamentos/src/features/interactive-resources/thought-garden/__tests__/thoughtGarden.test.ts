/**
 * Testes Automatizados - Jardim de Pensamentos
 * Instituto Figura Viva - Registro Confluência
 */

import {
  validateThoughtText,
  validateOptionalTitle,
  sanitizeCsvCell,
  exportThoughtsToCsv,
  THOUGHT_LIMITS,
} from "../schema";
import { thoughtGardenReducer, initialThoughtGardenState } from "../reducer";
import {
  saveThoughtRecord,
  listUserThoughts,
  deleteThoughtRecord,
} from "../repository";

// Mock simples para localStorage em ambiente de teste Node/tsx
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: LocalStorageMock }).localStorage =
    new LocalStorageMock();
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ SUCESSO: ${message}`);
  }
}

async function runTests() {
  console.log("\n--- INICIANDO TESTES DO JARDIM DE PENSAMENTOS ---\n");

  // 1. Validação de Texto
  console.log("1. Testando regras de validação de texto...");
  assert(!validateThoughtText("").isValid, "Texto vazio deve ser rejeitado");
  assert(
    !validateThoughtText("    ").isValid,
    "Texto com apenas espaços deve ser rejeitado",
  );
  assert(
    validateThoughtText("Uma respiração suave.").isValid,
    "Texto curto válido deve ser aceito",
  );
  assert(
    validateThoughtText("   Espaços ao redor   ").data === "Espaços ao redor",
    "Deve aparar espaços ao redor",
  );

  const text501 = "a".repeat(501);
  assert(
    !validateThoughtText(text501).isValid,
    "Texto com 501 caracteres deve ser rejeitado",
  );

  const text500 = "a".repeat(500);
  assert(
    validateThoughtText(text500).isValid,
    "Texto com exatamente 500 caracteres deve ser aceito",
  );

  // 2. Validação de Título Opcional
  console.log("\n2. Testando título opcional...");
  assert(
    validateOptionalTitle(null).isValid &&
      validateOptionalTitle(null).data === null,
    "Título nulo é aceito",
  );
  assert(
    validateOptionalTitle("   ").isValid &&
      validateOptionalTitle("   ").data === null,
    "Título vazio é aceito",
  );
  assert(
    !validateOptionalTitle("t".repeat(81)).isValid,
    "Título com 81 caracteres deve ser rejeitado",
  );
  assert(
    validateOptionalTitle("Título Válido").data === "Título Válido",
    "Título válido deve ser aceito",
  );

  // 3. Sanitização contra injeção de fórmulas no CSV
  console.log("\n3. Testando proteção contra injeção de fórmulas no CSV...");
  assert(
    sanitizeCsvCell("=SUM(A1:A10)") === `"'=SUM(A1:A10)"`,
    "Início com = deve ser prefixado com apóstrofo",
  );
  assert(
    sanitizeCsvCell("+cmd|/c") === ` "'+cmd|/c"`.trim(),
    "Início com + deve ser prefixado com apóstrofo",
  );
  assert(
    sanitizeCsvCell("-123") === ` "'-123"`.trim(),
    "Início com - deve ser prefixado com apóstrofo",
  );
  assert(
    sanitizeCsvCell("@test") === ` "'@test"`.trim(),
    "Início com @ deve ser prefixado com apóstrofo",
  );
  assert(
    sanitizeCsvCell("Pensamento comum") === `"Pensamento comum"`,
    "Texto normal não recebe apóstrofo",
  );

  // 4. Reducer e Máquina de Estados
  console.log("\n4. Testando transições de estado do Reducer...");
  let state = initialThoughtGardenState;
  assert(state.experienceState === "intro", "Estado inicial deve ser intro");

  state = thoughtGardenReducer(state, { type: "START_EXPERIENCE" });
  assert(
    state.experienceState === "empty",
    "Sem folhas, início vai para empty",
  );

  state = thoughtGardenReducer(state, {
    type: "PLACE_LEAF",
    payload: { text: "Primeira folha no canteiro" },
  });
  assert(
    state.experienceState === "active",
    "Com folhas, estado torna-se active",
  );
  assert(state.leaves.length === 1, "Folha deve ser adicionada à cena");
  assert(
    state.leaves[0].status === "placed",
    "Status inicial da folha deve ser placed",
  );

  const leafId = state.leaves[0].id;
  state = thoughtGardenReducer(state, { type: "FLOAT_LEAF", payload: leafId });
  assert(state.leaves[0].isFloating === true, "Folha deve estar flutuando");

  state = thoughtGardenReducer(state, { type: "LAND_LEAF", payload: leafId });
  assert(
    state.leaves[0].isFloating === false,
    "Folha deve ter pousado de volta",
  );

  // Teste de encerramento sem apagar guardadas e liberando efêmeras
  state = thoughtGardenReducer(state, {
    type: "PLACE_LEAF",
    payload: { text: "Segunda folha efêmera" },
  });
  assert(state.leaves.length === 2, "Deve ter duas folhas");

  // Marca a primeira folha como guardada
  state = thoughtGardenReducer(state, {
    type: "MARK_LEAF_AS_SAVED",
    payload: { leafId, recordId: "rec_123" },
  });

  state = thoughtGardenReducer(state, { type: "COMPLETE_EXPERIENCE" });
  assert(state.experienceState === "completed", "Estado deve ser completed");
  assert(
    state.leaves.length === 1,
    "Apenas a folha guardada deve permanecer no encerramento",
  );
  assert(
    state.leaves[0].id === leafId,
    "A folha guardada correta foi preservada",
  );

  // 5. Isolamento de Usuários (A não acessa B)
  console.log("\n5. Testando isolamento e privacidade rigorosa de dados...");
  const userA = "aluno_a_uuid";
  const userB = "aluno_b_uuid";

  await saveThoughtRecord(userA, {
    client_request_id: "req_a_1",
    text: "Anotação íntima do Aluno A",
  });

  const thoughtsA = await listUserThoughts(userA);
  assert(thoughtsA.length === 1, "Aluno A deve ter 1 registro");
  assert(
    thoughtsA[0].text === "Anotação íntima do Aluno A",
    "Conteúdo de A corresponde",
  );

  const thoughtsB = await listUserThoughts(userB);
  assert(
    thoughtsB.length === 0,
    "Aluno B NÃO deve enxergar nenhum registro do Aluno A",
  );

  // Tentativa de Aluno B excluir registro de Aluno A
  const deletedByB = await deleteThoughtRecord(userB, thoughtsA[0].id);
  assert(!deletedByB, "Aluno B não pode excluir registro de Aluno A");

  const thoughtsAAfter = await listUserThoughts(userA);
  assert(thoughtsAAfter.length === 1, "Registro de Aluno A permanece intacto");

  console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!\n");
}

describe("Jardim de Pensamentos", () => {
  it("executa a suite automatizada do jardim de pensamentos", async () => {
    await runTests();
  });
});
