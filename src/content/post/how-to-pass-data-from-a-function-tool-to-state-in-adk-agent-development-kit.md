---
layout: ../../layouts/post.astro
title: "How to Pass Data from a Function Tool to State in ADK (Agent Development Kit)"
description: "Discover key limitations of Cloudflare Workers KV from real production experience: unavailability in China market, cold cache latency issues of up to 500ms, and practical workarounds learned during migration from DynamoDB at EF Education First."
dateFormatted: "April 21, 2025"
heroImage: /assets/images/posts/004_adk_state.webp
---

![](/assets/images/posts/004_adk_state.webp)

## What is ADK?

Google’s new ADK (Agent Development Kit) is an exciting step forward in building AI agents. Think of it as a framework for composing tools, states, and logic in a way that feels modular and powerful—kind of like LangChain or LangGraph, but backed by Google.

IMO it has lower learning curve than LangGraph while offering the same functionality, better local development tooling and straight forward deployment options to Agent Engine or Cloud Run (for details see [docs](https://google.github.io/adk-docs/deploy/)).

## What is state?

In ADK state is a mutable object shared between agents and tools. It holds all the data that flows through your agent’s workflow—like user inputs, intermediate results, or tool outputs.

## How to set state from function tool?

It’s not clearly documented in the official docs, but thankfully the source code is well-structured and readable.

![Code fragment that injects ToolContext to tool function](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/h7onhx6ddv0i8uad9xqd.png)
*Source: https://github.com/google/adk-python/blob/1664b455627c01194a804b880d31bd2602e1a447/src/google/adk/tools/function_tool.py#L59*

You can get hold of [`ToolContext`](https://google.github.io/adk-docs/context/#the-different-types-of-context) object (which holds reference to the state object) by adding an argument named `tool_context` to your tool function signature - ADK will inject the value. For example:

```python
from google.adk.agents import LlmAgent
from .prompt import system_prompt
from google.adk.tools import ToolContext

def save_prd(prd: str, tool_context: ToolContext):
    tool_context.state['prd'] = prd

agent = LlmAgent(
    name="product_owner",
    description="A product owner agent that is responsible for the product vision and strategy",
    model="gemini-2.0-flash",
    instruction=system_prompt,
    tools=[save_prd],
)
```
