/**
 * Suíte de Testes Automatizados - Rio dos Pensamentos & RLS
 * Executável via tsx / Node
 */

import {
  saveRiverSession,
  listUserRiverSessions,
  deleteRiverSession,
  exportUserData,
  updateEditorialContent,
  getPublishedResourceContent,
  DEMO_USERS,
  INITIAL_EDITORIAL_CONFIG,
  safeStorageClear,
} from '../repository';
import { RiverSceneEngine } from '../engine/riverScene';

// Helper de asserção simples e seguro
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`FALHA NO TESTE: ${message}`);
  }
}

async function runTests() {
  console.log('--- INICIANDO TESTES DO RIO DOS PENSAMENTOS ---');

  const userA = DEMO_USERS[0]; // Sofia (aluna)
  const userB = DEMO_USERS[1]; // Lucas (aluno)
  const userAdmin = DEMO_USERS[2]; // Maria Helena (admin)
  const userAnon = DEMO_USERS[3]; // Anônimo

  // Limpa storage prévio em ambiente de teste
  safeStorageClear();

  // TESTE 1: Isolamento A/B de Dados e RLS (B não vê dados de A)
  console.log('[1/6] Testando Isolamento A/B e RLS...');
  const reqIdA = 'req-test-a-1';
  const saveResultA = await saveRiverSession(
    {
      user_id: userA.id,
      client_request_id: reqIdA,
      resource_slug: 'rio-dos-pensamentos',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      active_duration_seconds: 180,
      mode: 'timed',
      planned_duration_seconds: 180,
      reflection: 'Percebi uma sensação de tranquilidade ao ver o pensamento ir embora.',
      schema_version: 1,
      content_version: 'v1.0.0',
    },
    userA
  );
  assert(saveResultA.success === true, 'Aluno A deveria conseguir salvar sua sessão');
  const sessionIdA = saveResultA.session!.id;

  // Aluno B lista sessões
  const listB = await listUserRiverSessions(userB);
  assert(listB.sessions.length === 0, 'Aluno B NÃO deve visualizar sessões do Aluno A (Isolamento RLS)');

  // Aluno B tenta excluir sessão de A
  const deleteByB = await deleteRiverSession(sessionIdA, userB);
  assert(deleteByB.success === false, 'Aluno B NÃO pode excluir dados do Aluno A (Proteção RLS)');

  // Aluno A lista sessões
  const listA = await listUserRiverSessions(userA);
  assert(listA.sessions.length === 1, 'Aluno A deve encontrar seu próprio registro');
  assert(listA.sessions[0].reflection?.includes('tranquilidade') === true, 'Reflexão de A deve corresponder');
  console.log(' -> OK: Isolamento de dados A/B verificado com sucesso.');

  // TESTE 2: Usuário Anônimo não salva no histórico compartilhado
  console.log('[2/6] Testando restrição para Usuário Anônimo...');
  const saveAnon = await saveRiverSession(
    {
      user_id: userAnon.id,
      client_request_id: 'req-anon-1',
      resource_slug: 'rio-dos-pensamentos',
      started_at: new Date().toISOString(),
      active_duration_seconds: 60,
      mode: 'free',
      schema_version: 1,
      content_version: 'v1.0.0',
    },
    userAnon
  );
  assert(saveAnon.success === false, 'Usuário anônimo não deve salvar sessão persistente');
  console.log(' -> OK: Usuário anônimo rejeitado com segurança.');

  // TESTE 3: Portabilidade e Exportação de Dados (LGPD/GDPR)
  console.log('[3/6] Testando Exportação de Dados próprios...');
  const exportA = await exportUserData(userA);
  assert(exportA.data.length === 1, 'Exportação de A deve conter apenas registros de A');
  assert(exportA.data[0].id === sessionIdA, 'ID exportado deve corresponder ao registro de A');

  const exportB = await exportUserData(userB);
  assert(exportB.data.length === 0, 'Exportação de B deve vir vazia sem contaminar dados de A');
  console.log(' -> OK: Portabilidade e privacidade validadas.');

  // TESTE 4: Autorização Editorial (Aluno não publica catálogo; Admin publica)
  console.log('[4/6] Testando Autorização Editorial do CMS...');
  const updateAttemptByStudent = await updateEditorialContent(
    {
      ...INITIAL_EDITORIAL_CONFIG,
      title: 'Título Invasivo por Aluno',
    },
    userA
  );
  assert(updateAttemptByStudent.success === false, 'Aluno não deve conseguir alterar configurações editoriais');

  const updateAttemptByAdmin = await updateEditorialContent(
    {
      ...INITIAL_EDITORIAL_CONFIG,
      title: 'Rio dos Pensamentos (Atualizado)',
    },
    userAdmin
  );
  assert(updateAttemptByAdmin.success === true, 'Admin deve conseguir atualizar parâmetros editoriais');
  
  const currentContent = await getPublishedResourceContent();
  assert(currentContent.title === 'Rio dos Pensamentos (Atualizado)', 'Conteúdo atualizado deve estar disponível');
  console.log(' -> OK: Regras de papel e autorização docente/discente validadas.');

  // TESTE 5: Efemeridade e Limite de Folhas no Motor do Rio
  console.log('[5/6] Testando Motor da Cena (RiverSceneEngine)...');
  const scene = new RiverSceneEngine(8);
  assert(scene.getLeaves().length === 0, 'Cena deve iniciar vazia');

  for (let i = 0; i < 8; i++) {
    const res = scene.addLeaf(`Pensamento de teste ${i + 1}`);
    assert(res.success === true, `Folha ${i + 1} deve ser inserida`);
  }
  assert(scene.getLeaves().length === 8, 'Cena deve conter exatamente 8 folhas');

  // Tentativa de 9ª folha quando lotado
  const ninth = scene.addLeaf('Pensamento excedente');
  assert(ninth.success === false, 'Motor deve impedir inserção além do limite de 8 folhas');
  assert(scene.getLeaves().length === 8, 'Contagem de folhas deve permanecer em 8');

  // Travessia e descarte ao cruzar o rio
  let exitedCount = 0;
  scene.onLeafExit(() => {
    exitedCount++;
  });

  // Simula avanço de tempo para fazer uma folha cruzar o limite xProgress >= 1.06
  const firstLeaf = scene.getLeaves()[0];
  firstLeaf.xProgress = 1.055;
  for (let f = 0; f < 10; f++) {
    scene.update(0.1);
  }

  assert(exitedCount === 1, 'Folha que cruzou deve disparar callback de saída');
  assert(scene.getLeaves().length === 7, 'Folha que saiu deve ser descartada da memória imediatamente');
  console.log(' -> OK: Limite de 8 folhas e efemeridade em memória validados.');

  // TESTE 6: Validação de Idempotência e Limite de Reflexão (<= 500 chars)
  console.log('[6/6] Testando Idempotência e Limites Éticos de Caracteres...');
  const duplicateSave = await saveRiverSession(
    {
      user_id: userA.id,
      client_request_id: reqIdA, // mesma chave
      resource_slug: 'rio-dos-pensamentos',
      started_at: new Date().toISOString(),
      active_duration_seconds: 180,
      mode: 'timed',
      schema_version: 1,
      content_version: 'v1.0.0',
    },
    userA
  );
  assert(duplicateSave.success === true, 'Operação idempotente deve retornar sucesso');
  const allSessionsA = await listUserRiverSessions(userA);
  assert(allSessionsA.sessions.length === 1, 'Não deve criar linha duplicada para a mesma requisição');

  const longReflection = 'a'.repeat(501);
  const invalidSave = await saveRiverSession(
    {
      user_id: userA.id,
      client_request_id: 'req-long-ref',
      resource_slug: 'rio-dos-pensamentos',
      started_at: new Date().toISOString(),
      active_duration_seconds: 100,
      mode: 'free',
      reflection: longReflection,
      schema_version: 1,
      content_version: 'v1.0.0',
    },
    userA
  );
  assert(invalidSave.success === false, 'Reflexão com mais de 500 caracteres deve ser rejeitada');
  console.log(' -> OK: Idempotência e limites de validação aprovados.');

  // TESTE 7: Camadas de Sedimentos e Coordenadas do Shader WebGL
  console.log('[7/7] Testando Camadas de Sedimentos e Shader Coordinates...');
  const sediments = scene.getSediments();
  assert(sediments.length > 0, 'Cena deve possuir partículas e sedimentos fluviais');
  const deepCount = sediments.filter(s => s.layer === 'deep').length;
  const midCount = sediments.filter(s => s.layer === 'mid').length;
  const surfaceCount = sediments.filter(s => s.layer === 'surface').length;
  assert(deepCount > 0 && midCount > 0 && surfaceCount > 0, 'Sedimentos devem estar distribuídos nas 3 camadas de profundidade');

  const shaderLeaves = scene.getShaderLeavesData(400);
  assert(shaderLeaves.length === scene.getLeaves().length, 'Shader data deve corresponder ao número de folhas ativas');
  assert(shaderLeaves[0].scale > 0, 'Escala da folha para shader deve ser válida');
  console.log(' -> OK: Sedimentos em 3 camadas e dados de shader validados.');

  console.log('\nTODOS OS TESTES DO RIO DOS PENSAMENTOS PASSARAM COM SUCESSO!');
}

runTests().catch(err => {
  console.error('\nFALHA NOS TESTES:', err);
  process.exit(1);
});
