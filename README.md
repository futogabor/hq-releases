# HQ

HQ (Helios Query) is a Mac app that keeps track of every software project on
your Mac: where each one lives, what it runs on, which accounts and logins it
depends on, what is out of date or vulnerable, what exists only on this Mac,
and what renews when. Your AI coding agents (Claude Code, Codex, Cursor and
others) can ask it the same questions through its MCP server, so each one
starts with the same picture.

It is for people who build software on their Mac, especially with several
coding agents at once.

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

## First run

1. Choose where HQ keeps its registry (`~/HQ` by default) and which folders
   it scans for projects. The registry is a folder with one small YAML file
   per project and account, in a git repository of its own.
2. HQ scans those folders. The first scan takes a minute or two, and Today
   shows each step.
3. Import what it found, then work through **Get HQ ready** on Today:
   - Install Apple's Command Line Tools, for git.
   - Install GitHub's `gh` and sign it in, for pull requests, checks and
     Dependabot alerts.
   - Let HQ read the folders it scans. macOS asks before HQ can read folders
     such as Desktop and Documents.
   - Sign platform CLIs (Vercel, Cloudflare, Supabase and others) into your
     projects' accounts.
4. To connect your coding agents, open Agents and copy the setup for your
   app.

## What HQ reads, and what it never does

- **Read-only on your projects.** It never moves, renames or deletes
  anything in them. The one exception is in Disk: moving a git-ignored
  build or cache folder to the Trash after you confirm.
- **No secrets.** `.env`, key, token and credential files are recorded by
  name, never opened. HQ never stores passwords, tokens or keys.
- **Stays on your Mac.** No HQ account, no analytics, no tracking. Every
  network request is listed in Settings > Network: GitHub through your own
  `gh` login, the platform CLIs you already use (to see which account each
  is logged in to), opt-in vulnerability lookups (osv.dev, off by default),
  end-of-life dates (endoflife.date), domain and certificate expiry, and
  update checks to this repository.
- **Agents ask, you decide.** Changes an agent proposes to accounts, links
  and renewals wait for your approval in the app. Every change to the
  registry is a git commit you can revert.

## Feedback

Found a bug, or something unclear? [Open an issue](https://github.com/futogabor/hq-releases/issues).

## Versions

What changed in each version: [Releases](https://github.com/futogabor/hq-releases/releases).
