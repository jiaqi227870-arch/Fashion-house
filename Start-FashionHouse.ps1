$ErrorActionPreference = 'Stop'
$projectPath = $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) {
    $nodeExecutable = $nodeCommand.Source
} else {
    $nodeExecutable = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
}
if (-not (Test-Path -LiteralPath $nodeExecutable)) {
    throw 'Install Node.js 20 or later, then run npm start in this folder.'
}
Write-Host 'Fashion House preview: http://127.0.0.1:4186'
Write-Host 'Press Ctrl+C to stop the preview.'
& $nodeExecutable (Join-Path $projectPath 'server.mjs')
