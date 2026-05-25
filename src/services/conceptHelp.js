/**
 * Quick Concept Help System for CodeLens
 *
 * Provides short 4-5 minute beginner-friendly concept explanations
 * with visual examples, real-life analogies, common mistakes, and practice tasks.
 */

const CONCEPT_LIBRARY = {
  loops: {
    title: 'Understanding Loops',
    icon: '🔄',
    duration: '4 min read',
    explanation: 'A loop is a way to repeat a block of code multiple times without writing it over and over. Think of it as giving your computer a simple instruction: "Do this thing N times."',
    analogy: '🏃 Imagine running laps around a track. Each lap is one "iteration" of the loop. You keep running until you\'ve completed the number of laps you planned.',
    visualSteps: [
      { label: 'Loop starts', detail: 'i = 0', icon: '▶️' },
      { label: 'Check condition', detail: 'Is i < 3?  → Yes ✓', icon: '❓' },
      { label: 'Run body', detail: 'print(i)  → prints 0', icon: '⚡' },
      { label: 'Update', detail: 'i becomes 1', icon: '🔄' },
      { label: 'Check again', detail: 'Is i < 3?  → Yes ✓', icon: '❓' },
      { label: 'Run body', detail: 'print(i)  → prints 1', icon: '⚡' },
      { label: 'Update', detail: 'i becomes 2', icon: '🔄' },
      { label: 'Check again', detail: 'Is i < 3?  → Yes ✓', icon: '❓' },
      { label: 'Run body', detail: 'print(i)  → prints 2', icon: '⚡' },
      { label: 'Update', detail: 'i becomes 3', icon: '🔄' },
      { label: 'Check again', detail: 'Is i < 3?  → No ✗', icon: '❓' },
      { label: 'Loop ends', detail: 'Move to next code', icon: '🏁' },
    ],
    codeExample: `# Python loop example
for i in range(3):
    print(i)

# Output:
# 0
# 1
# 2`,
    commonMistakes: [
      { mistake: 'Forgetting the colon (:) after for/while', tip: 'Always add : at the end of the loop line' },
      { mistake: 'Off-by-one errors in range', tip: 'range(3) gives 0, 1, 2 — not 1, 2, 3' },
      { mistake: 'Infinite loops (forgetting to update counter)', tip: 'Make sure the loop condition eventually becomes false' },
    ],
    practice: 'Try writing a loop that prints the numbers 1 to 5. Hint: use range(1, 6).',
  },

  functions: {
    title: 'Understanding Functions',
    icon: '📦',
    duration: '4 min read',
    explanation: 'A function is a reusable block of code that performs a specific task. You define it once, then call it whenever you need it. Functions help organize your code and avoid repetition.',
    analogy: '🍳 Think of a function like a recipe. You write the recipe once (define the function), and then you can cook the dish anytime by following the recipe (calling the function). You can even change the ingredients (parameters).',
    visualSteps: [
      { label: 'Define function', detail: 'def greet(name):', icon: '📝' },
      { label: 'Function body', detail: '  return "Hello, " + name', icon: '📦' },
      { label: 'Call function', detail: 'result = greet("Alex")', icon: '📞' },
      { label: 'Parameter received', detail: 'name = "Alex"', icon: '📥' },
      { label: 'Body executes', detail: '"Hello, " + "Alex"', icon: '⚡' },
      { label: 'Return value', detail: 'returns "Hello, Alex"', icon: '📤' },
      { label: 'Value stored', detail: 'result = "Hello, Alex"', icon: '💾' },
    ],
    codeExample: `# Define a function
def greet(name):
    return "Hello, " + name

# Call the function
message = greet("Alex")
print(message)
# Output: Hello, Alex`,
    commonMistakes: [
      { mistake: 'Forgetting to use return', tip: 'Without return, a function gives back None' },
      { mistake: 'Wrong number of arguments', tip: 'Pass exactly the number of parameters the function expects' },
      { mistake: 'Calling before defining', tip: 'Define the function above where you call it' },
    ],
    practice: 'Try writing a function called "add" that takes two numbers and returns their sum.',
  },

  arrays: {
    title: 'Understanding Arrays & Lists',
    icon: '📋',
    duration: '4 min read',
    explanation: 'An array (or list in Python) is an ordered collection of items stored in a single variable. Each item has a position number called an "index" starting from 0.',
    analogy: '🏢 Think of an array like numbered mailboxes in an apartment building. Box 0 has the first letter, Box 1 has the second, and so on. You can access any mailbox by its number.',
    visualSteps: [
      { label: 'Create list', detail: 'fruits = ["apple", "banana", "cherry"]', icon: '📋' },
      { label: 'Index 0', detail: 'fruits[0] → "apple"', icon: '0️⃣' },
      { label: 'Index 1', detail: 'fruits[1] → "banana"', icon: '1️⃣' },
      { label: 'Index 2', detail: 'fruits[2] → "cherry"', icon: '2️⃣' },
      { label: 'Length', detail: 'len(fruits) → 3', icon: '📏' },
      { label: 'Add item', detail: 'fruits.append("date")', icon: '➕' },
      { label: 'Updated list', detail: '["apple", "banana", "cherry", "date"]', icon: '✅' },
    ],
    codeExample: `# Create a list
fruits = ["apple", "banana", "cherry"]

# Access items by index
print(fruits[0])  # apple
print(fruits[1])  # banana

# Add an item
fruits.append("date")
print(len(fruits))  # 4`,
    commonMistakes: [
      { mistake: 'Index out of range', tip: 'Remember: indices go from 0 to length-1' },
      { mistake: 'Using wrong bracket type', tip: 'Use [] for arrays/lists, not () or {}' },
      { mistake: 'Modifying list during iteration', tip: 'Create a copy of the list if you need to change it while looping' },
    ],
    practice: 'Create a list of 3 colors and print each one using a loop.',
  },

  conditions: {
    title: 'Understanding Conditions',
    icon: '🔀',
    duration: '3 min read',
    explanation: 'Conditions let your program make decisions. Using if/else, your code can take different paths depending on whether something is true or false.',
    analogy: '🚦 Think of conditions like a traffic light. If the light is green → go. Else if yellow → slow down. Else → stop. Your program follows similar decision-making.',
    visualSteps: [
      { label: 'Set value', detail: 'age = 18', icon: '📝' },
      { label: 'Check condition', detail: 'Is age >= 18?', icon: '❓' },
      { label: 'Result', detail: 'Yes → True ✓', icon: '✅' },
      { label: 'Execute if block', detail: 'print("You can vote")', icon: '⚡' },
      { label: 'Skip else', detail: 'else block is skipped', icon: '⏭️' },
    ],
    codeExample: `age = 18

if age >= 18:
    print("You can vote")
elif age >= 16:
    print("Almost there!")
else:
    print("Not yet eligible")`,
    commonMistakes: [
      { mistake: 'Using = instead of ==', tip: '= assigns a value, == compares values' },
      { mistake: 'Missing colon after if/else', tip: 'Always end if, elif, else lines with :' },
      { mistake: 'Wrong indentation in blocks', tip: 'Code inside if/else must be indented' },
    ],
    practice: 'Write a program that checks if a number is positive, negative, or zero.',
  },

  classes: {
    title: 'Understanding Classes & Objects',
    icon: '🏗️',
    duration: '5 min read',
    explanation: 'A class is a blueprint for creating objects. An object is a specific instance created from that blueprint. Classes bundle data (attributes) and actions (methods) together.',
    analogy: '🏠 A class is like a house blueprint. The blueprint describes what a house should have (rooms, doors). Each actual house built from that blueprint is an "object" — same design, but each house can have different colors, furniture, etc.',
    visualSteps: [
      { label: 'Define class', detail: 'class Dog:', icon: '📐' },
      { label: 'Constructor', detail: 'def __init__(self, name):', icon: '🔧' },
      { label: 'Store attribute', detail: 'self.name = name', icon: '💾' },
      { label: 'Add method', detail: 'def bark(self): ...', icon: '📦' },
      { label: 'Create object', detail: 'my_dog = Dog("Rex")', icon: '🐕' },
      { label: 'Use attribute', detail: 'my_dog.name → "Rex"', icon: '📖' },
      { label: 'Call method', detail: 'my_dog.bark() → "Woof!"', icon: '🔊' },
    ],
    codeExample: `class Dog:
    def __init__(self, name):
        self.name = name

    def bark(self):
        return f"{self.name} says Woof!"

my_dog = Dog("Rex")
print(my_dog.bark())
# Output: Rex says Woof!`,
    commonMistakes: [
      { mistake: 'Forgetting self parameter', tip: 'Every method in a class needs self as first parameter' },
      { mistake: 'Missing __init__ method', tip: 'Use __init__ to set up object attributes' },
      { mistake: 'Calling class without parentheses', tip: 'Use Dog("Rex"), not Dog "Rex"' },
    ],
    practice: 'Create a class called "Car" with a brand attribute and a method that prints "Driving [brand]".',
  },

  recursion: {
    title: 'Understanding Recursion',
    icon: '🪞',
    duration: '5 min read',
    explanation: 'Recursion is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs a "base case" — a condition that stops the recursion.',
    analogy: '🪆 Think of Russian nesting dolls. Each doll contains a smaller doll inside, until you reach the smallest one (the base case). Recursion works the same way — each call handles a smaller piece until reaching the simplest case.',
    visualSteps: [
      { label: 'Call factorial(4)', detail: '4 × factorial(3)', icon: '📞' },
      { label: 'Call factorial(3)', detail: '3 × factorial(2)', icon: '📞' },
      { label: 'Call factorial(2)', detail: '2 × factorial(1)', icon: '📞' },
      { label: 'Base case!', detail: 'factorial(1) → returns 1', icon: '🏁' },
      { label: 'Unwind', detail: '2 × 1 = 2', icon: '⬆️' },
      { label: 'Unwind', detail: '3 × 2 = 6', icon: '⬆️' },
      { label: 'Unwind', detail: '4 × 6 = 24', icon: '⬆️' },
      { label: 'Final result', detail: 'factorial(4) = 24', icon: '✅' },
    ],
    codeExample: `def factorial(n):
    if n <= 1:       # Base case
        return 1
    return n * factorial(n - 1)  # Recursive call

print(factorial(4))  # 24`,
    commonMistakes: [
      { mistake: 'Missing base case', tip: 'Always define when to stop calling itself' },
      { mistake: 'Base case never reached', tip: 'Make sure each call moves closer to the base case' },
      { mistake: 'Stack overflow from too many calls', tip: 'Consider if a loop would be simpler for large inputs' },
    ],
    practice: 'Write a recursive function that counts down from N to 1.',
  },

  pointers: {
    title: 'Understanding Pointers & References',
    icon: '📍',
    duration: '5 min read',
    explanation: 'A pointer is a variable that stores the memory address of another variable, rather than a value itself. It "points to" where data is stored in memory.',
    analogy: '📬 Think of a pointer like a piece of paper with an address written on it. The paper itself isn\'t the house — it just tells you where to find the house. Dereferencing is like going to that address to see what\'s there.',
    visualSteps: [
      { label: 'Declare variable', detail: 'int x = 42;', icon: '📝' },
      { label: 'Memory', detail: 'Address 0x100 holds value 42', icon: '💾' },
      { label: 'Create pointer', detail: 'int *p = &x;', icon: '📍' },
      { label: 'Pointer value', detail: 'p holds 0x100 (address of x)', icon: '🔗' },
      { label: 'Dereference', detail: '*p → 42 (value at address)', icon: '📖' },
      { label: 'Modify via pointer', detail: '*p = 99; → x is now 99', icon: '✏️' },
    ],
    codeExample: `#include <stdio.h>

int main() {
    int x = 42;
    int *p = &x;    // p points to x

    printf("%d\\n", *p);  // 42
    *p = 99;             // changes x
    printf("%d\\n", x);   // 99
    return 0;
}`,
    commonMistakes: [
      { mistake: 'Using uninitialized pointer', tip: 'Always initialize pointers before use' },
      { mistake: 'Forgetting to dereference', tip: 'Use *p to get the value, p gives the address' },
      { mistake: 'Memory leaks', tip: 'Always free() memory allocated with malloc()' },
    ],
    practice: 'Create an int variable, point to it with a pointer, and change its value through the pointer.',
  },

  strings: {
    title: 'Understanding Strings',
    icon: '📝',
    duration: '3 min read',
    explanation: 'A string is a sequence of characters (letters, numbers, symbols) enclosed in quotes. Strings are one of the most commonly used data types in programming.',
    analogy: '📿 Think of a string like a necklace of beads. Each bead is a character, and they\'re strung together in order. You can count the beads (length), look at specific beads (indexing), or add more beads (concatenation).',
    visualSteps: [
      { label: 'Create string', detail: 'name = "Hello"', icon: '📝' },
      { label: 'Index 0', detail: 'name[0] → "H"', icon: '0️⃣' },
      { label: 'Index 4', detail: 'name[4] → "o"', icon: '4️⃣' },
      { label: 'Length', detail: 'len(name) → 5', icon: '📏' },
      { label: 'Concatenate', detail: '"Hello" + " World"', icon: '🔗' },
      { label: 'Result', detail: '"Hello World"', icon: '✅' },
    ],
    codeExample: `name = "Hello"
print(name[0])      # H
print(len(name))    # 5
print(name + " World")  # Hello World
print(name.upper())     # HELLO`,
    commonMistakes: [
      { mistake: 'Index out of range', tip: 'String indices go from 0 to length-1' },
      { mistake: 'Strings are immutable', tip: 'You can\'t change a character in place — create a new string instead' },
      { mistake: 'Mixing quotes inconsistently', tip: 'Use matching quotes: "..." or \'...\'' },
    ],
    practice: 'Create a string with your name and print each character using a loop.',
  },

  types: {
    title: 'Understanding Data Types',
    icon: '🏷️',
    duration: '3 min read',
    explanation: 'Data types tell the computer what kind of value a variable holds: numbers, text, true/false, etc. Using the right type helps prevent errors and confusion.',
    analogy: '🗂️ Think of data types like different containers. You wouldn\'t put soup in a paper bag or a letter in a glass. Each type of data needs the right "container" to work properly.',
    visualSteps: [
      { label: 'Integer', detail: 'age = 25 (whole number)', icon: '🔢' },
      { label: 'Float', detail: 'price = 9.99 (decimal)', icon: '💲' },
      { label: 'String', detail: 'name = "Alex" (text)', icon: '📝' },
      { label: 'Boolean', detail: 'active = True (yes/no)', icon: '✅' },
      { label: 'List', detail: 'items = [1, 2, 3] (collection)', icon: '📋' },
    ],
    codeExample: `# Different data types
age = 25          # int
price = 9.99      # float
name = "Alex"     # string
active = True     # boolean

# Type checking
print(type(age))    # <class 'int'>
print(type(name))   # <class 'str'>`,
    commonMistakes: [
      { mistake: 'Adding string to number', tip: 'Convert types first: str(25) or int("25")' },
      { mistake: 'Integer division surprise', tip: 'In Python 3, 7/2 = 3.5, use 7//2 for 3' },
      { mistake: 'Comparing different types', tip: 'Make sure both sides of == are the same type' },
    ],
    practice: 'Create variables of 4 different types and print their types using type().',
  },

  syntax: {
    title: 'Understanding Syntax Rules',
    icon: '📐',
    duration: '3 min read',
    explanation: 'Syntax is the set of rules that define how code must be written for the computer to understand it. Like grammar in English, syntax ensures your code makes sense to the compiler or interpreter.',
    analogy: '📖 Think of syntax like the grammar of a language. "I go store" has the right words but wrong grammar. Similarly, code needs correct syntax — the right symbols in the right places — for the computer to understand it.',
    visualSteps: [
      { label: 'Correct', detail: 'print("hello")', icon: '✅' },
      { label: 'Missing quotes', detail: 'print(hello) → NameError', icon: '❌' },
      { label: 'Correct', detail: 'if x > 5:', icon: '✅' },
      { label: 'Missing colon', detail: 'if x > 5  → SyntaxError', icon: '❌' },
      { label: 'Correct', detail: 'for i in range(5):', icon: '✅' },
      { label: 'Missing parens', detail: 'for i in range 5: → Error', icon: '❌' },
    ],
    codeExample: `# Correct syntax
if True:
    print("Hello")

# Common syntax patterns:
# - Colons after if/for/while/def
# - Matching brackets () [] {}
# - Proper indentation
# - Semicolons in C/Java/JS`,
    commonMistakes: [
      { mistake: 'Missing closing bracket', tip: 'Every ( needs ), every [ needs ], every { needs }' },
      { mistake: 'Wrong indentation', tip: 'Use consistent spaces (4 is standard for Python)' },
      { mistake: 'Missing semicolons (C/Java/JS)', tip: 'End each statement with ; in these languages' },
    ],
    practice: 'Write a small program with an if-else statement and make sure all syntax is correct.',
  },
};

/**
 * Get concept help content for a topic.
 */
export function getConceptHelp(topic) {
  return CONCEPT_LIBRARY[topic] || null;
}

/**
 * Get all available concept topics.
 */
export function getAvailableTopics() {
  return Object.entries(CONCEPT_LIBRARY).map(([key, value]) => ({
    key,
    title: value.title,
    icon: value.icon,
    duration: value.duration,
  }));
}

/**
 * Check if a topic has concept help available.
 */
export function hasConceptHelp(topic) {
  return topic in CONCEPT_LIBRARY;
}
