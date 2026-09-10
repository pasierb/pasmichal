---
title: "One task, one worktree, one agent: why I built heft"
description: "Heft gives each coding task its own worktree and agent with one command. Herdr, my daily driver for agentic AI work, provides the terminal infrastructure."
pubDate: "2026-09-10"
heroImage: "../../assets/images/projects/heft-concept.jpg"
heroImageAlt: "Heft concept artwork: separate flocks of sheep grazing across shared hills."
tags: ["AI", "Developer tools", "Git", "Open source"]
---

An agent is working on a feature. You want to start a small fix while it runs. In a single checkout, that means dealing with the first task's branch and unfinished changes before the second task can go anywhere.

I built [heft](https://github.com/pasierb/heft) to make starting that second task a single command. [Herdr](https://herdr.dev/) provides the terminal infrastructure: the workspaces and tabs where agents run. Heft handles the workflow, creating a Git worktree for a task, opening its Herdr workspace, and handing the prompt to the agent.

Herdr is my daily driver for agentic AI work, and I highly recommend it. You'll need it installed to use heft; the setup steps are below.

## The friction around starting a task

Git worktrees already solve the checkout problem. Each task can have its own directory and branch, so an agent can edit files there while another task stays open elsewhere.

There is still setup around that: choose a branch, create the worktree, open a terminal in the right directory, launch the agent, and pass it the task. None of those steps is difficult. I wanted to stop assembling them every time.

Heft puts that setup behind `heft work`. The branch name identifies the task, and the project configuration tells heft where to put the worktree and which agent to launch.

## A short demo

With heft initialized in a Git repository and an agent configured, start a task like this:

```sh
heft work fix/login-redirect --prompt="Investigate the login redirect bug and propose a fix"
```

Heft fetches `origin` and creates `fix/login-redirect` from the configured base branch. With the default directory setting, the checkout lives at `.worktrees/fix_login-redirect`. It opens a Herdr workspace there, launches the configured agent, and sends the prompt once Herdr recognizes it.

The command returns when Herdr accepts the prompt; the agent continues in that workspace. Your original workspace stays open with its files as you left them.

To start another task while keeping your current workspace focused:

```sh
heft work docs/setup --no-focus --prompt="Review the setup instructions and identify missing steps"
```

You now have separate checkouts for the fix and the documentation review. Each agent gets its own working directory. I still have to review what they produce, but I can move between the tasks without shuffling local changes.

If a branch or its worktree already exists, heft reuses it. Running `heft work` again opens a new Herdr workspace and runs the configured tabs, so it isn't a command for reattaching to an existing agent session.

## Set it up once per repository

After installing [Herdr](https://herdr.dev/docs/install/), install heft using the command from its [README](https://github.com/pasierb/heft#quick-start). The release installer needs `curl`, `tar`, and `sha256sum`:

```sh
curl -fsSL https://raw.githubusercontent.com/pasierb/heft/main/install.sh | sh
```

Then run this inside your Git repository:

```sh
heft init
```

The prompts create `.heft.yaml` with your base branch, worktree directory, workspace naming, and agent command. Prompt delivery needs a configured tab marked `agent: true` running an agent Herdr recognizes.

Check the generated agent command before starting work: choosing Codex during setup currently selects `codex --yolo`, which disables approval prompts and sandboxing. You can edit that command in `.heft.yaml` to suit your setup.

## Keep the workspaces from piling up

After `heft work`, the command I find most useful is `heft prune`. Once I'm done with tasks, I use it to clear out their worktrees and Herdr workspaces:

```sh
heft prune
```

It removes clean linked worktrees without active agents, leaving dirty worktrees, active agent workspaces, and local branches untouched. That keeps old workspaces from piling up. "Clean" means there are no staged, unstaged, or untracked changes; it doesn't mean the branch has been merged.

To inspect your worktrees and remove one specific clean checkout:

```sh
heft list
heft cleanup fix/login-redirect
```

Cleanup refuses a worktree with staged, unstaged, or untracked changes and keeps the local branch.

<img src="/assets/images/heft/logo.svg" alt="Heft's interlocking h logo in charcoal, gold, and sage green" width="96" height="100" loading="lazy" />

Heft is written in Go. The [source and command reference](https://github.com/pasierb/heft) are on GitHub, and I've added it to my [projects](/projects). If you already use Herdr and work on several tasks at once, try the next one with `heft work`.
