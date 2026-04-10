---
title: "Terminal UI (pi-tui)"
weight: 4
---

## Overview

The `pi-tui` package[^1] is a custom terminal UI library built specifically for pi's interactive mode. Rather than using an existing framework like Ink or Ratatui, pi implements its own differential rendering engine with a component system, overlay management, input handling across three keyboard protocols, and features like kill ring, undo stack, and fuzzy matching. The package contains 13 source files and a `components/` directory, all in TypeScript targeting Node.js's `process.stdin`/`process.stdout`.

## Differential Rendering

The TUI implements a **5-stage rendering pipeline** that minimizes terminal I/O by only writing changed lines:

### Pipeline Stages

```
1. Component Render    → Each component produces string[] via render(width)
2. Overlay Composition → Overlays positioned on top of base content
3. Cursor Extraction   → CURSOR_MARKER (APC escape) located and removed
4. Differential Diff   → Compare new output against previous frame line-by-line
5. Optimized Write     → Write only changed lines within synchronized blocks
```

### Diff Algorithm

The system identifies the first and last modified lines between frames, then writes only the changed region. Full redraws are triggered when:

| Condition | Reason |
|-----------|--------|
| Terminal width changes | Line wrapping would differ |
| Terminal height changes | Viewport recalculation needed (except Termux) |
| Content shrinks below historical max | Configurable via `clearOnShrink` |
| Changed lines fall outside visible viewport | Partial updates would be incorrect |

### Flicker Prevention

Synchronized output uses `\x1b[?2026h` and `\x1b[?2026l` escape sequences to batch updates into atomic terminal operations. The `CURSOR_MARKER` uses an APC (Application Program Command) escape sequence that terminals ignore visually but the TUI can detect for IME cursor positioning.

### Performance

A minimum render interval of **16ms** throttles frequent updates (roughly 60fps cap). Image lines bypass ANSI reset sequences, and width validation with fallback truncation prevents crashes from oversized content.

## Component System

All UI elements implement the `Component` interface:

```typescript
interface Component {
  render(width: number): string[];
  invalidate(): void;
  handleInput?(data: string): void;
  wantsKeyRelease?: boolean;
}
```

### Focusable Components

Components implementing `Focusable` can display a hardware cursor by emitting `CURSOR_MARKER` at the desired cursor position during `render()`. The TUI extracts this marker to:
- Position the hardware cursor for IME (Input Method Editor) candidate window placement
- Track two cursor positions: `cursorRow` (logical end of content) and `hardwareCursorRow` (actual terminal cursor)

### Component Directory

The `components/` subdirectory contains pre-built components used by the coding agent's interactive mode — these are composed into the full-screen TUI layout with header, input area, output panel, and status bar.

## Overlay System

Overlays render on top of the base component layer with configurable positioning and sizing:

### Positioning Options

| Strategy | Parameters |
|----------|------------|
| **Anchor-based** | Anchor point (center, corners, edges) + row/col offsets |
| **Absolute** | Fixed row/col values |
| **Percentage** | Row/col as percentage of terminal dimensions |

### Sizing and Margins

- Width: absolute pixel count or percentage of terminal width
- Max height: absolute or percentage (overlays grow to content up to this limit)
- Margins: configurable spacing from terminal edges

### Focus Management

Overlays participate in a **layered focus stack**:

1. When an overlay gains focus, the previous focus target is saved
2. When an overlay hides, focus restores to the previous target
3. Each input cycle validates overlay focus — if the focused overlay became invisible, focus redirects to the topmost visible overlay
4. `showOverlay()` returns a handle for controlling visibility, focus, and removal

## Terminal Abstraction

The `terminal.ts` module separates the terminal interface from its platform-specific implementation:

### Interface

```typescript
interface Terminal {
  start(onInput: (data: string) => void, onResize: () => void): void;
  write(data: string): void;
  columns: number;
  rows: number;
  moveBy(rows: number): void;
  hideCursor(): void;
  showCursor(): void;
  clearLine(): void;
  clearFromCursor(): void;
  clearScreen(): void;
  setTitle(title: string): void;
}
```

