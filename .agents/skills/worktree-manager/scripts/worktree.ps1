<#
.SYNOPSIS
    Git Worktree Manager for Agent Swarms on Windows.
.DESCRIPTION
    Provides automated helper routines to create, list, and clean isolated Git Worktrees
    for swarm workers, enforcing UTF-8 encoding and path safety.
.PARAMETER Action
    Action to perform: add, list, remove, prune
.PARAMETER Branch
    Branch name to create or checkout (e.g. feat/book-unit)
.PARAMETER Path
    Path to the worktree directory (e.g. ../wt-book-unit)
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [ValidateSet('add', 'list', 'remove', 'prune')]
    [string]$Action,

    [Parameter(Mandatory = $false)]
    [string]$Branch,

    [Parameter(Mandatory = $false)]
    [string]$Path
)

$env:PYTHONIOENCODING = "utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

switch ($Action) {
    'add' {
        if (-not $Branch -or -not $Path) {
            Write-Error "Action 'add' requires both -Branch and -Path parameters."
            exit 1
        }
        Write-Host "Creating worktree at '$Path' on branch '$Branch'..." -ForegroundColor Cyan
        git worktree add -b $Branch $Path main
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Worktree successfully initialized at '$Path'." -ForegroundColor Green
        } else {
            Write-Error "Failed to create worktree."
            exit $LASTEXITCODE
        }
    }
    'list' {
        Write-Host "Listing active Git Worktrees:" -ForegroundColor Cyan
        git worktree list
    }
    'remove' {
        if (-not $Path) {
            Write-Error "Action 'remove' requires -Path parameter."
            exit 1
        }
        Write-Host "Removing worktree at '$Path'..." -ForegroundColor Yellow
        git worktree remove $Path
        git worktree prune
        Write-Host "Worktree removed and pruned." -ForegroundColor Green
    }
    'prune' {
        Write-Host "Pruning stale worktrees..." -ForegroundColor Cyan
        git worktree prune -v
    }
}
