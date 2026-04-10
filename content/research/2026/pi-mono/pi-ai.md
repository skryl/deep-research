---
title: "Unified LLM API (pi-ai)"
weight: 1
---

## Provider Registry

The `pi-ai` package[^1] implements a **provider registry pattern** that decouples LLM consumers from specific provider SDKs. The central `apiProviderRegistry` is a `Map<string, RegisteredApiProvider>` where each entry wraps a provider's `stream` and `streamSimple` functions with runtime type validation — if a `Model<TApi>` is passed to the wrong provider, the wrapper throws immediately rather than sending malformed requests.

### Registration and Resolution

```typescript
// Register a provider
registerApiProvider({
  api: "anthropic",
  stream: (model, context, options) => { /* ... */ },
  streamSimple: (model, context, options) => { /* ... */ },
}, { sourceId: "builtins" });

// Resolve and stream
const provider = getApiProvider("anthropic");
const stream = provider.stream(model, context, options);
```

Providers can be registered with an optional `sourceId` for lifecycle management — `unregisterApiProviders(sourceId)` removes all providers from a given source, enabling clean teardown of dynamically loaded extensions or test fixtures.

### Lazy Loading

Each provider module is **lazy-loaded** via dynamic `import()` at first use. The `register-builtins.ts` module sets up lightweight stubs that only pull in the actual provider SDK (Anthropic, OpenAI, Google, etc.) when that provider is first needed. This keeps startup fast and avoids loading heavyweight SDK dependencies that may never be used.

### Built-in Providers

The `register-builtins.ts` module registers all 17 built-in providers on import:

| Provider File | API Type | Notes |
|--------------|----------|-------|
| `anthropic.ts` | Anthropic | Claude models via Messages API |
| `openai-completions.ts` | OpenAI Completions | Legacy completions endpoint |
| `openai-responses.ts` | OpenAI Responses | Chat completions with tool support |
| `openai-codex-responses.ts` | OpenAI Codex | Codex-specific response handling |
| `google.ts` | Google | Standard Gemini API |
| `google-vertex.ts` | Google Vertex | Vertex AI with service account auth |
| `google-gemini-cli.ts` | Google Gemini CLI | CLI-specific Gemini variant |
| `mistral.ts` | Mistral | Mistral AI models |
| `amazon-bedrock.ts` | Bedrock | AWS Bedrock with SigV4 signing |
| `azure-openai-responses.ts` | Azure OpenAI | Azure-hosted OpenAI models |
| `faux.ts` | Faux | Mock provider for testing |

Shared logic is factored into `google-shared.ts`, `openai-responses-shared.ts`, and `transform-messages.ts` to reduce duplication across similar providers.

## Streaming Protocol

The streaming system exposes four primary functions:

| Function | Returns | Description |
|----------|---------|-------------|
| `stream()` | `AssistantMessageEventStream` | Full streaming with provider-specific options |
| `complete()` | `Promise<AssistantMessage>` | Awaits stream completion, returns final message |
| `streamSimple()` | `AssistantMessageEventStream` | Streaming with simplified options (reasoning level, thinking budgets) |
| `completeSimple()` | `Promise<AssistantMessage>` | Awaits simple stream completion |

### Event Types

The `AssistantMessageEvent` stream emits a lifecycle sequence:

```
message_start
  → text_start → text_delta* → text_end
  → thinking_start → thinking_delta* → thinking_end
  → toolcall_start → toolcall_delta* → toolcall_end
message_end (with stopReason, usage)
  | error (with optional message)
```

Each delta event carries a `contentIndex` to route updates to the correct content block in multi-content responses (e.g., interleaved text and tool calls).

### Transport Modes

The `transport` option controls the streaming protocol:

| Mode | Behavior |
|------|----------|
| `"sse"` | Server-Sent Events over HTTP (default) |
| `"websocket"` | WebSocket connection |
| `"auto"` | Provider determines optimal transport |

