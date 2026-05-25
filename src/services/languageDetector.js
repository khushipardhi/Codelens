/**
 * CodeLens — Advanced Language Detection Service
 * ================================================
 * Multi-layer pattern-based language identification for 20 programming languages.
 *
 * Detection strategy (4 layers, each with weighted confidence):
 *
 *   Layer 1 — Definitive markers (weight 3.0)
 *     Patterns unique to one language (shebangs, <?php, DOCTYPE, etc.)
 *
 *   Layer 2 — Strong indicators (weight 2.0)
 *     Highly language-specific constructs (cout<<, println!, System.out, etc.)
 *
 *   Layer 3 — Supporting patterns (weight 1.0)
 *     Common-but-characteristic patterns (function declarations, types, etc.)
 *
 *   Layer 4 — Structural signals (weight 0.5)
 *     Semicolon density, indentation style, bracket patterns, etc.
 *
 * Each matched pattern carries a human-readable `reason` string so the UI
 * can display transparent, educational detection explanations.
 *
 * Returns:
 *   {
 *     language,       // e.g. 'Python'
 *     icon,           // e.g. '🐍'
 *     monacoId,       // e.g. 'python'
 *     confidence,     // raw 0–1 normalized score
 *     confidencePct,  // 0–100 integer for display
 *     unclear,        // true when top score < threshold
 *     reasons,        // string[] — top 3 detection reasons (human-readable)
 *     candidates,     // [{ language, icon, confidencePct }] — top 3 candidates
 *     isAmbiguous,    // true when top 2 candidates are too close to distinguish
 *   }
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const UNCLEAR_THRESHOLD   = 0.04;   // raw score below which detection is "unclear"
const AMBIGUOUS_GAP       = 0.12;   // if 2nd candidate ≥ (1st − this), flag ambiguous
const CACHE_MAX_SIZE      = 30;
const CACHE_KEY_CHARS     = 250;    // characters used to build the cache key

// ─── Language Profile Definitions ────────────────────────────────────────────
/**
 * Each language profile has four pattern arrays:
 *   definitive  — weight 3.0, unambiguous markers
 *   strong      — weight 2.0, highly specific constructs
 *   supporting  — weight 1.0, characteristic but shared patterns
 *   structural  — weight 0.5, style signals
 *
 * Each entry: { pattern: RegExp, reason: string }
 */
