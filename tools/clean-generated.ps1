[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$IncludeNext,
    [switch]$IncludeNodeModules
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

$targets = @(
    'playwright-report',
    'test-results',
    'tsconfig.tsbuildinfo',
    '.swc',
    'system_map.md'
)

if ($IncludeNext) {
    $nodeProcesses = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
        Where-Object { $_.CommandLine -like "*$projectRoot*next*dev*" }

    if ($nodeProcesses) {
        throw 'O servidor Next.js deste projeto esta ativo. Pare-o antes de usar -IncludeNext.'
    }

    $targets += '.next'
}

if ($IncludeNodeModules) {
    $targets += 'node_modules'
}

$protectedPrefixes = @('.worktrees', '.claude', '.agent', '.git', 'src', 'public', 'docs')

foreach ($relativeTarget in $targets) {
    if ($protectedPrefixes | Where-Object { $relativeTarget -eq $_ -or $relativeTarget.StartsWith("$_\\") }) {
        throw "Alvo protegido recusado: $relativeTarget"
    }

    $target = Join-Path $projectRoot $relativeTarget
    if (-not (Test-Path -LiteralPath $target)) {
        Write-Host "Ausente: $relativeTarget"
        continue
    }

    if ($Apply) {
        Remove-Item -LiteralPath $target -Recurse -Force
        Write-Host "Removido: $relativeTarget"
    }
    else {
        Write-Host "Simulacao - seria removido: $relativeTarget"
    }
}

if (-not $Apply) {
    Write-Host 'Nenhum arquivo foi removido. Execute com -Apply para confirmar a limpeza.'
}