### Proxy Streaming

The `proxy.ts` module implements a **client-side proxy transport** that streams through an intermediary server at `{proxyUrl}/api/stream`. The proxy uses SSE format with bandwidth optimization — the server strips the `partial` field from delta events, and the client reconstructs the full `AssistantMessage` locally by accumulating content across events. This enables deployment architectures where API keys live on a server while the agent runs on a client.

## Model System

### Model Registry

The `modelRegistry` is organized as a nested `Map<string, Map<string, Model<Api>>>` — providers contain models, each with an API type. On module load, the registry populates from a generated `MODELS` constant (produced by build-time model generation scripts).

```typescript
interface Model<TApi extends Api> {
  id: string;
  name: string;
  api: TApi;
  provider: Provider;
  baseUrl?: string;
  reasoning?: boolean;
  inputModalities?: string[];
  contextWindow?: number;
  inputTokenCost?: number;   // per million tokens
  outputTokenCost?: number;  // per million tokens
  // ... compatibility overrides
}
```

### Cost Calculation

The `calculateCost()` function computes expenses using per-million-token pricing across four dimensions: input tokens, output tokens, cache reads, and cache writes. Each is normalized from the per-million rate to the actual usage amount.

### Capability Detection

- **`supportsXhigh()`** — Identifies models supporting extended thinking (GPT-5.x and Opus 4.6 families)
- **`modelsAreEqual()`** — Deep equality check by both model ID and provider

### Thinking Levels

The `ThinkingLevel` type defines five tiers of reasoning depth:

| Level | Token Budget | Use Case |
|-------|-------------|----------|
| `"minimal"` | Lowest allocation | Simple completions |
| `"low"` | Below default | Routine tasks |
| `"medium"` | Default | General purpose |
| `"high"` | Above default | Complex reasoning |
| `"xhigh"` | Maximum | Deep analysis (specific models only) |

Custom `ThinkingBudgets` can override the default token allocation per level.

## Type System

The type system uses TypeScript generics to enforce compile-time safety across the provider boundary:

- **`Api`** — Union of known API strings (`"anthropic" | "openai-completions" | "google" | ...`) or custom strings
- **`Provider`** — Known provider identifiers or custom strings
- **`Model<TApi>`** — Model definition parameterized by API type
- **`StreamOptions`** — Configuration including temperature, maxTokens, cacheRetention (`"none" | "short" | "long"`), transport, abort signal, and payload interception hooks

### Content Types

Messages carry typed content blocks:

| Type | Fields | Description |
|------|--------|-------------|
| `TextContent` | text, signature? | Plain text with optional provider signature |
| `ThinkingContent` | thinking, redacted? | Reasoning blocks (may be redacted by provider) |
| `ImageContent` | base64, mediaType | Base64-encoded image data |
| `ToolCall` | id, name, arguments | Function invocation with parsed arguments |

### OAuth Support

The package includes built-in OAuth flows for provider authentication:

| Provider | OAuth Type |
|----------|-----------|
| GitHub Copilot | Device flow |
| OpenAI Codex | Authorization code |
| Anthropic Pro | Authorization code |
| Google Gemini CLI | Authorization code |
| Google Antigravity | Authorization code |

### Tool Schema Validation

Tool parameter schemas use **TypeBox** (`@sinclair/typebox`) rather than raw JSON Schema, with **ajv** for runtime validation. TypeBox provides compile-time TypeScript type inference from schema definitions, ensuring tool argument types are checked both statically and at runtime.

### Usage Tracking

Every `AssistantMessage` includes granular token usage:

```typescript
interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  cost?: number;  // calculated from model pricing
}
```

## Footnotes

[^1]: [pi-ai package source](https://github.com/badlogic/pi-mono/tree/main/packages/ai)

## References

- [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages)
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)
- [Google Vertex AI](https://cloud.google.com/vertex-ai)
- [AWS Bedrock](https://aws.amazon.com/bedrock/)
