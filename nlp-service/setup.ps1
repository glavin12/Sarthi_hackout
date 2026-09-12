$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$cache = Join-Path $root ".cache"
$env:PIP_CACHE_DIR = Join-Path $cache "pip"
$env:HF_HOME = Join-Path $cache "huggingface"
$env:TORCH_HOME = Join-Path $cache "torch"
$env:XDG_CACHE_HOME = $cache
New-Item -ItemType Directory -Force -Path $cache | Out-Null
python -m venv (Join-Path $root "venv")
& (Join-Path $root "venv\Scripts\Activate.ps1")
python -m pip install --upgrade pip
pip install -r (Join-Path $root "requirements.txt")
Write-Host ""
Write-Host "Setup complete."
Write-Host "  venv:       $root\venv"
Write-Host "  pip cache:  $env:PIP_CACHE_DIR"
Write-Host "  HF cache:   $env:HF_HOME"
Write-Host "  Torch cache: $env:TORCH_HOME"