const LANGUAGE_PROFILES = [
  // ── Python ─────────────────────────────────────────────────────────────────
  {
    language: 'Python', icon: '🐍', monacoId: 'python',
    definitive: [
      { pattern: /^#!.*python/m,                   reason: 'Python shebang line (`#!/usr/bin/python`)' },
      { pattern: /^[ \t]*elif\s+/m,                reason: '`elif` keyword (Python-specific)' },
      { pattern: /\b__init__\s*\(/,                reason: '`__init__` constructor (Python OOP)' },
      { pattern: /\b__name__\s*==\s*['"]__main__['"]/,  reason: '`if __name__ == "__main__"` entry point' },
    ],
    strong: [
      { pattern: /^[ \t]*def\s+\w+\s*\(/m,         reason: '`def` function declaration' },
      { pattern: /\bself\.\w+/,                    reason: '`self.` object reference (Python OOP)' },
      { pattern: /^[ \t]*class\s+\w+.*:/m,         reason: '`class` definition with colon syntax' },
      { pattern: /^[ \t]*for\s+\w+\s+in\s+/m,     reason: '`for … in` loop (Python syntax)' },
      { pattern: /^[ \t]*import\s+\w+/m,           reason: 'bare `import` statement' },
      { pattern: /^[ \t]*from\s+\w+\s+import/m,   reason: '`from … import` module syntax' },
      { pattern: /^[ \t]*async\s+def\s+/m,         reason: '`async def` coroutine declaration' },
    ],
    supporting: [
      { pattern: /^[ \t]*print\s*\(/m,             reason: '`print()` built-in function' },
      { pattern: /^[ \t]*with\s+.*\s+as\s+\w+/m,  reason: '`with … as` context manager' },
      { pattern: /^[ \t]*try\s*:\s*$/m,            reason: '`try:` exception block' },
      { pattern: /^[ \t]*except\s+\w*/m,           reason: '`except` clause' },
      { pattern: /^[ \t]*@\w+/m,                  reason: 'Decorator syntax (`@decorator`)' },
      { pattern: /\bTrue\b|\bFalse\b|\bNone\b/,   reason: 'Python literals (`True`, `False`, `None`)' },
      { pattern: /^[ \t]*lambda\s+\w+/m,          reason: '`lambda` expression' },
    ],
    structural: [
      { pattern: /^[ \t]+\w+/m,                   reason: 'Significant indentation structure' },
    ],
  },

  // ── JavaScript ─────────────────────────────────────────────────────────────
  {
    language: 'JavaScript', icon: '⚡', monacoId: 'javascript',
    definitive: [
      { pattern: /\bconsole\.(log|error|warn|info|debug)\s*\(/,  reason: '`console.log()` / console API' },
      { pattern: /===|!==/,                                      reason: 'Strict equality (`===` / `!==`)' },
      { pattern: /\bdocument\.(getElementById|querySelector|createElement)\b/,  reason: 'DOM API access' },
      { pattern: /\bmodule\.exports\s*=/,                        reason: 'CommonJS `module.exports`' },
    ],
    strong: [
      { pattern: /\bconst\s+\w+\s*=/,             reason: '`const` variable declaration' },
      { pattern: /\blet\s+\w+\s*=/,               reason: '`let` variable declaration' },
      { pattern: /=>\s*[{(]/,                     reason: 'Arrow function (`=>`  syntax)' },
      { pattern: /\bexport\s+(default|const|function|class)\b/, reason: 'ES module `export` statement' },
      { pattern: /\bimport\s+\{[^}]+\}\s+from\s+['"]/, reason: 'Named ES module `import` from string' },
      { pattern: /\.then\s*\(|\.catch\s*\(/,      reason: 'Promise chaining (`.then()` / `.catch()`)' },
      { pattern: /\basync\s+function\b|\basync\s+\(/,  reason: '`async` function declaration' },
      { pattern: /\bawait\s+\w+/,                 reason: '`await` expression' },
    ],
    supporting: [
      { pattern: /\bvar\s+\w+\s*=/,               reason: '`var` variable declaration' },
      { pattern: /\bfunction\s+\w+\s*\(/,         reason: 'Named function declaration' },
      { pattern: /\bwindow\.\w+/,                 reason: '`window` global object access' },
      { pattern: /\brequire\s*\(/,                reason: 'CommonJS `require()` call' },
      { pattern: /\bnew\s+Promise\s*\(/,          reason: '`new Promise()` constructor' },
      { pattern: /\bsetTimeout\s*\(|\bsetInterval\s*\(/, reason: 'Timer API (`setTimeout` / `setInterval`)' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
      { pattern: /\{[^}]*\}/,                     reason: 'Curly brace block structure' },
    ],
  },

  // ── TypeScript ─────────────────────────────────────────────────────────────
  {
    language: 'TypeScript', icon: '🔷', monacoId: 'typescript',
    definitive: [
      { pattern: /\binterface\s+\w+\s*\{/,        reason: '`interface` type definition' },
      { pattern: /\btype\s+\w+\s*=\s*\{/,         reason: '`type` alias definition' },
      { pattern: /\benum\s+\w+\s*\{/,             reason: '`enum` declaration' },
      { pattern: /\bReadonly<|\bPartial<|\bRequired<|\bRecord</, reason: 'TypeScript utility types' },
      { pattern: /\bimport\s+type\s+/,            reason: '`import type` (TypeScript-only)' },
      { pattern: /\babstract\s+class\s+\w+/,      reason: '`abstract class` declaration' },
    ],
    strong: [
      { pattern: /:\s*(string|number|boolean|void|never|unknown|any)\b/, reason: 'Static type annotation (`: string`, etc.)' },
      { pattern: /<\w+(\s*,\s*\w+)*>/,            reason: 'Generic type parameter (`<T>`)' },
      { pattern: /\bas\s+(string|number|boolean|any|unknown)\b/, reason: 'Type assertion (`as string`)' },
      { pattern: /\bpublic\s+readonly\b|\bprivate\s+\w+:/,  reason: 'Access modifier with type annotation' },
    ],
    supporting: [
      { pattern: /\bconst\s+\w+\s*=/,             reason: '`const` variable declaration' },
      { pattern: /=>\s*[{(]/,                     reason: 'Arrow function syntax' },
      { pattern: /\bexport\s+(default|const|function|class|interface|type)\b/, reason: '`export` statement' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
    ],
  },

  // ── Java ───────────────────────────────────────────────────────────────────
  {
    language: 'Java', icon: '☕', monacoId: 'java',
    definitive: [
      { pattern: /\bpublic\s+static\s+void\s+main\s*\(\s*String/,   reason: '`public static void main(String[])` entry point' },
      { pattern: /System\.(out|err)\.(print|println)\s*\(/,          reason: '`System.out.println()` output' },
      { pattern: /\bimport\s+java\.\w+/,                             reason: '`import java.*` standard library' },
      { pattern: /@Override\b/,                                      reason: '`@Override` annotation' },
      { pattern: /\bpackage\s+[\w.]+;/,                              reason: '`package` declaration' },
    ],
    strong: [
      { pattern: /\bpublic\s+class\s+\w+/,        reason: '`public class` declaration' },
      { pattern: /\bprivate\s+\w+\s+\w+\s*[=;]/,  reason: 'Private field declaration' },
      { pattern: /\bextends\s+\w+/,               reason: '`extends` inheritance' },
      { pattern: /\bimplements\s+\w+/,            reason: '`implements` interface' },
      { pattern: /\bthrows\s+\w+Exception\b/,     reason: '`throws` exception declaration' },
      { pattern: /\bnew\s+ArrayList\b|\bnew\s+HashMap\b/, reason: 'Java Collections instantiation' },
    ],
    supporting: [
      { pattern: /\bString\s+\w+\s*=/,            reason: '`String` type declaration' },
      { pattern: /\b(int|double|float|boolean|long|char)\s+\w+\s*[=;]/, reason: 'Primitive type declaration' },
      { pattern: /\bfinal\s+\w+/,                reason: '`final` modifier' },
      { pattern: /\bpublic\s+\w+\s+\w+\s*\(/,    reason: 'Public method declaration' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
      { pattern: /\{[^}]*\}/,                     reason: 'Curly brace block structure' },
    ],
  },

  // ── C++ ────────────────────────────────────────────────────────────────────
  {
    language: 'C++', icon: '⚙️', monacoId: 'cpp',
    definitive: [
      { pattern: /#include\s*<(iostream|vector|string|algorithm|map|set|queue|stack|deque|sstream)>/, reason: '`#include <iostream>` / STL header' },
      { pattern: /\busing\s+namespace\s+std\s*;/,  reason: '`using namespace std;`' },
      { pattern: /\bstd::(cout|cin|endl|string|vector|map|pair)\b/, reason: '`std::` namespace usage' },
      { pattern: /\bcout\s*<</,                   reason: '`cout <<` stream output' },
      { pattern: /\bcin\s*>>/,                    reason: '`cin >>` stream input' },
      { pattern: /\bnullptr\b/,                   reason: '`nullptr` (C++11 null pointer)' },
    ],
    strong: [
      { pattern: /\btemplate\s*</,                reason: '`template<>` generic programming' },
      { pattern: /\bpublic:|private:|protected:/, reason: 'Access specifiers (`public:`, `private:`)' },
      { pattern: /\bvirtual\s+\w+/,              reason: '`virtual` method declaration' },
      { pattern: /\bdelete\s+\w+/,               reason: '`delete` memory deallocation' },
      { pattern: /\bnamespace\s+\w+\s*\{/,       reason: '`namespace` block' },
      { pattern: /\bauto\s+\w+\s*=/,             reason: '`auto` type inference (C++11)' },
    ],
    supporting: [
      { pattern: /#include\s*<\w+>/,             reason: '`#include` preprocessor directive' },
      { pattern: /\bclass\s+\w+\s*[:{]/,         reason: 'Class definition' },
      { pattern: /\bconst\s+\w+\s*&/,            reason: 'Const reference parameter' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
    ],
  },

  // ── C ──────────────────────────────────────────────────────────────────────
  {
    language: 'C', icon: '🔧', monacoId: 'c',
    definitive: [
      { pattern: /#include\s*<(stdio|stdlib|string|math|ctype|time|stdbool|stdint|errno|assert)\.h>/, reason: '`#include <stdio.h>` C standard library header' },
      { pattern: /\bprintf\s*\(/,                 reason: '`printf()` C output function' },
      { pattern: /\bscanf\s*\(/,                  reason: '`scanf()` C input function' },
      { pattern: /\bNULL\b/,                      reason: '`NULL` C null pointer macro' },
      { pattern: /\bint\s+main\s*\(\s*(void|int\s+argc)?\s*[,)]/,  reason: 'C `int main()` entry point' },
    ],
    strong: [
      { pattern: /\bmalloc\s*\(|\bcalloc\s*\(|\brealloc\s*\(/, reason: 'Dynamic memory allocation (`malloc`)' },
      { pattern: /\bfree\s*\(/,                   reason: '`free()` memory deallocation' },
      { pattern: /\bsizeof\s*\(/,                 reason: '`sizeof()` operator' },
      { pattern: /\btypedef\s+struct\b/,           reason: '`typedef struct` C idiom' },
      { pattern: /\b(int|char|float|double|void)\s*\*\s*\w+/, reason: 'Pointer declaration (`int *ptr`)' },
    ],
    supporting: [
      { pattern: /\bstruct\s+\w+\s*\{/,           reason: '`struct` definition' },
      { pattern: /\b(int|char|float|double)\s+\w+\s*[=;]/, reason: 'C primitive type declaration' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
    ],
  },

  // ── C# ─────────────────────────────────────────────────────────────────────
  {
    language: 'C#', icon: '#️⃣', monacoId: 'csharp',
    definitive: [
      { pattern: /\busing\s+System(\.\w+)*;/,     reason: '`using System;` namespace import' },
      { pattern: /Console\.(Write|WriteLine)\s*\(/, reason: '`Console.WriteLine()` output' },
      { pattern: /\bnamespace\s+\w+(\.\w+)*\s*\{/, reason: '`namespace` declaration' },
      { pattern: /\bstatic\s+void\s+Main\s*\(/,   reason: '`static void Main()` entry point' },
    ],
    strong: [
      { pattern: /\bpublic\s+class\s+\w+/,        reason: '`public class` declaration' },
      { pattern: /\bpublic\s+static\s+\w+/,       reason: '`public static` method/property' },
      { pattern: /\bvar\s+\w+\s*=/,               reason: '`var` type inference' },
      { pattern: /\bList<\w+>|\bDictionary<\w+,\s*\w+>/, reason: 'C# generic collections' },
      { pattern: /\bawait\s+\w+|\basync\s+Task\b/, reason: '`async`/`await` Task pattern' },
    ],
    supporting: [
      { pattern: /\bstring\s+\w+\s*=/,            reason: '`string` type (lowercase C# alias)' },
      { pattern: /\b(int|bool|double|float)\s+\w+\s*[=;]/, reason: 'C# primitive type declaration' },
      { pattern: /\bget;\s*set;/,                 reason: 'Auto-property `{ get; set; }`' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
    ],
  },

  // ── Go ─────────────────────────────────────────────────────────────────────
  {
    language: 'Go', icon: '🐹', monacoId: 'go',
    definitive: [
      { pattern: /\bpackage\s+main\b/,             reason: '`package main` declaration' },
      { pattern: /\bfmt\.(Print|Println|Printf|Sprintf|Errorf)\s*\(/, reason: '`fmt.Println()` standard output' },
      { pattern: /\b:=\s/,                        reason: 'Short variable declaration (`:=`)' },
      { pattern: /\bgo\s+func\s*\(/,              reason: 'Goroutine launch (`go func()`)' },
    ],
    strong: [
      { pattern: /\bfunc\s+\w+\s*\(/,             reason: '`func` function declaration' },
      { pattern: /\bimport\s*\(/,                 reason: 'Multi-package `import ()` block' },
      { pattern: /\bchan\s+\w+/,                 reason: 'Channel type (`chan`)' },
      { pattern: /\bdefer\s+/,                   reason: '`defer` statement' },
      { pattern: /\brange\s+\w+/,                reason: '`range` loop construct' },
    ],
    supporting: [
      { pattern: /\bstruct\s*\{/,                reason: '`struct` literal' },
      { pattern: /\binterface\s*\{/,             reason: '`interface` definition' },
      { pattern: /\berr\s*!=\s*nil\b/,           reason: '`err != nil` error check (Go idiom)' },
    ],
    structural: [
      { pattern: /^package\s+\w+/m,             reason: 'Package declaration line' },
    ],
  },

  // ── Rust ───────────────────────────────────────────────────────────────────
  {
    language: 'Rust', icon: '🦀', monacoId: 'rust',
    definitive: [
      { pattern: /\bprintln!\s*\(/,               reason: '`println!()` macro' },
      { pattern: /\blet\s+mut\s+\w+/,             reason: '`let mut` mutable binding' },
      { pattern: /\bResult<\w+,\s*\w+>|\bOption<\w+>/, reason: '`Result<>` / `Option<>` types' },
      { pattern: /\bimpl\s+\w+(\s+for\s+\w+)?/,  reason: '`impl` block' },
    ],
    strong: [
      { pattern: /\bfn\s+\w+\s*\(/,              reason: '`fn` function declaration' },
      { pattern: /\bpub\s+fn\s+/,                reason: '`pub fn` public function' },
      { pattern: /\buse\s+\w+::/,                reason: '`use` path import (`use std::`)' },
      { pattern: /\bmatch\s+\w+\s*\{/,           reason: '`match` pattern matching' },
      { pattern: /\b&mut\s+\w+/,                 reason: 'Mutable reference (`&mut`)' },
      { pattern: /\b&self\b|\b&mut\s+self\b/,   reason: '`&self` method receiver' },
    ],
    supporting: [
      { pattern: /\bVec<\w+>|\bBox<\w+>|\bArc<\w+>/, reason: 'Rust smart pointer types (`Vec<>`, `Box<>`)' },
      { pattern: /\b(i32|u32|i64|u64|f32|f64|usize|isize|bool)\b/, reason: 'Rust primitive type names' },
      { pattern: /\bmod\s+\w+/,                  reason: '`mod` module declaration' },
    ],
    structural: [],
  },

  // ── PHP ────────────────────────────────────────────────────────────────────
  {
    language: 'PHP', icon: '🐘', monacoId: 'php',
    definitive: [
      { pattern: /<\?php\b/,                      reason: '`<?php` opening tag' },
      { pattern: /\$\w+\s*=/,                     reason: '`$variable` PHP variable syntax' },
      { pattern: /\becho\s+['"]?\w+/,             reason: '`echo` output statement' },
    ],
    strong: [
      { pattern: /\bfunction\s+\w+\s*\(\s*\$/,   reason: 'Function with `$param` parameters' },
      { pattern: /\b(public|private|protected)\s+function\s+\w+/, reason: 'Class method with access modifier' },
      { pattern: /\bforeach\s*\(\s*\$/,          reason: '`foreach ($arr as $item)` loop' },
      { pattern: /\b->\w+/,                      reason: 'Object operator (`->`)' },
      { pattern: /\b::\w+/,                      reason: 'Static resolution operator (`::`)' },
    ],
    supporting: [
      { pattern: /\bnew\s+\w+\s*\(/,             reason: '`new` object instantiation' },
      { pattern: /\barray\s*\(/,                 reason: '`array()` literal (old PHP)' },
      { pattern: /\bclass\s+\w+\s*\{/,           reason: '`class` definition' },
    ],
    structural: [],
  },

  // ── SQL ────────────────────────────────────────────────────────────────────
  {
    language: 'SQL', icon: '🗃️', monacoId: 'sql',
    definitive: [
      { pattern: /\bSELECT\s+[\w*].+\bFROM\b/i,  reason: '`SELECT … FROM` query' },
      { pattern: /\bINSERT\s+INTO\b/i,            reason: '`INSERT INTO` statement' },
      { pattern: /\bCREATE\s+TABLE\b/i,           reason: '`CREATE TABLE` DDL' },
      { pattern: /\bUPDATE\s+\w+\s+SET\b/i,       reason: '`UPDATE … SET` statement' },
    ],
    strong: [
      { pattern: /\bDELETE\s+FROM\b/i,            reason: '`DELETE FROM` statement' },
      { pattern: /\bALTER\s+TABLE\b/i,            reason: '`ALTER TABLE` DDL' },
      { pattern: /\bJOIN\s+\w+\s+ON\b/i,          reason: '`JOIN … ON` clause' },
      { pattern: /\bWHERE\s+\w+\s*(=|<|>|LIKE|IN)\b/i, reason: '`WHERE` filter clause' },
      { pattern: /\bGROUP\s+BY\b/i,               reason: '`GROUP BY` aggregation' },
      { pattern: /\bORDER\s+BY\b/i,               reason: '`ORDER BY` sorting' },
    ],
    supporting: [
      { pattern: /\bHAVING\b/i,                   reason: '`HAVING` aggregate filter' },
      { pattern: /\bDROP\s+TABLE\b/i,             reason: '`DROP TABLE` statement' },
      { pattern: /\bINDEX\b/i,                    reason: 'Index-related DDL' },
    ],
    structural: [],
  },

  // ── HTML ───────────────────────────────────────────────────────────────────
  {
    language: 'HTML', icon: '🌐', monacoId: 'html',
    definitive: [
      { pattern: /<!DOCTYPE\s+html>/i,            reason: '`<!DOCTYPE html>` declaration' },
      { pattern: /<html[\s>]/i,                   reason: '`<html>` root element' },
      { pattern: /<head[\s>]/i,                   reason: '`<head>` section element' },
      { pattern: /<body[\s>]/i,                   reason: '`<body>` section element' },
    ],
    strong: [
      { pattern: /<div[\s>]/i,                    reason: '`<div>` container element' },
      { pattern: /<a\s+href/i,                    reason: '`<a href>` hyperlink element' },
      { pattern: /<img\s+src/i,                   reason: '`<img src>` image element' },
      { pattern: /<script[\s>]/i,                 reason: '`<script>` tag' },
      { pattern: /<link\s+rel/i,                  reason: '`<link rel>` stylesheet link' },
      { pattern: /<meta\s/i,                      reason: '`<meta>` metadata tag' },
    ],
    supporting: [
      { pattern: /<(h[1-6]|p|span|ul|li|form|input|button)[\s>]/i, reason: 'Standard HTML elements' },
      { pattern: /class=["']/i,                   reason: '`class=` attribute' },
      { pattern: /id=["']/i,                      reason: '`id=` attribute' },
    ],
    structural: [
      { pattern: /<\/\w+>/,                       reason: 'HTML closing tags' },
    ],
  },

  // ── CSS ────────────────────────────────────────────────────────────────────
  {
    language: 'CSS', icon: '🎨', monacoId: 'css',
    definitive: [
      { pattern: /@media\s*\(/,                   reason: '`@media` responsive query' },
      { pattern: /@keyframes\s+\w+/,              reason: '`@keyframes` animation definition' },
      { pattern: /\bvar\(--\w+\)/,               reason: 'CSS custom property `var(--name)`' },
    ],
    strong: [
      { pattern: /\.([\w-]+)\s*\{/,              reason: 'CSS class selector (`.class {}`)' },
      { pattern: /#([\w-]+)\s*\{/,              reason: 'CSS ID selector (`#id {}`)' },
      { pattern: /\b(margin|padding|display|position|color|background|font-size|border|width|height)\s*:/,  reason: 'CSS property declarations' },
      { pattern: /:hover\s*\{/,                  reason: '`:hover` pseudo-class' },
      { pattern: /::before|::after/,             reason: '`::before` / `::after` pseudo-element' },
    ],
    supporting: [
      { pattern: /\b(body|html|div|span|a)\s*\{/, reason: 'Element selector' },
      { pattern: /@import\s+/,                    reason: '`@import` statement' },
      { pattern: /\bflex|grid\b/,                reason: 'Flexbox / Grid layout keyword' },
    ],
    structural: [],
  },

  // ── Bash / Shell ───────────────────────────────────────────────────────────
  {
    language: 'Bash', icon: '🖥️', monacoId: 'shell',
    definitive: [
      { pattern: /^#!\/bin\/(bash|sh|zsh|dash)/m, reason: 'Shell script shebang line' },
      { pattern: /^[ \t]*if\s+\[/m,              reason: '`if [ ]` POSIX test syntax' },
      { pattern: /\bfi\b/,                        reason: '`fi` closes `if` (shell-specific)' },
      { pattern: /\bdone\b/,                      reason: '`done` closes loops (shell-specific)' },
    ],
    strong: [
      { pattern: /^[ \t]*echo\s+/m,              reason: '`echo` shell output command' },
      { pattern: /\$\{?\w+\}?/,                  reason: '`$VAR` shell variable expansion' },
      { pattern: /^[ \t]*for\s+\w+\s+in\s+/m,   reason: '`for … in` shell loop' },
      { pattern: /\|\s*(grep|awk|sed|cut|sort|uniq|wc)\b/, reason: 'Unix pipe with text tool' },
      { pattern: /chmod\s+\d+/,                  reason: '`chmod` file permissions command' },
    ],
    supporting: [
      { pattern: /^[ \t]*function\s+\w+\s*\(\s*\)/m, reason: 'Shell `function` declaration' },
      { pattern: /\bsource\s+\./,                reason: '`source ./file` include' },
      { pattern: /\bexport\s+\w+/,              reason: '`export` environment variable' },
    ],
    structural: [],
  },

  // ── Kotlin ─────────────────────────────────────────────────────────────────
  {
    language: 'Kotlin', icon: '🟣', monacoId: 'kotlin',
    definitive: [
      { pattern: /\bfun\s+main\s*\(/,             reason: '`fun main()` entry point' },
      { pattern: /\bdata\s+class\s+\w+/,          reason: '`data class` declaration' },
      { pattern: /\bsealed\s+class\s+\w+/,        reason: '`sealed class` declaration' },
      { pattern: /\bcompanion\s+object\b/,        reason: '`companion object` block' },
    ],
    strong: [
      { pattern: /\bfun\s+\w+\s*\(/,              reason: '`fun` function declaration' },
      { pattern: /\bval\s+\w+\s*[=:]/,           reason: '`val` immutable property' },
      { pattern: /\bvar\s+\w+\s*[=:]/,           reason: '`var` mutable property' },
      { pattern: /\bprintln\s*\(/,               reason: '`println()` output function' },
      { pattern: /\bwhen\s*\(/,                  reason: '`when` expression (Kotlin-specific)' },
      { pattern: /\boverride\s+fun\b/,           reason: '`override fun` method override' },
    ],
    supporting: [
      { pattern: /\bsuspend\s+fun\b/,            reason: '`suspend fun` coroutine function' },
      { pattern: /\bnull\b/,                     reason: '`null` literal' },
      { pattern: /\blet\s*\{|\brun\s*\{/,       reason: 'Kotlin scope function (`let {}`, `run {}`)' },
    ],
    structural: [],
  },

  // ── Swift ──────────────────────────────────────────────────────────────────
  {
    language: 'Swift', icon: '🍎', monacoId: 'swift',
    definitive: [
      { pattern: /\bguard\s+let\s+\w+/,           reason: '`guard let` optional binding' },
      { pattern: /\bimport\s+(Foundation|UIKit|SwiftUI|AppKit)\b/, reason: '`import Foundation/UIKit` framework' },
      { pattern: /\bif\s+let\s+\w+/,             reason: '`if let` optional binding' },
    ],
    strong: [
      { pattern: /\bfunc\s+\w+\s*\(/,             reason: '`func` function declaration' },
      { pattern: /\bvar\s+\w+\s*:/,              reason: '`var name: Type` property declaration' },
      { pattern: /\blet\s+\w+\s*:/,              reason: '`let name: Type` constant declaration' },
      { pattern: /\bstruct\s+\w+\s*\{/,          reason: '`struct` definition' },
      { pattern: /\bprotocol\s+\w+\s*\{/,       reason: '`protocol` definition' },
      { pattern: /\bprint\s*\(/,                  reason: '`print()` output function' },
    ],
    supporting: [
      { pattern: /\benum\s+\w+\s*\{/,            reason: '`enum` definition' },
      { pattern: /\bextension\s+\w+/,            reason: '`extension` declaration' },
      { pattern: /\boptional\b|\?\./,            reason: 'Optional chaining (`?.`)' },
    ],
    structural: [],
  },

  // ── Dart ───────────────────────────────────────────────────────────────────
  {
    language: 'Dart', icon: '🎯', monacoId: 'dart',
    definitive: [
      { pattern: /\bvoid\s+main\s*\(\s*\)/,       reason: '`void main()` Dart entry point' },
      { pattern: /\bFuture<\w+>/,                 reason: '`Future<T>` async type' },
      { pattern: /\bWidget\s+build\s*\(/,         reason: '`Widget build()` Flutter method' },
      { pattern: /\bimport\s+'package:\w+/,       reason: '`import \'package:\'` pub import' },
    ],
    strong: [
      { pattern: /\bList<\w+>|\bMap<\w+,\s*\w+>/, reason: 'Dart generic collection types' },
      { pattern: /\bprint\s*\(/,                  reason: '`print()` output function' },
      { pattern: /\bconst\s+\w+\s*=/,             reason: '`const` compile-time constant' },
      { pattern: /\bfinal\s+\w+\s*=/,             reason: '`final` runtime constant' },
    ],
    supporting: [
      { pattern: /\bvar\s+\w+\s*=/,              reason: '`var` type-inferred declaration' },
      { pattern: /\b(int|double|bool|String)\s+\w+\s*[=;]/, reason: 'Dart built-in type declaration' },
      { pattern: /\bclass\s+\w+\s+extends\s+\w+/, reason: 'Flutter widget `extends`' },
    ],
    structural: [
      { pattern: /;[ \t]*$/m,                     reason: 'Semicolon line terminators' },
    ],
  },

  // ── Ruby ───────────────────────────────────────────────────────────────────
  {
    language: 'Ruby', icon: '💎', monacoId: 'ruby',
    definitive: [
      { pattern: /^[ \t]*end\s*$/m,              reason: '`end` keyword closes blocks (Ruby)' },
      { pattern: /\battr_accessor\b|\battr_reader\b|\battr_writer\b/, reason: '`attr_accessor` Ruby method' },
      { pattern: /\bdo\s*\|[\w,\s]+\|/,          reason: '`do |block_var|` block syntax' },
    ],
    strong: [
      { pattern: /^[ \t]*def\s+\w+\s*$/m,        reason: '`def method_name` declaration' },
      { pattern: /\bputs\s+/,                     reason: '`puts` output method' },
      { pattern: /\brequire\s+['"]\w+/,           reason: '`require` module import' },
      { pattern: /\.each\s+do\b|\.map\s+do\b/,   reason: '`.each do` / `.map do` enumerable' },
    ],
    supporting: [
      { pattern: /\bnil\b/,                       reason: '`nil` null value (Ruby)' },
      { pattern: /\bmodule\s+\w+/,               reason: '`module` declaration' },
      { pattern: /\bclass\s+\w+\s*<\s*\w+/,      reason: 'Class inheritance (`class Foo < Bar`)' },
    ],
    structural: [],
  },

  // ── R ──────────────────────────────────────────────────────────────────────
  {
    language: 'R', icon: '📊', monacoId: 'r',
    definitive: [
      { pattern: /\w+\s*<-\s*\w+/,               reason: 'Assignment operator `<-` (R-specific)' },
      { pattern: /\bdata\.frame\s*\(/,            reason: '`data.frame()` R data structure' },
      { pattern: /\blibrary\s*\(\s*\w+\s*\)/,   reason: '`library()` R package import' },
      { pattern: /\bc\s*\([^)]+\)/,              reason: '`c()` combine function (R-specific)' },
    ],
    strong: [
      { pattern: /\bggplot\s*\(/,                reason: '`ggplot()` visualization library' },
      { pattern: /\blm\s*\(/,                    reason: '`lm()` linear model function' },
      { pattern: /\bprint\s*\(\s*\w+\s*\)/,     reason: '`print()` R output' },
      { pattern: /\bif\s*\(.*\)\s*\{/,          reason: 'R if-block syntax' },
    ],
    supporting: [
      { pattern: /\bsapply\b|\blapply\b|\bvapply\b/, reason: 'R apply family functions' },
      { pattern: /\bsum\s*\(|\bmean\s*\(|\bsd\s*\(/, reason: 'Statistical functions (`sum`, `mean`)' },
    ],
    structural: [],
  },
];

// Weight multipliers per layer
const LAYER_WEIGHTS = {
  definitive:  3.0,
  strong:      2.0,
  supporting:  1.0,
  structural:  0.5,
};

// ─── Cache ────────────────────────────────────────────────────────────────────
const detectionCache = new Map();

function buildCacheKey(code) {
  const t = code.trim().replace(/\s+/g, ' ');
  return `${t.slice(0, CACHE_KEY_CHARS)}_${t.length}`;
}

// ─── Core Detection Logic ─────────────────────────────────────────────────────
/**
 * Score one language profile against the given code.
 * Returns { rawScore, maxPossible, matchedReasons[] }
 */
function scoreProfile(profile, code) {
  let rawScore = 0;
  let maxPossible = 0;
  const matchedReasons = [];

  for (const [layer, weight] of Object.entries(LAYER_WEIGHTS)) {
    const patterns = profile[layer] || [];
    for (const entry of patterns) {
      maxPossible += weight;
      if (entry.pattern.test(code)) {
        rawScore += weight;
        matchedReasons.push(entry.reason);
      }
    }
  }

  return { rawScore, maxPossible, matchedReasons };
}

// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Detect the programming language of the given code snippet.
 *
 * @param {string} code
 * @returns {{
 *   language: string,
 *   icon: string,
 *   monacoId: string,
 *   confidence: number,
 *   confidencePct: number,
 *   unclear: boolean,
 *   reasons: string[],
 *   candidates: Array<{ language: string, icon: string, confidencePct: number }>,
 *   isAmbiguous: boolean,
 * }}
 */
export function detectLanguage(code) {
  if (!code || !code.trim()) {
    return _unknownResult([]);
  }

  const cacheKey = buildCacheKey(code);
  if (detectionCache.has(cacheKey)) {
    return detectionCache.get(cacheKey);
  }

  // Score every language
  const scored = LANGUAGE_PROFILES.map((profile) => {
    const { rawScore, maxPossible, matchedReasons } = scoreProfile(profile, code);
    const normalized = maxPossible > 0 ? rawScore / maxPossible : 0;
    return {
      language:     profile.language,
      icon:         profile.icon,
      monacoId:     profile.monacoId,
      normalized,
      matchedReasons,
    };
  });

  // Sort descending by normalized score
  scored.sort((a, b) => b.normalized - a.normalized);

  const best = scored[0];
  const runner = scored[1];

  // Build result
  let result;

  if (best.normalized < UNCLEAR_THRESHOLD) {
    result = _unknownResult(scored.slice(0, 3).filter(s => s.normalized > 0));
  } else {
    // Normalise to 0-100 display percentage (cap; typical max normalized ~0.5–0.7)
    const confidencePct = Math.min(99, Math.round((best.normalized / 0.55) * 100));

    // Ambiguity: is runner within AMBIGUOUS_GAP of best?
    const isAmbiguous = runner && (best.normalized - runner.normalized) < AMBIGUOUS_GAP && runner.normalized > UNCLEAR_THRESHOLD;

    result = {
      language:     best.language,
      icon:         best.icon,
      monacoId:     best.monacoId,
      confidence:   best.normalized,
      confidencePct,
      unclear:      false,
      // Top 3 matched reasons
      reasons:      best.matchedReasons.slice(0, 4),
      // Top 3 candidates for ambiguity UI
      candidates:   scored.slice(0, 3).filter(s => s.normalized > 0.01).map(s => ({
        language:     s.language,
        icon:         s.icon,
        confidencePct: Math.min(99, Math.round((s.normalized / 0.55) * 100)),
      })),
      isAmbiguous,
    };
  }

  // Cache result
  if (detectionCache.size >= CACHE_MAX_SIZE) {
    detectionCache.delete(detectionCache.keys().next().value);
  }
  detectionCache.set(cacheKey, result);

  return result;
}

function _unknownResult(candidates) {
  return {
    language:     'Unknown',
    icon:         '📄',
    monacoId:     'plaintext',
    confidence:   0,
    confidencePct: 0,
    unclear:      true,
    reasons:      [],
    candidates:   candidates.map(s => ({
      language:     s.language,
      icon:         s.icon,
      confidencePct: Math.min(99, Math.round((s.normalized / 0.55) * 100)),
    })),
    isAmbiguous:  false,
  };
}

/**
 * Clear the detection cache (useful in testing or after code paste).
 */
export function clearDetectionCache() {
  detectionCache.clear();
}

/**
 * Get metadata for all supported languages.
 * @returns {{ language, icon, monacoId }[]}
 */
export function getSupportedLanguages() {
  return LANGUAGE_PROFILES.map(({ language, icon, monacoId }) => ({
    language, icon, monacoId,
  }));
}
