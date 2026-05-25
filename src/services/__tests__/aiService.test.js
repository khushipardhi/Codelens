import { describe, it, expect } from 'vitest';
import { generateStepByStep } from '../aiService';

describe('Local Step-by-Step Generator', () => {
  it('correctly explains blank lines and comments', async () => {
    const code = '# This is a comment\n\nprint("hello")';
    const steps = await generateStepByStep(code, 'Python', null, {}, 'offline', null);
    
    // We expect empty lines to be filtered out (trimmed out) or returned
    // Let's inspect what is returned for comment and print
    expect(steps.length).toBe(2);
    
    expect(steps[0].code).toBe('# This is a comment');
    expect(steps[0].description).toContain('Comment');
    expect(steps[0].description).toContain('documentation');

    expect(steps[1].code).toBe('print("hello")');
    expect(steps[1].description).toContain('Outputs information');
  });

  it('detects variable assignments in Python and JS/TS', async () => {
    const pythonCode = 'x = 42\nname = "Alice"';
    const pySteps = await generateStepByStep(pythonCode, 'Python', null, {}, 'offline', null);
    expect(pySteps[0].variables).toBe("Declares or updates 'x' to: 42");
    expect(pySteps[1].variables).toBe("Declares or updates 'name' to: \"Alice\"");

    const jsCode = 'let score = 100;\nconst active = true;';
    const jsSteps = await generateStepByStep(jsCode, 'JavaScript', null, {}, 'offline', null);
    expect(jsSteps[0].variables).toBe("Declares or updates 'score' to: 100");
    expect(jsSteps[1].variables).toBe("Declares or updates 'active' to: true");
  });

  it('detects function declarations', async () => {
    const code = 'def add(a, b):\n    return a + b';
    const steps = await generateStepByStep(code, 'Python', null, {}, 'offline', null);
    expect(steps[0].description).toBe("Defines a function named 'add' taking parameters: a, b.");
    expect(steps[1].description).toBe("Exits the current function and returns a value.");
    expect(steps[1].variables).toBe("Returns value/expression: a + b");
  });

  it('maps syntax errors from analysis results to lines', async () => {
    const code = 'def broken_func()\n    pass';
    const fakeAnalysis = {
      fixes: [
        {
          lineNumber: 1,
          errorName: 'Missing colon',
          simple: 'You forgot a colon at the end of the def statement.',
          fix: 'Add a `:` at the end of line 1, e.g. `def broken_func():`',
          why: 'Python syntax requires a colon to begin a block.'
        }
      ]
    };
    const steps = await generateStepByStep(code, 'Python', null, {}, 'offline', fakeAnalysis);
    expect(steps[0].mistake).toBe('You forgot a colon at the end of the def statement.');
    expect(steps[0].why).toBe('Python syntax requires a colon to begin a block.');
    expect(steps[0].corrected).toBe('def broken_func():');
  });
});
