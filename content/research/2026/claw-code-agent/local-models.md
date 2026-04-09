---
title: "Local Models"
weight: 4
---

## Design Philosophy

Claw Code Agent's defining feature is its **backend independence**. While Claude Code is locked to Anthropic's API, Claw Code Agent targets any inference server that exposes an OpenAI-compatible `/chat/completions` endpoint. This means the same agent architecture runs against a local GPU, a cloud endpoint, or a proxy aggregator — the agent code never changes.

## OpenAI-Compatible API Client

The `openai_compat.py` module implements a minimal `OpenAICompatClient` class that handles both synchronous and streaming completions.

### Request Construction

The client constructs standardized payloads to `/chat/completions`:

```python
{
  "model": "Qwen/Qwen3-Coder-30B-A3B-Instruct",
  "messages": [...],
  "tools": [...],           # Tool definitions in OpenAI format
  "temperature": 0.7,
  "stream": true,           # Optional
  "response_format": {...}  # Optional structured output schema
}
```

Authentication uses Bearer tokens. HTTP URLs are automatically upgraded to HTTPS for remote endpoints.

### Streaming via SSE

When streaming is enabled, the client parses **Server-Sent Events** (SSE):

1. Read response lines incrementally
2. Accumulate data after `data:` prefixes
3. Yield complete JSON objects as they arrive

The client emits typed events:

| Event | Content |
|-------|---------|
| `message_start` | Initial response metadata |
| `content_delta` | Incremental text chunks |
| `tool_call_delta` | Function invocation fragments |
| `usage` | Token count statistics |
| `message_stop` | Completion signal |

### Tool Call Parsing

Two response formats are supported:

| Format | Structure |
|--------|-----------|
| **Modern** | `tool_calls` array with function objects (name + arguments) |
| **Legacy** | `function_call` object (single tool call) |

Arguments parse flexibly: dictionaries pass through, JSON strings decode to objects, and null values default to empty dictionaries. Invalid JSON raises `OpenAICompatError`.

### Usage Statistics

The client normalizes diverse naming conventions across backends:

| Metric | vLLM | Ollama | OpenAI |
|--------|------|--------|--------|
| Input tokens | `prompt_tokens` | `prompt_eval_count` | `input_tokens` |
| Output tokens | `completion_tokens` | `eval_count` | `output_tokens` |

## Supported Backends

### vLLM (Primary)

[vLLM](https://github.com/vllm-project/vllm) is the recommended backend for its native tool-calling support and high throughput.

**Launch command:**

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen3-Coder-30B-A3B-Instruct \
  --host 127.0.0.1 --port 8000 \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_xml
```

Key flags:
- `--enable-auto-tool-choice` — Lets vLLM detect when the model wants to call tools
- `--tool-call-parser qwen3_xml` — Uses the Qwen3-specific XML parser for extracting tool calls from model output

**Environment setup:**

```bash
export OPENAI_BASE_URL=http://127.0.0.1:8000/v1
export OPENAI_API_KEY=local-token
export OPENAI_MODEL=Qwen/Qwen3-Coder-30B-A3B-Instruct
```

### Ollama

[Ollama](https://ollama.ai) provides a simpler setup for models that support tool use.

```bash
export OPENAI_BASE_URL=http://127.0.0.1:11434/v1
export OPENAI_API_KEY=ollama
export OPENAI_MODEL=qwen3-coder:30b
```

Ollama handles model downloading and quantization automatically. The `prompt_eval_count` / `eval_count` naming convention is normalized by the client.

### LiteLLM Proxy

[LiteLLM](https://github.com/BerriAI/litellm) acts as a unified proxy, allowing the agent to target 100+ model providers through a single endpoint.

```bash
export OPENAI_BASE_URL=http://127.0.0.1:4000/v1
export OPENAI_API_KEY=your-litellm-key
export OPENAI_MODEL=your-model-name
```

### OpenRouter

[OpenRouter](https://openrouter.ai) provides cloud-hosted model access with automatic routing.

```bash
export OPENAI_BASE_URL=https://openrouter.ai/api/v1
export OPENAI_API_KEY=your-openrouter-key
export OPENAI_MODEL=qwen/qwen3-coder-30b
```

## Recommended Model

The project recommends **Qwen3-Coder-30B-A3B-Instruct**[^1] as the primary model:

- **Architecture** — Mixture-of-Experts with 30B total parameters, 3B active per token
- **Strengths** — Strong code generation, instruction following, and tool-use capabilities
- **Tool calling** — Native support via vLLM's `qwen3_xml` parser
- **Efficiency** — MoE architecture means inference cost scales with active parameters (3B), not total parameters (30B)

Other models work if they support function/tool calling through the OpenAI API format, but Qwen3-Coder has been the primary development and testing target.

## Cost Tracking

The `cost_tracker.py` module provides budget enforcement integrated into the agent loop. The `CostTracker` records events with labels and unit counts, and the agent's `_check_budget()` method validates against multiple constraints each turn:

| Budget Type | What's Measured |
|-------------|-----------------|
| Total tokens | Sum of input + output tokens |
| Input tokens | Prompt tokens consumed |
| Output tokens | Completion tokens generated |
| Reasoning tokens | Tokens used for chain-of-thought (if applicable) |
| Estimated cost (USD) | Calculated from token counts and model pricing |
| Tool calls | Number of tool invocations |
| Model calls | Number of API requests |
| Session turns | Number of agent loop iterations |

Budget violations halt execution immediately with diagnostic messages. Budgets are configurable via CLI flags and can be overridden by hook policy manifests.

## CLI Invocation Modes

The `main.py` CLI supports multiple execution modes:

| Command | Mode | Use Case |
|---------|------|----------|
| `agent "prompt"` | Synchronous | Single task, returns result |
| `agent-chat` | Interactive | Multi-turn REPL with session support |
| `agent-bg "prompt"` | Background | Async execution with process management |
| `agent-resume` | Continuation | Resume saved session with modified params |
| `agent-ps` | Monitoring | List background sessions |
| `agent-logs` | Monitoring | View background session output |
| `agent-attach` | Monitoring | Attach to running session |
| `agent-kill` | Control | Terminate background session |

### Common Flags

```bash
python3 -m src.main agent "task" \
  --cwd .                    # Working directory
  --allow-write              # Enable file modifications
  --allow-shell              # Enable shell commands
  --unsafe                   # Enable destructive operations
  --stream                   # Token-by-token streaming output
  --max-turns 20             # Limit agent loop iterations
  --max-tokens 100000        # Token budget
  --temperature 0.7          # Model temperature
```

## Footnotes

[^1]: [Qwen3-Coder-30B-A3B-Instruct on Hugging Face](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)

## References

- [Claw Code Agent — openai_compat.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/openai_compat.py)
- [Claw Code Agent — cost_tracker.py](https://github.com/HarnessLab/claw-code-agent/blob/main/src/cost_tracker.py)
- [vLLM Project](https://github.com/vllm-project/vllm)
- [Ollama](https://ollama.ai)
- [LiteLLM](https://github.com/BerriAI/litellm)
- [OpenRouter](https://openrouter.ai)
- [Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
