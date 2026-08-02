---
title: "How to Setup Cursor for Unity Development"
description: "A technical guide for configuring Cursor, an AI-powered VS Code fork, for Unity game development."
pubDate: "2025-12-26"
originalUrl: "https://srjrgames.com/blog/how-to-setup-cursor-for-unity-development/"
canonicalUrl: "https://srjrgames.com/blog/how-to-setup-cursor-for-unity-development/"
source: "Sr. Jr. Games"
tags: ["unity", "cursor", "gamedev", "ai"]
---

I'm a big proponent of using AI for development, but I'm not a fan of vibe coding approach - it's a recipe for a disaster.
You have to understand the codebase to be able to make the right decisions.

**Use AI as a tool, not a replacement for your knowledge.**

---

Setting up Cursor (the AI-powered fork of VS Code) for Unity development can be a bit tricky because some C# features are blocked in Cursor. However, there's a simple path to get it working perfectly.

## 1. Install Unity Package for Cursor

To allow Unity to properly "see" and interact with Cursor, you should install a dedicated package.

1. Open your Unity Project.
2. Go to `Window > Package Manager`.
3. Click the `+` icon and select `Add package from git URL...`.
4. Enter the following URL: `https://github.com/boxqkrtm/com.unity.ide.cursor.git`
5. Click **Add**.

## 2. Set Cursor as Default External Editor

Once the package is installed, you need to tell Unity to use Cursor for opening scripts.

1. Go to `Unity > Settings` (on macOS) or `Edit > Preferences` (on Windows).
2. Select **External Tools**.
3. In the **External Script Editor** dropdown, select **Cursor**.

## 3. Install Dotrush for Debugging

For the best debugging experience (often better than the official Unity plugin), it's recommended to use **Dotrush**.

- Install the [Dotrush extension](https://marketplace.cursorapi.com/items?itemName=nromanov.dotrush) from the Cursor marketplace.

## 4. Project Configuration (.vscode)

To ensure smooth operation, add these configurations to your `.vscode` folder in the root of your Unity project.

### `extensions.json`

Recommends the Dotrush extension for your team.

```json
{
  "recommendations": [
    "nromanov.dotrush"
  ]
}
```

### `settings.json`

Excludes clutter from search and file watching, and sets the default solution.

> **Important:** Replace `<YourProject>` with the actual name of your `.sln` file.

```json
{
  "files.exclude": {
    "**/*.meta": true,
    "**/Library": true,
    "**/Temp": true,
    "**/obj": true,
    "**/Logs": true,
    "**/Build": true,
    "**/.vs": true
  },
  "search.exclude": {
    "**/*.meta": true,
    "**/*.csproj": true,
    "**/*.sln": true,
    "**/Library": true,
    "**/Temp": true,
    "**/obj": true,
    "**/Logs": true,
    "**/Build": true,
    "**/.vs": true
  },
  "files.watcherExclude": {
    "**/Library/**": true,
    "**/Temp/**": true,
    "**/obj/**": true,
    "**/Logs/**": true,
    "**/Build/**": true
  },
  "dotnet.defaultSolution": "<YourProject>.sln"
}
```

---

**Sources**

- [How to setup cursor for Unity development - reddit thread](https://www.reddit.com/r/Unity3D/comments/1kq9psh/cursor_unity_integration_short_guide/)
