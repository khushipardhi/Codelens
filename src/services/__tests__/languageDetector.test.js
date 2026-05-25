/**
 * Language Detector — Unit Tests
 * ================================
 * Tests for the pattern-based language detection service.
 *
 * Run with: npm run test (after adding vitest to devDependencies)
 *
 * To add tests:
 *   npm install -D vitest
 *   Add "test": "vitest" to package.json scripts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { detectLanguage, clearDetectionCache, getSupportedLanguages } from '../languageDetector';

// Reset cache before each test so results are independent
beforeEach(() => {
  clearDetectionCache();
});

// ---- Python ----
describe('Python detection', () => {
  it('detects def + colon syntax', () => {
    const result = detectLanguage('def hello():\n    print("Hello")\n');
    expect(result.language).toBe('Python');
    expect(result.unclear).toBe(false);
    expect(result.confidencePct).toBeGreaterThan(0);
  });

  it('detects class definition', () => {
    const result = detectLanguage('class MyClass:\n    def __init__(self):\n        pass\n');
    expect(result.language).toBe('Python');
  });

  it('detects import + from', () => {
    const result = detectLanguage('from typing import List\nimport os\n');
    expect(result.language).toBe('Python');
  });
});

// ---- JavaScript ----
describe('JavaScript detection', () => {
  it('detects console.log', () => {
    const result = detectLanguage('const x = 1;\nconsole.log(x);\n');
    expect(result.language).toBe('JavaScript');
  });

  it('detects arrow function', () => {
    const result = detectLanguage('const greet = (name) => {\n  return `Hello ${name}`;\n};\n');
    expect(result.language).toBe('JavaScript');
  });

  it('detects async/await', () => {
    const result = detectLanguage('async function fetchData() {\n  const data = await fetch("/api");\n  return data.json();\n}\n');
    expect(result.language).toBe('JavaScript');
  });
});

// ---- TypeScript ----
describe('TypeScript detection', () => {
  it('detects interface definition', () => {
    const result = detectLanguage('interface User {\n  name: string;\n  age: number;\n}\n');
    expect(result.language).toBe('TypeScript');
  });

  it('detects type annotations with interface', () => {
    const result = detectLanguage(
      'interface User { name: string; age: number; }\n' +
      'function greet(user: User): void {\n  console.log(user.name);\n}\n'
    );
    expect(result.language).toBe('TypeScript');
  });
});

// ---- Java ----
describe('Java detection', () => {
  it('detects public class with main', () => {
    const result = detectLanguage('public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello");\n  }\n}\n');
    expect(result.language).toBe('Java');
  });
});

// ---- C++ ----
describe('C++ detection', () => {
  it('detects iostream include + cout', () => {
    const result = detectLanguage('#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello" << endl;\n  return 0;\n}\n');
    expect(result.language).toBe('C++');
  });
});

// ---- C ----
describe('C detection', () => {
  it('detects stdio.h and printf', () => {
    const result = detectLanguage('#include <stdio.h>\nint main() {\n  printf("Hello\\n");\n  return 0;\n}\n');
    expect(result.language).toBe('C');
  });
});

// ---- Go ----
describe('Go detection', () => {
  it('detects package main and fmt.Println', () => {
    const result = detectLanguage('package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello")\n}\n');
    expect(result.language).toBe('Go');
  });
});

// ---- Rust ----
describe('Rust detection', () => {
  it('detects fn main and println!', () => {
    const result = detectLanguage('fn main() {\n  println!("Hello, World!");\n}\n');
    expect(result.language).toBe('Rust');
  });
});

// ---- Bash ----
describe('Bash detection', () => {
  it('detects shebang and echo', () => {
    const result = detectLanguage('#!/bin/bash\necho "Hello"\nfor i in 1 2 3; do\n  echo $i\ndone\n');
    expect(result.language).toBe('Bash');
  });
});

// ---- SQL ----
describe('SQL detection', () => {
  it('detects SELECT FROM', () => {
    const result = detectLanguage('SELECT id, name FROM users WHERE active = 1;\n');
    expect(result.language).toBe('SQL');
  });
});

// ---- HTML ----
describe('HTML detection', () => {
  it('detects DOCTYPE and html tags', () => {
    const result = detectLanguage('<!DOCTYPE html>\n<html>\n<head><title>Test</title></head>\n<body><div>Hello</div></body>\n</html>\n');
    expect(result.language).toBe('HTML');
  });
});

// ---- CSS ----
describe('CSS detection', () => {
  it('detects selector and properties', () => {
    const result = detectLanguage('body {\n  margin: 0;\n  padding: 0;\n  background: #fff;\n  color: #333;\n}\n');
    expect(result.language).toBe('CSS');
  });
});

// ---- PHP ----
describe('PHP detection', () => {
  it('detects <?php and $variable', () => {
    const result = detectLanguage('<?php\n$name = "World";\necho "Hello, $name!";\n');
    expect(result.language).toBe('PHP');
  });
});

// ---- Unknown / Unclear ----
describe('Unknown / unclear detection', () => {
  it('returns unclear for empty string', () => {
    const result = detectLanguage('');
    expect(result.unclear).toBe(true);
    expect(result.language).toBe('Unknown');
  });

  it('returns unclear for whitespace only', () => {
    const result = detectLanguage('   \n\n   ');
    expect(result.unclear).toBe(true);
  });

  it('returns unclear for generic plain text', () => {
    const result = detectLanguage('hello world this is just plain text without any code');
    expect(result.unclear).toBe(true);
  });
});

// ---- Confidence % ----
describe('Confidence percentage', () => {
  it('returns a number between 0 and 100', () => {
    const result = detectLanguage('def greet():\n    print("hi")\n');
    expect(result.confidencePct).toBeGreaterThanOrEqual(0);
    expect(result.confidencePct).toBeLessThanOrEqual(100);
  });
});

// ---- Cache ----
describe('Caching', () => {
  it('returns same result for identical code', () => {
    const code = 'console.log("hello");\n';
    const r1 = detectLanguage(code);
    const r2 = detectLanguage(code);
    expect(r1.language).toBe(r2.language);
    expect(r1.confidencePct).toBe(r2.confidencePct);
  });
});

// ---- getSupportedLanguages ----
describe('getSupportedLanguages', () => {
  it('returns at least 13 languages', () => {
    const langs = getSupportedLanguages();
    expect(langs.length).toBeGreaterThanOrEqual(13);
  });

  it('each language has icon, language, monacoId', () => {
    const langs = getSupportedLanguages();
    langs.forEach((l) => {
      expect(l.language).toBeTruthy();
      expect(l.icon).toBeTruthy();
      expect(l.monacoId).toBeTruthy();
    });
  });
});
