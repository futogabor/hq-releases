# HQ

HQ (Helios Query) is a Mac app that keeps track of every software project on
your Mac: where each one lives, what it runs on, which accounts and logins it
depends on, what is out of date or vulnerable, what exists only on this Mac,
and what renews when. It runs routine checks in the background without spending
AI tokens, and lets your AI coding agents (Claude Code, Codex, Cursor,
Antigravity and others) ask the same questions through its MCP server and
push/deploy guard.

It is for people who build software on their Mac with AI coding tools — whether
you juggle several agents at once or want one clear place to see what needs
attention across your projects.

## Download

**[Download the latest version](https://github.com/futogabor/hq-releases/releases/latest)**:
on that page, click `HQ-<version>.zip` under Assets.

You need a Mac with Apple silicon (M1 or later) and macOS 15 or later. HQ is
signed with a Developer ID and notarized by Apple, so it opens like any other
app.

## Install

1. Open the zip. It unpacks `HQ.app`.
2. Move `HQ.app` to your Applications folder.
3. Open it.

HQ updates itself. On the second launch it asks whether to check for updates
automatically, and HQ > Check for Updates looks right away.

## First run (5-step Setup Guide)

Opening HQ walks you through one guided setup (you can reopen it anytime from
**Help > Setup Guide**):

1. **Folders & privacy:** Choose where HQ keeps its registry (`~/HQ` by
   default, plain YAML files in its own git repo), which folders to scan, and
   whether to enable GitHub PR/CI checks and built-in dependency vulnerability
   lookups (`api.osv.dev` — no extra tool required).
2. **Scan & projects:** Watch the first scan step by step, then pick which
   discovered projects to track.
3. **Tools & logins:** Optional checks for Apple Command Line Tools, GitHub's
   `gh` CLI (for PRs, CI checks and Dependabot), macOS folder permissions,
   platform CLI logins, and git 2.54+ for the machine-wide pre-push guard.
   Includes live **Check Again** and extra CLI PATH folders (for nvm/volta/mise).
4. **Connect agents:** One-click setup for Claude Code, Codex, Cursor,
   Antigravity and git — choose MCP (with **Core** 8-tool mode to save context
   tokens, or **All** 28 tools), the push/deploy guard, and optional
   cross-agent session handoffs. Nothing changes until you click **Set Up**,
   and HQ keeps `.hq-backup` copies of edited hooks files.
5. **Finish:** Turn on open-at-login and background refresh, and see your first
   **Do First** item with one-click **Copy Fix** or **Copy Task** (including
   launching the project directly in Antigravity, Cursor, VS Code or Terminal).

Projects built purely in cloud tools (Lovable, Bolt, v0) show up through their
GitHub pull requests and branches once cloned locally or added to the registry
with their GitHub repository.

## What HQ reads, and what it never does

- **Read-only on your projects.** It never moves, renames or deletes
  anything in them. The one exception is in Disk: moving a git-ignored
  build or cache folder to the Trash after you confirm.
- **No secrets.** `.env`, key, token and credential files are recorded by
  name, never opened. HQ never stores passwords, tokens or keys.
- **Stays on your Mac.** No HQ account, no analytics, no tracking. Every
  network request is listed in Settings > Network: GitHub through your own
  `gh` login, the platform CLIs you already use (to see which account each
  is logged in to), opt-in vulnerability lookups (`api.osv.dev`, built-in or
  via `osv-scanner` if installed), end-of-life dates (`endoflife.date`),
  domain and certificate expiry, and update checks to this repository.
- **Agents ask, you decide.** Changes an agent proposes to accounts, links
  and renewals wait for your approval in the app. Every change to the
  registry is a git commit you can revert.

## Feedback

Found a bug, or something unclear? [Open an issue](https://github.com/futogabor/hq-releases/issues).

## Versions

What changed in each version: [Releases](https://github.com/futogabor/hq-releases/releases).