### ANSI Escape Sequences

The `ProcessTerminal` implementation uses standard VT escape sequences:

| Operation | Sequence |
|-----------|----------|
| Move cursor up/down | `\x1b[${n}A` / `\x1b[${n}B` |
| Hide/show cursor | `\x1b[?25l` / `\x1b[?25h` |
| Clear line | `\x1b[K` |
| Clear to screen end | `\x1b[J` |
| Clear screen + home | `\x1b[2J\x1b[H` |
| Set window title | `\x1b]0;${title}\x07` (OSC) |
| Sync output start/end | `\x1b[?2026h` / `\x1b[?2026l` |

## Keyboard Protocol Support

The TUI supports three keyboard protocols to handle modifier keys across different terminal environments:

### Protocol Hierarchy

| Protocol | Terminal Support | Features |
|----------|-----------------|----------|
| **Kitty** | Kitty, WezTerm, foot, Ghostty | Disambiguated escape codes, press/repeat/release events |
| **xterm modifyOtherKeys** | xterm, tmux | Modified key reporting as fallback |
| **Windows VT Input** | Windows Terminal, ConPTY | Native Windows API via koffi FFI library |

### Input Pipeline

1. Raw stdin data arrives in the `StdinBuffer`, which batches bytes into discrete sequences
2. Global input listeners can consume or transform data before components see it
3. Cell size responses (terminal pixel dimension queries) are consumed internally
4. `Shift+Ctrl+D` triggers an optional debug callback
5. The focused component receives remaining input
6. Key release events are filtered unless the component opts in via `wantsKeyRelease`

### Drain Mechanism

The `drainInput()` method disables keyboard protocols before exit. This is critical for SSH connections — without proper cleanup, key release events can leak to the parent shell over slow connections, causing unexpected behavior.

## Keybinding System

The `keybindings.ts` module implements a **declarative keybinding registry** using TypeScript declaration merging:

### Categories

The system defines ~30 keybinding identifiers across categories:

| Category | Actions |
|----------|---------|
| **Editor navigation** | Cursor movement, jumping, paging |
| **Editing** | Deletion, yanking (kill ring), undo/redo |
| **Generic input** | Newline, submit, tab, copy |
| **Selection** | Up/down, page navigation, confirm/cancel |

### KeybindingsManager

The manager provides three core functions:

1. **Conflict detection** — Identifies when multiple actions claim the same key combination, storing conflicts separately
2. **Key resolution** — Normalizes key inputs, preferring user overrides over defaults
3. **Matching** — Evaluates whether input data corresponds to a specific keybinding action

User bindings from configuration override defaults. A singleton pattern via `getKeybindings()` / `setKeybindings()` manages the global instance.

## Editor Features

### Kill Ring (`kill-ring.ts`)

An Emacs-style kill ring that stores deleted text for yank (paste) operations. Consecutive kills append to the same ring entry, and `yank-pop` cycles through previous kills.

### Undo Stack (`undo-stack.ts`)

Full undo/redo support for the editor component. State snapshots are pushed onto the stack at meaningful boundaries (not every keystroke), enabling efficient undo without excessive memory usage.

### Autocomplete (`autocomplete.ts`)

Completion suggestions with fuzzy matching via `fuzzy.ts`. The autocomplete system integrates with the overlay system to display completion lists anchored to the cursor position.

### Terminal Image Support (`terminal-image.ts`)

Image rendering in terminals that support inline images (e.g., iTerm2, Kitty). Images are encoded and emitted using terminal-specific escape sequences.

## Footnotes

[^1]: [pi-tui package source](https://github.com/badlogic/pi-mono/tree/main/packages/tui)

## References

- [Pi Mono GitHub Repository](https://github.com/badlogic/pi-mono)
- [Kitty Keyboard Protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol/)
- [xterm modifyOtherKeys](https://invisible-island.net/xterm/manpage/xterm.html)
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
