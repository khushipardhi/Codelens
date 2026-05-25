/**
 * Offline Analysis Provider for CodeLens
 * Runs pure client-side pattern matching and universal syntax verification.
 */

// ---- Built-in Error Patterns ----
const ERROR_PATTERNS = {
  Python: [
    {
      pattern: /^\s*(def|class|if|elif|else|for|while|try|except|finally|with)\b[^:]*$/m,
      errorName: 'SyntaxError: Missing Colon',
      simple: 'It looks like Python expected a colon (:) at the end of this statement.',
      why: 'In Python, statements like if, for, while, def, and class need to end with a colon to mark the beginning of a code block.',
      fix: 'Add a colon (:) at the end of the statement.',
      avoid: 'After writing any control flow statement (if, for, while) or definition (def, class), always add a colon at the end before pressing Enter.',
      comfort: "This is one of the most common adjustments when learning Python — you're building great habits! 👍",
    },
    {
      pattern: /print\s+[^(]/,
      errorName: 'SyntaxError: Missing Parentheses in print',
      simple: 'Python 3 requires parentheses around print arguments.',
      why: 'In Python 2, print was a statement, but in Python 3 it became a function that requires parentheses.',
      fix: 'Change `print "hello"` to `print("hello")`.',
      avoid: 'Always use print() with parentheses — this is the modern Python 3 way.',
      comfort: "Many developers transitioning from Python 2 encounter this — it's a quick adjustment! 👍",
    },
    {
      pattern: /(\t+ +| +\t+)/m,
      errorName: 'IndentationError: Mixed Tabs and Spaces',
      simple: 'Python detected a mix of tabs and spaces for indentation.',
      why: 'Python is particular about consistent indentation. Mixing tabs and spaces confuses the interpreter.',
      fix: 'Use either all spaces (recommended: 4 spaces) or all tabs consistently throughout your file.',
      avoid: 'Configure your editor to insert spaces when you press Tab (most modern editors do this by default).',
      comfort: "Indentation consistency is a learning curve in Python, but once you set up your editor correctly, it becomes automatic! 👍",
    },
    {
      pattern: /def\s+\w+\s*\([^)]*\)\s*:\s*\n(?!\s)/m,
      errorName: 'IndentationError: Expected Indented Block',
      simple: 'Python expected indented code after this function definition.',
      why: 'After a colon (:) in Python, the next line must be indented to show it belongs inside that block.',
      fix: 'Add 4 spaces of indentation to the code inside the function.',
      avoid: 'Whenever you write a line ending with (:), immediately press Tab on the next line to start the indented block.',
      comfort: "Understanding indentation is a key milestone in learning Python — you're making progress! 👍",
    },
    {
      pattern: /\bif\b[^=]*[^=!<>]=[^=][^=]/m,
      errorName: 'SyntaxError: Assignment in Condition',
      simple: 'It looks like a single = was used in a condition instead of == for comparison.',
      why: 'In Python, = is for assignment (setting a value), while == is for comparison (checking equality).',
      fix: 'Change = to == in the if condition.',
      avoid: 'Remember: one = sets a value, two == checks a value. A simple rule that becomes second nature!',
      comfort: "This mix-up between = and == is incredibly common across all programming languages — great catch! 👍",
    },
    {
      pattern: /(\[|\(|\{)[^)\]}]*$/m,
      errorName: 'SyntaxError: Unmatched Bracket',
      simple: 'There seems to be an opening bracket without a matching closing bracket.',
      why: 'Every opening bracket ( [ or { needs a matching closing bracket ) ] or }.',
      fix: 'Check your brackets and add the missing closing bracket.',
      avoid: 'Many editors highlight matching brackets — watch for the highlight when you click on a bracket.',
      comfort: "Mismatched brackets happen to everyone, even experienced developers! 👍",
    },
  ],
  JavaScript: [
    {
      pattern: /\blet\s+\w+\s*\n.*\1/s,
      errorName: 'SyntaxError: Variable Already Declared',
      simple: 'A variable with this name was already declared with `let` in the same scope.',
      why: "Unlike `var`, `let` doesn't allow re-declaration of the same variable in the same scope.",
      fix: 'Either rename the variable or use the existing one without re-declaring.',
      avoid: 'Use descriptive variable names to avoid naming collisions.',
      comfort: "Understanding variable scoping is a fundamental concept — you're learning it well! 👍",
    },
    {
      pattern: /===?\s*undefined|typeof\s+\w+\s*===?\s*['"]undefined['"]/,
      errorName: 'Potential TypeError: Undefined Reference',
      simple: "This code checks for undefined, which may indicate a variable isn't being set properly.",
      why: 'Variables in JavaScript are undefined when declared but not assigned a value, or when accessing non-existent object properties.',
      fix: 'Make sure the variable is properly initialized before using it.',
      avoid: 'Always initialize variables with a default value when declaring them.',
      comfort: 'Handling undefined is a core JavaScript skill — you\'re developing good defensive coding habits! 👍',
    },
    {
      pattern: /==[^=]/,
      errorName: 'Style Warning: Loose Equality',
      simple: 'Using == instead of === can lead to unexpected type coercion.',
      why: 'The == operator converts types before comparing, which can give surprising results (like "1" == 1 being true).',
      fix: 'Use === for strict equality comparison.',
      avoid: 'As a best practice, always use === and !== for comparisons in JavaScript.',
      comfort: 'Learning the difference between == and === is a key JavaScript milestone! 👍',
    },
    {
      pattern: /\bvar\s+/,
      errorName: 'Style Suggestion: Using var',
      simple: 'Consider using `let` or `const` instead of `var` for better scoping.',
      why: '`var` has function-level scoping which can lead to bugs. `let` and `const` have block-level scoping which is more predictable.',
      fix: 'Replace `var` with `const` (if the value doesn\'t change) or `let` (if it does).',
      avoid: 'Modern JavaScript best practice is to use `const` by default and `let` when you need to reassign.',
      comfort: 'Adopting modern JavaScript patterns shows great awareness of language evolution! 👍',
    },
  ],
  'C++': [
    {
      pattern: /;\s*\n\s*\{/,
      errorName: 'Logic Warning: Semicolon Before Block',
      simple: "There's a semicolon before a code block, which may cause the block to execute independently.",
      why: 'A semicolon before { terminates the statement above, making the block run regardless of any condition.',
      fix: 'Remove the semicolon before the opening brace.',
      avoid: "Always check that there's no stray semicolon between a condition and its block.",
      comfort: 'This is a subtle issue that even experienced C++ developers encounter! 👍',
    },
    {
      pattern: /cout\s*<<[^;]*$/m,
      errorName: 'SyntaxError: Missing Semicolon',
      simple: 'This statement appears to be missing a semicolon at the end.',
      why: 'In C++, every statement must end with a semicolon (;) to tell the compiler where it ends.',
      fix: 'Add a semicolon (;) at the end of the statement.',
      avoid: 'After writing each statement in C++, make it a habit to add a semicolon immediately.',
      comfort: 'Missing semicolons are the most common syntax adjustment in C/C++ — happens to everyone! 👍',
    },
  ],
  Java: [
    {
      pattern: /\bString\s+\w+\s*=\s*\w+\s*;/,
      errorName: 'Potential Error: String Assignment',
      simple: 'Make sure String values are enclosed in double quotes.',
      why: 'In Java, String literals must be wrapped in double quotes (""). Without quotes, Java treats the text as a variable name.',
      fix: 'Wrap the string value in double quotes: String name = "value";',
      avoid: 'Always use double quotes for String values in Java. Single quotes are for single characters (char).',
      comfort: 'Remembering quotation rules is one of those small details that becomes automatic with practice! 👍',
    },
    {
      pattern: /public\s+static\s+void\s+Main/,
      errorName: 'SyntaxError: Incorrect Main Method Name',
      simple: 'The main method name should be lowercase "main", not "Main".',
      why: 'Java is case-sensitive. The JVM specifically looks for a method named "main" (lowercase) as the program entry point.',
      fix: 'Change "Main" to "main".',
      avoid: 'Remember that Java conventions use camelCase for method names, and the entry point is always lowercase "main".',
      comfort: 'Case sensitivity catches many developers when switching between languages — you\'re paying great attention! 👍',
    },
  ],
  C: [
    {
      pattern: /printf\s*\([^"]/,
      errorName: 'SyntaxError: Printf Format String',
      simple: 'The first argument to printf should be a format string in double quotes.',
      why: 'printf() expects a format string as its first argument, which tells it how to display the data.',
      fix: 'Add a format string: printf("Value: %d", variable);',
      avoid: 'Always start printf with a quoted format string, then list variables after a comma.',
      comfort: "Printf formatting is one of C's unique features — mastering it is a valuable skill! 👍",
    },
  ],
  HTML: [
    {
      pattern: /<(\w+)[^>]*>[^<]*$/m,
      errorName: 'Structure Issue: Unclosed Tag',
      simple: 'There appears to be an HTML tag that hasn\'t been closed.',
      why: 'Most HTML tags need both an opening tag and a closing tag to properly structure the document.',
      fix: 'Add the matching closing tag (e.g., </div>, </p>, </span>).',
      avoid: 'Write the closing tag immediately after the opening tag, then add content between them.',
      comfort: 'Matching HTML tags is a foundational skill — you\'re building great web development habits! 👍',
    },
  ],
  SQL: [
    {
      pattern: /SELECT\s+\*\s+FROM/i,
      errorName: 'Performance Suggestion: SELECT *',
      simple: 'Using SELECT * retrieves all columns, which may not be optimal.',
      why: 'Selecting all columns can be slower and uses more memory than selecting only the columns you need.',
      fix: 'Replace * with specific column names: SELECT name, email FROM users;',
      avoid: 'List specific columns in your SELECT statement to improve query performance and clarity.',
      comfort: "Optimizing queries is an advanced database skill — great that you're thinking about it! 👍",
    },
  ],
};

const CONFIDENCE_MESSAGES = [
  "You were actually very close here 👍",
  "This is a common adjustment that even experienced developers make.",
  "Your understanding of the concept is solid — just a small syntax detail to adjust.",
  "Keep going! Every bug you fix makes you a stronger developer.",
  "This mistake shows you're pushing yourself to learn new things — that's great! 👍",
  "Many professional developers encounter this same issue regularly.",
  "You're building great debugging skills by catching this!",
  "The fact that you're reviewing your code shows excellent development habits 👍",
];

const BEGINNER_TIPS = {
  Python: [
    "Python uses indentation (spaces) instead of braces {} to define code blocks.",
    "Use 4 spaces for each level of indentation — it's the Python community standard.",
    "Python is case-sensitive: 'Print' and 'print' are different.",
    "Use meaningful variable names to make your code self-documenting.",
  ],
  JavaScript: [
    "Use 'const' for values that don't change, 'let' for values that do.",
    "JavaScript runs asynchronously — understanding Promises is key.",
    "Use console.log() liberally while debugging, then remove them for production.",
    "The browser DevTools (F12) is your best friend for JavaScript debugging.",
  ],
  Java: [
    "Java is strongly typed — always declare the type of each variable.",
    "Every Java file should contain one public class with the same name as the file.",
    "Java uses camelCase for methods and variables, PascalCase for classes.",
    "The main method signature must be exactly: public static void main(String[] args)",
  ],
  'C++': [
    "Always initialize your variables — uninitialized variables contain garbage values.",
    "Remember to use 'delete' or smart pointers to avoid memory leaks.",
    "The Standard Template Library (STL) has many useful data structures and algorithms.",
    "#include directives go at the top of the file.",
  ],
  C: [
    "Always check return values of malloc() — it can return NULL if memory is full.",
    "Use printf() with format specifiers: %d for int, %f for float, %s for string.",
    "Arrays in C start at index 0, and C won't warn you about out-of-bounds access.",
    "Free memory allocated with malloc() when you're done using it.",
  ],
};

export function getRandomConfidenceMessage() {
  return CONFIDENCE_MESSAGES[Math.floor(Math.random() * CONFIDENCE_MESSAGES.length)];
}

export function getBeginnerTip(language) {
  const tips = BEGINNER_TIPS[language] || [
    "Take your time reading error messages — they usually point to the exact issue.",
    "Break complex problems into smaller, testable pieces.",
    "Use comments to explain your thinking process.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// ---- Universal Syntax Validator ----
export function universalSyntaxCheck(code, language) {
  const errors = [];
  const lines = code.split('\n');

  // === CHECK 1: Unclosed string literals ===
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

    let inSingle = false;
    let inDouble = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      const prev = j > 0 ? line[j - 1] : '';

      if (prev === '\\') continue;

      if (ch === '"' && !inSingle) inDouble = !inDouble;
      if (ch === "'" && !inDouble) inSingle = !inSingle;
    }

    if (inDouble) {
      errors.push({
        errorName: 'SyntaxError: Unclosed String',
        lineNumber: i + 1,
        simple: `This line has a string with an opening " but no closing ". The quotation mark needs to be closed.`,
        why: 'Every string that starts with a quotation mark must also end with one. Without the closing quote, the compiler or interpreter cannot tell where the string ends.',
        fix: `Add the missing closing quotation mark (") to complete the string on line ${i + 1}.`,
        avoid: 'When typing a string, write both the opening and closing quotes first, then fill in the text between them.',
        comfort: 'Unclosed strings are one of the most common syntax issues — easy to make, easy to fix! 👍',
        relatedConcept: 'strings'
      });
    }

    if (inSingle) {
      if (language === 'Python' && (line.includes("'''") || line.includes('"""'))) continue;
      errors.push({
        errorName: 'SyntaxError: Unclosed String',
        lineNumber: i + 1,
        simple: `This line has a string with an opening ' but no closing '. The quotation mark needs to be closed.`,
        why: 'Every string that starts with a quotation mark must also end with one. Without the closing quote, the compiler or interpreter cannot tell where the string ends.',
        fix: `Add the missing closing quotation mark (') to complete the string on line ${i + 1}.`,
        avoid: 'When typing a string, write both the opening and closing quotes first, then fill in the text between them.',
        comfort: 'Unclosed strings are one of the most common syntax issues — easy to make, easy to fix! 👍',
        relatedConcept: 'strings'
      });
    }
  }

  // === CHECK 2: Mismatched brackets/parentheses/braces ===
  const bracketStack = [];
  const bracketMap = { '(': ')', '[': ']', '{': '}' };
  const closingBrackets = new Set([')', ']', '}']);
  let inString = false;
  let stringChar = '';
  let inLineComment;
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    inLineComment = false;
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j];
      const next = j < lines[i].length - 1 ? lines[i][j + 1] : '';
      const prev = j > 0 ? lines[i][j - 1] : '';

      if (!inString && !inLineComment && ch === '/' && next === '*') { inBlockComment = true; j++; continue; }
      if (inBlockComment && ch === '*' && next === '/') { inBlockComment = false; j++; continue; }
      if (inBlockComment) continue;

      if (!inString && ((ch === '/' && next === '/') || (ch === '#'))) { inLineComment = true; continue; }
      if (inLineComment) continue;

      if (!inString && (ch === '"' || ch === "'") && prev !== '\\') {
        inString = true; stringChar = ch; continue;
      }
      if (inString && ch === stringChar && prev !== '\\') {
        inString = false; continue;
      }
      if (inString) continue;

      if (bracketMap[ch]) {
        bracketStack.push({ char: ch, line: i + 1 });
      } else if (closingBrackets.has(ch)) {
        if (bracketStack.length === 0) {
          errors.push({
            errorName: 'SyntaxError: Unexpected Closing Bracket',
            lineNumber: i + 1,
            simple: `Found a closing "${ch}" without a matching opening bracket.`,
            why: `Every closing bracket must have a corresponding opening bracket before it.`,
            fix: `Either add the missing opening bracket or remove the extra "${ch}" on line ${i + 1}.`,
            avoid: 'Write both opening and closing brackets together, then fill in the content between them.',
            comfort: 'Bracket matching is something even seasoned developers double-check regularly! 👍',
            relatedConcept: 'syntax'
          });
        } else {
          const last = bracketStack[bracketStack.length - 1];
          if (bracketMap[last.char] !== ch) {
            errors.push({
              errorName: 'SyntaxError: Mismatched Bracket',
              lineNumber: i + 1,
              simple: `Expected "${bracketMap[last.char]}" to close the "${last.char}" from line ${last.line}, but found "${ch}" instead.`,
              why: `Each type of bracket must be closed with its matching pair: () [] {}`,
              fix: `Change "${ch}" to "${bracketMap[last.char]}" on line ${i + 1}, or fix the opening bracket on line ${last.line}.`,
              avoid: 'Use an editor that highlights matching bracket pairs to catch these quickly.',
              comfort: 'Mismatched brackets are a very common issue — most editors can help you spot them! 👍',
              relatedConcept: 'syntax'
            });
            bracketStack.pop();
          } else {
            bracketStack.pop();
          }
        }
      }
    }
  }

  for (const unclosed of bracketStack) {
    errors.push({
      errorName: 'SyntaxError: Unclosed Bracket',
      lineNumber: unclosed.line,
      simple: `The "${unclosed.char}" opened on line ${unclosed.line} is never closed.`,
      why: `Every opening bracket needs a matching closing bracket: ${unclosed.char}${bracketMap[unclosed.char]}`,
      fix: `Add a closing "${bracketMap[unclosed.char]}" to match the "${unclosed.char}" on line ${unclosed.line}.`,
      avoid: 'Write both opening and closing brackets together, then fill in the content.',
      comfort: 'Unclosed brackets are quick to fix once spotted! 👍',
      relatedConcept: 'syntax'
    });
  }

  // === CHECK 3: Missing semicolons (C-family languages only) ===
  const needsSemicolon = ['C', 'C++', 'Java', 'C#', 'JavaScript', 'TypeScript', 'Rust', 'Go'];
  if (needsSemicolon.includes(language)) {
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
      if (trimmed.endsWith('{') || trimmed.endsWith('}') || trimmed === '}') continue;
      if (trimmed.endsWith(':') || trimmed.endsWith(',')) continue;
      if (/^\s*(if|else|for|while|switch|do|try|catch|finally|case|default)\b/.test(trimmed)) continue;
      if (/^\s*(class|struct|enum|namespace|interface|public|private|protected)\b/.test(trimmed)) continue;
      if (/^\s*#/.test(trimmed)) continue;
      if (/^\s*\/\//.test(trimmed)) continue;
      if (language === 'JavaScript' || language === 'TypeScript' || language === 'Go') continue;

      if (/^(return|printf|scanf|cout|cin|std::|System\.|Console\.|print|puts|echo)\b/.test(trimmed) || /\)\s*$/.test(trimmed) || /[a-zA-Z0-9_"']\s*$/.test(trimmed)) {
        if (!trimmed.endsWith(';') && !trimmed.endsWith(')') && !trimmed.endsWith('{')) {
          if (/[=(]/.test(trimmed) || /^(return|printf|scanf|cout|cin)\b/.test(trimmed)) {
            errors.push({
              errorName: 'SyntaxError: Missing Semicolon',
              lineNumber: i + 1,
              simple: `This statement appears to be missing a semicolon (;) at the end.`,
              why: `In ${language}, statements must end with a semicolon to tell the compiler where the statement finishes.`,
              fix: `Add a semicolon (;) at the end of line ${i + 1}.`,
              avoid: 'Make it a habit to add a semicolon right after finishing each statement.',
              comfort: 'Missing semicolons are the #1 most common syntax issue in C-family languages! 👍',
              relatedConcept: 'syntax'
            });
          }
        }
      }
    }
  }

  return errors;
}

// ---- Built-in pattern analyzer ----
export function analyzeWithPatterns(code, language) {
  const syntaxErrors = universalSyntaxCheck(code, language);
  const patterns = ERROR_PATTERNS[language] || [];
  const patternErrors = [];

  for (const pattern of patterns) {
    const match = code.match(pattern.pattern);
    if (match) {
      let lineNumber = null;
      if (match.index !== undefined) {
        const upToMatch = code.substring(0, match.index);
        lineNumber = (upToMatch.match(/\n/g) || []).length + 1;
      }

      patternErrors.push({
        errorName: pattern.errorName,
        lineNumber,
        simple: pattern.simple,
        why: pattern.why,
        fix: pattern.fix,
        avoid: pattern.avoid,
        comfort: pattern.comfort,
        relatedConcept: pattern.relatedConcept || 'syntax',
      });
    }
  }

  const usedLines = new Set(syntaxErrors.map(e => e.lineNumber).filter(Boolean));
  const filteredPatternErrors = patternErrors.filter(e => !e.lineNumber || !usedLines.has(e.lineNumber));

  return [...syntaxErrors, ...filteredPatternErrors];
}

/**
 * Execute offline pattern analysis and return the normalized structure.
 */
export async function runOfflineAnalysis(code, language) {
  const errors = analyzeWithPatterns(code, language);

  if (errors.length === 0) {
    return {
      explanation: 'No syntax issues detected by pattern analysis. Your code structure looks correct! 🎉',
      fixes: [],
      improvedCode: null,
      confidence: "Your code is looking clean and well-structured. Great job! 👍",
      suggestions: [getBeginnerTip(language)],
    };
  }

  const explanation = errors.length === 1
    ? `Found 1 syntax issue — here's what happened and how to fix it.`
    : `Found ${errors.length} syntax issues — let's walk through each one.`;

  return {
    explanation,
    fixes: errors,
    improvedCode: null,
    confidence: getRandomConfidenceMessage(),
    suggestions: [getBeginnerTip(language)],
  };
}
