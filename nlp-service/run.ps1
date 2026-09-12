$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$cache = Join-Path $root ".cache"
$env:PIP_CACHE_DIR = Join-Path $cache "pip"
$env:HF_HOME = Join-Path $cache "huggingface"
$env:TORCH_HOME = Join-Path $cache "torch"
$env:XDG_CACHE_HOME = $cache
& (Join-Path $root "venv\Scripts\Activate.ps1")
uvicorn app.main:app --host 0.0.0.0 --port 8002
