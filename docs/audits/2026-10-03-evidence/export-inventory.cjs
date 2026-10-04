// Exporta o inventario ja levantado. Nao modifica codigo ou remove arquivos.
const fs = require('node:fs');
const path = require('node:path');
const dir = __dirname;
const v = JSON.parse(fs.readFileSync(path.join(dir, 'inventory.json'), 'utf8'));
const csv = (rows) => '\uFEFF' + rows.map(row => row.map(x => '"' + String(x ?? '').replaceAll('"', '""') + '"').join(';')).join('\r\n') + '\r\n';
const classify = (p) => p.startsWith('src/components/resources/apps/') ? 'Prototipo/recurso antigo: verificar entrada da funcionalidade atual'
  : p.includes('pause-room') ? 'Comparar com implementacao atual de pausas'
  : p.startsWith('src/actions/') ? 'Acao antiga: verificar exportacao como Server Action e consumidores externos'
  : p.includes('infrastructure') || p.includes('/lib/') ? 'Servico/repositorio: verificar uso indireto e migracao'
  : 'Componente/modulo: verificar imports dinamicos, CSS e uso manual';
fs.writeFileSync(path.join(dir, 'unused-candidates.csv'), csv([
  ['arquivo','situacao','revisao_necessaria','remocao_autorizada'],
  ...v.unreachableCandidates.map(p => [p, 'Candidato sem caminho desde entradas Next no grafo estatico', classify(p), 'Nao']),
]));
fs.writeFileSync(path.join(dir, 'duplicate-files.csv'), csv([
  ['grupo','arquivo','comparacao'],
  ...v.exactDuplicateGroups.flatMap((g, i) => g.map(p => [i + 1, p, 'Conteudo identico por SHA-256; revisar consumidores antes de consolidar'])),
]));
console.log(JSON.stringify({ candidates: v.unreachableCandidates.length, duplicateGroups: v.exactDuplicateGroups.length }));
