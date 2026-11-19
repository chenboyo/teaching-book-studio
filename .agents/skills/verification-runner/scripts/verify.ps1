<#
.SYNOPSIS
    Automated Agent Repository Baseline, Dual-Track Memory, Skill Hygiene, Pedagogy Audit, & App Verification.
.DESCRIPTION
    Validates Git repository setup, Rules (4), Dual-Track Memory (7), Skills structure, YAML frontmatter,
    Git trackability, absence of nested .git or personal machine paths, npm test, npm run audit-books, and offline build.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [switch]$SkipAppChecks,

    [Parameter(Mandatory = $false)]
    [switch]$RequireRemote
)

$env:PYTHONIOENCODING = "utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
$script:passed = 0
$script:failed = 0

function Assert-Condition {
    param (
        [string]$Name,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $Name" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  [FAIL] $Name" -ForegroundColor Red
        if ($Details) {
            Write-Host "         $Details" -ForegroundColor Yellow
        }
        $script:failed++
    }
}

Push-Location $repoRoot
try {
    Write-Host "=== 1. Git Repository Checks ===" -ForegroundColor Cyan
    $isGit = Test-Path -Path ".git"
    Assert-Condition -Name "Git repository initialized" -Condition $isGit
    $gitBranch = ((git branch --show-current 2>$null) | Out-String).Trim()
    Assert-Condition -Name "Git branch is 'main'" -Condition ($gitBranch -eq "main") -Details "Current branch: $gitBranch"
    Assert-Condition -Name ".gitignore exists" -Condition (Test-Path -Path ".gitignore")
    Assert-Condition -Name ".gitattributes exists" -Condition (Test-Path -Path ".gitattributes")

    $originUrl = ((git remote get-url origin 2>$null) | Out-String).Trim()
    $hasOrigin = ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($originUrl))
    if ($RequireRemote) {
        Assert-Condition -Name "Git remote 'origin' configured" -Condition $hasOrigin -Details "origin: $originUrl"
    } else {
        if ($hasOrigin) {
            Write-Host "  [INFO] Git remote 'origin': $originUrl" -ForegroundColor DarkGray
        } else {
            Write-Host "  [INFO] Git remote 'origin' is not configured yet (local-only repo; pass -RequireRemote to enforce)." -ForegroundColor DarkGray
        }
    }

    Write-Host "`n=== 2. Root Charters & Rules Checks ===" -ForegroundColor Cyan
    Assert-Condition -Name "Root AGENTS.md exists" -Condition (Test-Path -Path "AGENTS.md")
    Assert-Condition -Name "Root GEMINI.md exists" -Condition (Test-Path -Path "GEMINI.md")

    $ruleFiles = @(
        ".agents/rules/coding-standards.md",
        ".agents/rules/git-and-worktrees.md",
        ".agents/rules/memory-management.md",
        ".agents/rules/pedagogy-and-design.md"
    )
    foreach ($r in $ruleFiles) {
        Assert-Condition -Name "Rule file exists: $r" -Condition (Test-Path -Path $r)
    }

    Write-Host "`n=== 3. Dual-Track Memory Architecture Checks ===" -ForegroundColor Cyan
    Assert-Condition -Name "Root MEMORY.md exists" -Condition (Test-Path -Path "MEMORY.md")

    $memoryFiles = @(
        ".agents/memory/project_context.md",
        ".agents/memory/active_context.md",
        ".agents/memory/decisions.md",
        ".agents/memory/learnings.md",
        ".agents/memory/scratchpad.md",
        ".agents/memory/editorial_style.md",
        ".agents/memory/curriculum_glossary.md"
    )
    foreach ($m in $memoryFiles) {
        Assert-Condition -Name "Memory file exists: $m" -Condition (Test-Path -Path $m)
    }

    Write-Host "`n=== 4. Project-Scoped Skills Validation ===" -ForegroundColor Cyan
    $skillDirs = @(Get-ChildItem -Path ".agents/skills" -Directory -ErrorAction SilentlyContinue)
    Assert-Condition -Name "Project-scoped skills found (>= 8)" -Condition ($skillDirs.Count -ge 8) -Details "Found $($skillDirs.Count) skills"

    foreach ($skill in $skillDirs) {
        $skillMdPath = Join-Path $skill.FullName "SKILL.md"
        $hasSkillMd = Test-Path $skillMdPath
        Assert-Condition -Name "Skill $($skill.Name): SKILL.md exists" -Condition $hasSkillMd

        if ($hasSkillMd) {
            $content = Get-Content -Path $skillMdPath -Raw -Encoding utf8
            $hasValidFrontmatter = $false
            $fmDetails = ""
            if ($content -match '(?s)^---\r?\n(.*?)\r?\n---(\r?\n|$)') {
                $fm = $Matches[1]
                $hasName = $fm -match '(?m)^name:\s*([a-z0-9][a-z0-9-]*)\s*$'
                $nameMatchesDir = $false
                if ($hasName) {
                    $parsedName = $Matches[1].Trim()
                    $nameMatchesDir = ($parsedName -eq $skill.Name)
                }
                $hasDesc = $fm -match '(?m)^description:\s*(\S.+|>-\s*$|\|\s*$)'
                $hasValidFrontmatter = ($hasName -and $nameMatchesDir -and $hasDesc)
                if (-not $hasValidFrontmatter) {
                    $fmDetails = "hasName=$hasName, nameMatchesDir=$nameMatchesDir, hasDesc=$hasDesc"
                }
            } else {
                $fmDetails = "Missing or malformed YAML frontmatter block"
            }
            Assert-Condition -Name "Skill $($skill.Name): valid YAML frontmatter" -Condition $hasValidFrontmatter -Details $fmDetails

            $relSkillMd = ".agents/skills/$($skill.Name)/SKILL.md"
            $ignoredOut = ((git check-ignore $relSkillMd 2>$null) | Out-String).Trim()
            $isTrackable = ($LASTEXITCODE -ne 0 -and [string]::IsNullOrWhiteSpace($ignoredOut))
            Assert-Condition -Name "Skill $($skill.Name): Git-trackable (not ignored)" -Condition $isTrackable -Details $ignoredOut
        }
    }

    $nestedGit = @(Get-ChildItem -Path ".agents/skills" -Force -Recurse -Filter ".git" -ErrorAction SilentlyContinue)
    Assert-Condition -Name "No nested .git inside .agents/skills" -Condition ($nestedGit.Count -eq 0) -Details "Found $($nestedGit.Count) nested .git entries"

    $skillTextFiles = @(Get-ChildItem -Path ".agents/skills" -Recurse -File -Include @("*.md", "*.ps1", "*.mjs", "*.js", "*.json", "*.txt") -ErrorAction SilentlyContinue)
    $personalPathHits = @()
    $personalPathPattern = '(?i)([A-Z]:\\Users\\[A-Za-z0-9_.-]+\\|/Users/[A-Za-z0-9_.-]+/)'
    foreach ($f in $skillTextFiles) {
        $text = Get-Content -Path $f.FullName -Raw -Encoding utf8
        if ($text -match $personalPathPattern) {
            $personalPathHits += $f.FullName
        }
    }
    Assert-Condition -Name "No personal machine paths inside .agents/skills" -Condition ($personalPathHits.Count -eq 0) -Details ($personalPathHits -join ", ")

    if (-not $SkipAppChecks -and (Test-Path "package.json")) {
        Write-Host "`n=== 5. Application Tests, Pedagogy Audit & Offline Build ===" -ForegroundColor Cyan
        $testOut = ((& npm test 2>&1) | Out-String)
        $testExit = $LASTEXITCODE
        Assert-Condition -Name "npm test passes" -Condition ($testExit -eq 0) -Details $testOut.Trim()

        $auditOut = ((& npm run audit-books 2>&1) | Out-String)
        $auditExit = $LASTEXITCODE
        Assert-Condition -Name "npm run audit-books passes (0 errors)" -Condition ($auditExit -eq 0) -Details $auditOut.Trim()

        $buildOut = ((& npm run build 2>&1) | Out-String)
        $buildExit = $LASTEXITCODE
        $hasDistIndex = Test-Path "dist/index.html"
        $allBookDistsExist = $true
        $missingBookDists = @()
        if (Test-Path "books") {
            $bookDirs = @(Get-ChildItem -Path "books" -Directory -ErrorAction SilentlyContinue)
            foreach ($bd in $bookDirs) {
                $manifestPath = Join-Path $bd.FullName "book.json"
                if (Test-Path $manifestPath) {
                    $distBookHtml = Join-Path $repoRoot ("dist\books\" + $bd.Name + "\index.html")
                    if (-not (Test-Path $distBookHtml)) {
                        $allBookDistsExist = $false
                        $missingBookDists += $distBookHtml
                    }
                }
            }
        }
        Assert-Condition -Name "npm run build succeeds & outputs dist/index.html + book singles" -Condition ($buildExit -eq 0 -and $hasDistIndex -and $allBookDistsExist) -Details (($buildOut.Trim() + " Missing: " + ($missingBookDists -join ", ")).Trim())
    }
} finally {
    Pop-Location
}

Write-Host "`n=== Verification Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $script:passed" -ForegroundColor Green
$failColor = "Red"
if ($script:failed -eq 0) {
    $failColor = "Green"
}
Write-Host "Failed: $script:failed" -ForegroundColor $failColor

if ($script:failed -gt 0) {
    exit 1
} else {
    Write-Host "`nAll verification checks passed successfully!" -ForegroundColor Green
    exit 0
}
