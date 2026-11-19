<#
.SYNOPSIS
    Safe Conventional-Commit & Git Push workflow for Windows PowerShell 5.1 and 7+.
.DESCRIPTION
    Validates Conventional Commit syntax, verifies repository hygiene (no nested .git or
    secrets/dist staging), runs verification-runner, commits with UTF-8 encoding, and pushes
    safely without --force.
#>

[CmdletBinding(PositionalBinding = $false)]
param (
    [Parameter(Mandatory = $true)]
    [string]$Message,

    [Parameter(Mandatory = $false)]
    [string[]]$Paths = @(),

    [Parameter(Mandatory = $false)]
    [switch]$All,

    [Parameter(Mandatory = $false)]
    [string]$Remote = "origin",

    [Parameter(Mandatory = $false)]
    [string]$Branch = "",

    [Parameter(Mandatory = $false)]
    [switch]$NoPush,

    [Parameter(Mandatory = $false)]
    [switch]$SkipVerify,

    [Parameter(Mandatory = $false)]
    [switch]$DryRun,

    [Parameter(Mandatory = $false, ValueFromRemainingArguments = $true)]
    [string[]]$RemainingArgs = @()
)

$env:PYTHONIOENCODING = "utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
$script:exitCode = 0

function Invoke-GitCommitPush {
    Push-Location $repoRoot
    try {
        if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
            Write-Error "[git-commit-push] Repository root '$repoRoot' is not a Git repository."
            $script:exitCode = 1
            return
        }

        $rawPathItems = @()
        if ($Paths.Count -gt 0) {
            $rawPathItems += $Paths
            if ($RemainingArgs.Count -gt 0) {
                $rawPathItems += $RemainingArgs
            }
        } elseif ($RemainingArgs.Count -gt 0) {
            Write-Error "[git-commit-push] Unexpected positional arguments: $($RemainingArgs -join ' ')"
            $script:exitCode = 1
            return
        }

        $resolvedPaths = @()
        foreach ($item in $rawPathItems) {
            if ([string]::IsNullOrWhiteSpace($item)) {
                continue
            }
            foreach ($part in ($item -split ',')) {
                $trimmed = $part.Trim()
                if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
                    $resolvedPaths += $trimmed
                }
            }
        }

        $ccPattern = '^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\([a-z0-9][a-z0-9\-/]*\))?!?: .+'
        if (-not ($Message -cmatch $ccPattern)) {
            Write-Error "[git-commit-push] Commit message must follow Conventional Commits (e.g. 'feat: add feature'). Got: '$Message'"
            $script:exitCode = 1
            return
        }

        $targetBranch = $Branch
        if ([string]::IsNullOrWhiteSpace($targetBranch)) {
            $targetBranch = ((git branch --show-current 2>$null) | Out-String).Trim()
        }
        if ([string]::IsNullOrWhiteSpace($targetBranch)) {
            Write-Error "[git-commit-push] Detached HEAD detected or branch could not be resolved. Pass -Branch explicitly or checkout a branch."
            $script:exitCode = 1
            return
        }

        $remoteUrl = ""
        if (-not $NoPush) {
            $remoteUrl = ((git remote get-url $Remote 2>$null) | Out-String).Trim()
            if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remoteUrl)) {
                Write-Error "[git-commit-push] Git remote '$Remote' is not configured. Use -NoPush for local-only commits."
                $script:exitCode = 1
                return
            }
        }

        if (Test-Path ".agents/skills") {
            $nestedGit = @(Get-ChildItem -Path ".agents/skills" -Force -Recurse -Filter ".git" -ErrorAction SilentlyContinue)
            if ($nestedGit.Count -gt 0) {
                $foundPaths = ($nestedGit | ForEach-Object { $_.FullName }) -join "; "
                Write-Error "[git-commit-push] Nested .git entry detected inside .agents/skills: $foundPaths"
                $script:exitCode = 1
                return
            }
        }

        if (-not $SkipVerify) {
            $verifyScript = Join-Path $repoRoot ".agents\skills\verification-runner\scripts\verify.ps1"
            if (-not (Test-Path $verifyScript)) {
                Write-Error "[git-commit-push] Verification script not found at '$verifyScript'."
                $script:exitCode = 1
                return
            }
            Write-Host "[git-commit-push] Running verification-runner..." -ForegroundColor Cyan
            if ($NoPush) {
                & powershell -NoProfile -ExecutionPolicy Bypass -File $verifyScript
            } else {
                & powershell -NoProfile -ExecutionPolicy Bypass -File $verifyScript -RequireRemote
            }
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[git-commit-push] verification-runner failed with exit code $LASTEXITCODE. Aborting commit/push."
                $script:exitCode = $LASTEXITCODE
                return
            }
        }

        if ($DryRun) {
            $stageMode = "Staged index only (no git add)"
            if ($resolvedPaths.Count -gt 0) {
                $stageMode = "Specific paths: $($resolvedPaths -join ', ')"
            } elseif ($All) {
                $stageMode = "All changes (git add -A)"
            }

            Write-Host "`n[DRY-RUN] Planned git-commit-push execution:" -ForegroundColor Yellow
            Write-Host "  Repo Root   : $repoRoot"
            Write-Host "  Stage Mode  : $stageMode"
            Write-Host "  Commit Msg  : $Message"
            if ($NoPush) {
                Write-Host "  Push Target : (disabled via -NoPush)"
            } else {
                Write-Host "  Push Target : $Remote/$targetBranch ($remoteUrl)"
            }
            Write-Host "  Working Tree Status:"
            git status --short
            $script:exitCode = 0
            return
        }

        if ($resolvedPaths.Count -gt 0) {
            foreach ($p in $resolvedPaths) {
                git add -- $p
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "[git-commit-push] Failed to stage path '$p'."
                    $script:exitCode = $LASTEXITCODE
                    return
                }
            }
        } elseif ($All) {
            git add -A
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[git-commit-push] 'git add -A' failed."
                $script:exitCode = $LASTEXITCODE
                return
            }
        }

        $stagedFiles = @(git diff --cached --name-only)
        if ($LASTEXITCODE -ne 0) {
            Write-Error "[git-commit-push] Failed to inspect staged files."
            $script:exitCode = $LASTEXITCODE
            return
        }
        if ($stagedFiles.Count -eq 0) {
            Write-Error "[git-commit-push] Nothing is staged to commit."
            $script:exitCode = 1
            return
        }

        $stagedRaw = @(git diff --cached --raw)
        foreach ($rawLine in $stagedRaw) {
            if ($rawLine -match '\s160000\s') {
                Write-Error "[git-commit-push] Refusing to commit embedded gitlink/submodule (mode 160000): $rawLine"
                $script:exitCode = 1
                return
            }
        }

        $forbiddenPattern = '(^|/)(\.env(\..+)?|.*\.(pem|key|pfx|cert))$|^dist/'
        foreach ($stagedPath in $stagedFiles) {
            if ($stagedPath -match $forbiddenPattern) {
                Write-Error "[git-commit-push] Refusing to commit sensitive or ignored build file: $stagedPath"
                $script:exitCode = 1
                return
            }
        }

        $msgFile = [System.IO.Path]::GetTempFileName()
        try {
            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            [System.IO.File]::WriteAllText($msgFile, $Message, $utf8NoBom)
            git -c i18n.commitEncoding=utf-8 commit -F $msgFile
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[git-commit-push] 'git commit' failed."
                $script:exitCode = $LASTEXITCODE
                return
            }
        } finally {
            if (Test-Path $msgFile) {
                Remove-Item -Path $msgFile -Force -ErrorAction SilentlyContinue
            }
        }

        $localSha = ((git rev-parse HEAD) | Out-String).Trim()
        Write-Host "[git-commit-push] Committed $localSha on branch '$targetBranch'." -ForegroundColor Green

        if (-not $NoPush) {
            Write-Host "[git-commit-push] Pushing '$targetBranch' to '$Remote'..." -ForegroundColor Cyan
            git push -u $Remote $targetBranch
            if ($LASTEXITCODE -ne 0) {
                Write-Error "[git-commit-push] 'git push -u $Remote $targetBranch' failed with exit code $LASTEXITCODE."
                $script:exitCode = $LASTEXITCODE
                return
            }

            $remoteRefLine = ((git ls-remote --heads $Remote $targetBranch) | Select-Object -First 1 | Out-String).Trim()
            if ([string]::IsNullOrWhiteSpace($remoteRefLine)) {
                Write-Error "[git-commit-push] Unable to confirm '$targetBranch' on remote '$Remote' after push."
                $script:exitCode = 1
                return
            }

            $remoteSha = ($remoteRefLine -split '\s+')[0].Trim()
            if ($remoteSha -ne $localSha) {
                Write-Error "[git-commit-push] Remote SHA '$remoteSha' does not match local HEAD '$localSha'."
                $script:exitCode = 1
                return
            }

            Write-Host "[git-commit-push] Push verified! $Remote/$targetBranch is at $remoteSha ($remoteUrl)" -ForegroundColor Green
        }
    } finally {
        Pop-Location
    }
}

Invoke-GitCommitPush
exit $script:exitCode
