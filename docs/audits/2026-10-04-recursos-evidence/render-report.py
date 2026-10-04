"""Render the audit's known Markdown subset to a portable, self-contained HTML."""
import base64
import html
from pathlib import Path
import re

folder = Path(__file__).resolve().parent.parent
source = folder / '2026-10-04-qualidade-recursos-interativos.md'
target = source.with_suffix('.html')
text = source.read_text(encoding='utf-8')

def inline(value):
    value = html.escape(value)
    value = re.sub(r'`([^`]+)`', r'<code>\1</code>', value)
    value = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', value)
    return re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<a href="\2">\1</a>', value)

parts = []
paragraph = []
listing = False
table = False
images = []

def flush():
    if paragraph:
        parts.append('<p>' + inline(' '.join(paragraph)) + '</p>')
        paragraph.clear()

for line in text.splitlines() + ['']:
    if not line.strip():
        flush()
        if listing:
            parts.append('</ul>')
            listing = False
        if table:
            parts.append('</tbody></table></div>')
            table = False
        continue
    image = re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)', line)
    if image:
        flush()
        path = (folder / image[2]).resolve()
        encoded = base64.b64encode(path.read_bytes()).decode('ascii')
        images.append(path.name)
        parts.append(f'<figure><img src="data:image/png;base64,{encoded}" alt="{html.escape(image[1])}"><figcaption>{html.escape(image[1])}</figcaption></figure>')
        continue
    heading = re.match(r'^(#{1,4}) (.+)$', line)
    if heading:
        flush()
        level = len(heading[1])
        parts.append(f'<h{level}>{inline(heading[2])}</h{level}>')
        continue
    if line.startswith('|'):
        flush()
        cells = [part.strip() for part in line.strip('|').split('|')]
        if all(re.fullmatch(r':?-+:?', cell) for cell in cells):
            continue
        if not table:
            parts.append('<div class="table-wrap"><table><thead><tr>' + ''.join('<th>'+inline(cell)+'</th>' for cell in cells) + '</tr></thead><tbody>')
            table = True
        else:
            parts.append('<tr>' + ''.join('<td>'+inline(cell)+'</td>' for cell in cells) + '</tr>')
        continue
    if line.startswith('- '):
        flush()
        if not listing:
            parts.append('<ul>')
            listing = True
        parts.append('<li>'+inline(line[2:])+'</li>')
        continue
    paragraph.append(line)

css = '''
:root{color-scheme:light;--green:#173e2c;--ink:#27352c;--muted:#59655c;--line:#d8dcd1;--paper:#fbfaf5}
*{box-sizing:border-box}body{margin:0;background:#f0f2eb;color:var(--ink);font:16px/1.7 system-ui,Segoe UI,sans-serif}
main{max-width:1120px;margin:40px auto;padding:56px 64px;background:var(--paper);border:1px solid var(--line);border-radius:16px}
.eyebrow{color:#82612f;font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:700}
h1,h2,h3{font-family:Georgia,serif;color:var(--green);line-height:1.25}h1{font-size:38px;max-width:850px;margin:16px 0 24px}
h2{font-size:28px;margin:48px 0 20px;padding-top:28px;border-top:1px solid var(--line)}h3{font-size:23px;margin:36px 0 16px}
p{margin:16px 0}a{color:#00663d;text-underline-offset:3px}strong{font-weight:700}code{font:13px/1.5 Consolas,monospace;overflow-wrap:anywhere;background:#e9ece3;padding:2px 5px;border-radius:4px}
li{margin:10px 0}.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px;margin:24px 0}
table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.55;min-width:650px}th{text-align:left;background:#e9eee2;color:var(--green)}th,td{padding:14px 16px;border-bottom:1px solid var(--line);vertical-align:top}tr:last-child td{border-bottom:0}
figure{margin:28px 0;padding:20px;background:#e9ece4;border:1px solid var(--line);border-radius:10px;text-align:center;break-inside:avoid}
figure img{display:block;max-width:100%;width:auto;max-height:760px;margin:auto;border-radius:5px}figcaption{font-size:13px;color:var(--muted);margin-top:12px}
.footer{font-size:13px;color:var(--muted);margin-top:48px;border-top:1px solid var(--line);padding-top:20px}
@media(max-width:700px){body{background:var(--paper)}main{margin:0;padding:24px 18px;border:0;border-radius:0}h1{font-size:30px}h2{font-size:25px}h3{font-size:21px}figure{padding:10px}}
@media print{body{background:white}main{border:0;margin:0;padding:0;max-width:none}figure img{max-height:180mm}h2,h3{break-after:avoid}.table-wrap{overflow:visible}table{min-width:0;font-size:11px}th,td{padding:7px}a{color:inherit}}
'''
document = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Figura Viva — Auditoria de recursos interativos</title><style>'+css+'</style></head><body><main><div class="eyebrow">Auditoria de qualidade · 04 outubro 2026</div>'+''.join(parts)+'<p class="footer">Relatório local. As imagens estão incorporadas neste arquivo para permitir leitura sem depender do servidor da aplicação.</p></main></body></html>'
target.write_text(document, encoding='utf-8')
print(f'HTML criado: {target.name}; {len(images)} imagens incorporadas; {target.stat().st_size} bytes.')
