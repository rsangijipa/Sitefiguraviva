/**
 * Testes Automatizados para Sons para Awareness
 * Instituto Figura Viva - Registro Confluência
 *
 * Cobertura:
 * - Validações de esquema e limites éticos
 * - Integridade do manifesto acústico
 * - Isolamento RLS e restrições de permissão
 * - Ausência de pontuações clínicas e patologização
 */

import { validateObservation, validateReflection } from '../schema';
import { SOUND_LIBRARY_MANIFEST, GUIDED_SCENES } from '../audio/assetLoader';
import { AwarenessRepository } from '../repository';
import { SoundId } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log('=== TEST SUITE: SONS PARA AWARENESS (FIGURA VIVA) ===\n');

// 1. Integridade do Manifesto Sonoro
console.log('1. Verificação do Manifesto Acústico');
const requiredSounds: SoundId[] = ['agua-corrente', 'folhas-vento', 'chuva-suave', 'passaro-distante'];

assert(
  requiredSounds.every((id) => !!SOUND_LIBRARY_MANIFEST[id]),
  'Todas as 4 fontes acústicas estão declaradas no manifesto'
);

requiredSounds.forEach((id) => {
  const s = SOUND_LIBRARY_MANIFEST[id];
  assert(s.license.includes('Creative Commons') || s.license.includes('CC'), `Licença declarada para ${s.title}`);
  assert(s.textualDescription.length > 20, `Descrição textual acessível para ${s.title}`);
  assert(s.mimeType === 'audio/wav', `MIME type válido para ${s.title}`);
  assert(s.durationSeconds >= 60, `Duração suficiente de loop (>=60s) para ${s.title}`);
});

// 2. Cenas Guiadas
console.log('\n2. Verificação das Cenas Guiadas');
assert(GUIDED_SCENES.length === 4, 'Existem 4 cenas guiadas configuradas');
GUIDED_SCENES.forEach((scene, i) => {
  assert(
    !scene.guidanceNote.includes('correto') && !scene.guidanceNote.includes('erro'),
    `Cena ${i + 1} não contém julgamento de erro/acerto`
  );
  assert(scene.configuredPosition.x >= -1 && scene.configuredPosition.x <= 1, `Cena ${i + 1} possui X normalizado`);
  assert(scene.configuredPosition.y >= -1 && scene.configuredPosition.y <= 1, `Cena ${i + 1} possui Y normalizado`);
});

// 3. Validação de Limites de Schema
console.log('\n3. Validação de Limites de Schema e Respostas');

// Observação válida
const validObs = validateObservation({
  soundId: 'agua-corrente',
  perceivedDirection: 'esquerda',
  perceivedDistance: 'intermediario',
  qualities: ['suave', 'continuo'],
  customQuality: 'sensação de frescor',
});
assert(validObs.isValid, 'Observação válida aceita com sucesso');

// Máximo de 5 qualidades
const tooManyQualities = validateObservation({
  soundId: 'agua-corrente',
  qualities: ['suave', 'continuo', 'intermitente', 'grave', 'agudo', 'suave' as any],
});
assert(!tooManyQualities.isValid, 'Rejeita observação com mais de 5 qualidades');

// Termo próprio ≤ 120 caracteres
const longTerm = 'A'.repeat(121);
const invalidTerm = validateObservation({
  soundId: 'agua-corrente',
  customQuality: longTerm,
});
assert(!invalidTerm.isValid, 'Rejeita termo próprio com mais de 120 caracteres');

// Reflexão pessoal ≤ 500 caracteres
const validReflect = validateReflection('Uma prática tranquila de escuta centrada.');
assert(validReflect.isValid, 'Reflexão de tamanho adequado aceita');

const invalidReflect = validateReflection('B'.repeat(501));
assert(!invalidReflect.isValid, 'Rejeita reflexão excedendo 500 caracteres');

// 4. Segurança e RLS
console.log('\n4. Testes de RLS e Políticas de Dados');

// Simulação de localStorage para o teste em Node/TSX
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
  length: 0,
  key: () => null,
};

async function testRls() {
  const repo = new AwarenessRepository();
  repo.setAuthenticatedUser('user_A', false);

  const entryA = await repo.saveEntry({
    resourceSlug: 'sons-para-awareness',
    sessionId: 'sess_1',
    clientRequestId: 'req_1',
    schemaVersion: 1,
    contentVersion: '1.2.0',
    mode: 'guided',
    durationSeconds: 120,
    observations: [],
    personalReflection: 'Reflexão privada do Usuário A',
    isPrivate: true,
  });

  assert(entryA.userId === 'user_A', 'Registro associado corretamente ao usuário autenticado A');

  // Usuário B tenta listar registros
  repo.setAuthenticatedUser('user_B', false);
  const entriesB = await repo.getStudentEntries();
  assert(entriesB.length === 0, 'RLS ativa: Usuário B não consegue visualizar dados de Usuário A');

  // Usuário B tenta excluir registro de A
  let deleteBlocked = false;
  try {
    await repo.deleteEntry(entryA.id);
  } catch (err) {
    deleteBlocked = true;
  }
  assert(deleteBlocked, 'RLS ativa: Usuário B impedido de excluir registro pertencente a Usuário A');

  // Sessão Anônima tenta salvar
  repo.setAuthenticatedUser('user_anon', true);
  let anonBlocked = false;
  try {
    await repo.saveEntry({
      resourceSlug: 'sons-para-awareness',
      sessionId: 'sess_anon',
      clientRequestId: 'req_anon',
      schemaVersion: 1,
      contentVersion: '1.2.0',
      mode: 'free',
      durationSeconds: 60,
      observations: [],
      personalReflection: null,
      isPrivate: true,
    });
  } catch {
    anonBlocked = true;
  }
  assert(anonBlocked, 'Sessões anônimas não podem salvar no histórico privado permanente');
}

testRls().then(() => {
  console.log(`\n=== RESUMO: ${passed} passaram, ${failed} falharam ===`);
  if (failed > 0) {
    process.exit(1);
  }
});
