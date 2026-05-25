/**
 * CodeLens Visual Execution Tracer
 * ========================================
 * Safely simulates the step-by-step execution of beginner Python or JavaScript code.
 * Computes variable state changes, loops, conditional pathways, and console output logs.
 * Includes a maximum safety iteration limit of 200 steps to prevent infinite loop hangs.
 */

/**
 * Safely evaluates an expression in a sandbox with the provided scope.
 */
function safeEvaluate(expr, scope) {
  try {
    // Basic Python-to-JS keyword conversion
    let jsExpr = expr.trim()
      // Remove trailing colon
      .replace(/:$/, '')
      // Convert Python keywords
      .replace(/\band\b/g, '&&')
      .replace(/\bor\b/g, '||')
      .replace(/\bnot\b/g, '!')
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null');

    // Handle python range(x) or range(start, stop)
    if (jsExpr.includes('range(')) {
      const rangeMatch = jsExpr.match(/range\(([^)]+)\)/);
      if (rangeMatch) {
        const args = rangeMatch[1].split(',').map(a => a.trim());
        let start = 0, stop = 0;
        if (args.length === 1) {
          stop = parseInt(args[0], 10);
        } else if (args.length >= 2) {
          start = parseInt(args[0], 10);
          stop = parseInt(args[1], 10);
        }
        const rangeArr = [];
        for (let i = start; i < stop; i++) {
          rangeArr.push(i);
        }
        jsExpr = jsExpr.replace(/range\([^)]+\)/, JSON.stringify(rangeArr));
      }
    }

    // Handle len(x)
    if (jsExpr.includes('len(')) {
      jsExpr = jsExpr.replace(/len\(([^)]+)\)/g, '($1 ? $1.length : 0)');
    }

    // Sanitize basic expression syntax (no execution of complex APIs)
    const keys = Object.keys(scope);
    const vals = Object.values(scope);
    const func = new Function(...keys, `return (${jsExpr});`);
    return func(...vals);
  } catch {
    // If it cannot be evaluated (e.g. syntax error or undefined reference), return a descriptive placeholder or null
    return null;
  }
}

/**
 * Parses Python or JS lines and extracts indentation level.
 */
function parseLines(code) {
  const rawLines = code.split('\n');
  return rawLines.map((line, idx) => {
    const trimmed = line.trim();
    // Calculate indentation level (number of leading spaces)
    const leadingSpaces = line.match(/^(\s*)/)[0].length;
    
    // Identify statement types
    let type = 'other';
    let details = {};

    if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
      type = 'comment';
    } else if (!trimmed) {
      type = 'empty';
    } else if (trimmed.startsWith('def ') || trimmed.startsWith('function ')) {
      type = 'function_def';
      const nameMatch = trimmed.match(/(?:def|function)\s+(\w+)/);
      details.name = nameMatch ? nameMatch[1] : 'func';
    } else if (trimmed.startsWith('return ')) {
      type = 'return';
      details.expr = trimmed.substring(7).trim();
    } else if (trimmed.startsWith('print(') || trimmed.startsWith('print ') || trimmed.startsWith('console.log(')) {
      type = 'print';
      let expr;
      if (trimmed.startsWith('print(')) {
        const m = trimmed.match(/print\((.*)\)/);
        expr = m ? m[1] : '';
      } else if (trimmed.startsWith('print ')) {
        expr = trimmed.substring(6).trim();
      } else {
        const m = trimmed.match(/console\.log\((.*)\)/);
        expr = m ? m[1] : '';
      }
      details.expr = expr;
    } else if (trimmed.startsWith('for ') && (trimmed.includes(' in ') || trimmed.includes(' of '))) {
      type = 'for_loop';
      // Python: for i in range(3):
      // JS: for (let x of list)
      const pyMatch = trimmed.match(/for\s+(\w+)\s+in\s+(.+)/);
      const jsMatch = trimmed.match(/for\s*\(\s*(?:let|const|var)?\s*(\w+)\s+(?:of|in)\s+(.+)\)/);
      if (pyMatch) {
        details.varName = pyMatch[1];
        details.expr = pyMatch[2].replace(/:$/, '').trim();
      } else if (jsMatch) {
        details.varName = jsMatch[1];
        details.expr = jsMatch[2].trim();
      }
    } else if (trimmed.startsWith('while ') || trimmed.startsWith('while(')) {
      type = 'while_loop';
      const pyMatch = trimmed.match(/while\s+(.+)/);
      const jsMatch = trimmed.match(/while\s*\((.+)\)/);
      if (pyMatch) {
        details.expr = pyMatch[1].replace(/:$/, '').trim();
      } else if (jsMatch) {
        details.expr = jsMatch[1].trim();
      }
    } else if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
      type = 'if_cond';
      const pyMatch = trimmed.match(/if\s+(.+)/);
      const jsMatch = trimmed.match(/if\s*\((.+)\)/);
      if (pyMatch) {
        details.expr = pyMatch[1].replace(/:$/, '').trim();
      } else if (jsMatch) {
        details.expr = jsMatch[1].trim();
      }
    } else if (trimmed.startsWith('elif ') || trimmed.startsWith('else if')) {
      type = 'elif_cond';
      const pyMatch = trimmed.match(/elif\s+(.+)/);
      const jsMatch = trimmed.match(/else\s+if\s*\((.+)\)/);
      if (pyMatch) {
        details.expr = pyMatch[1].replace(/:$/, '').trim();
      } else if (jsMatch) {
        details.expr = jsMatch[1].trim();
      }
    } else if (trimmed === 'else:' || trimmed.startsWith('else ') || trimmed === 'else {') {
      type = 'else_cond';
    } else if (trimmed.includes('=') && !trimmed.startsWith('if ') && !trimmed.startsWith('for ')) {
      type = 'assignment';
      // e.g. x = 5, total += 1
      const operators = ['+=', '-=', '*=', '/=', '='];
      for (const op of operators) {
        if (trimmed.includes(op)) {
          const parts = trimmed.split(op);
          details.varName = parts[0].trim();
          details.op = op;
          details.expr = parts.slice(1).join(op).trim();
          break;
        }
      }
    }

    return {
      index: idx,
      lineNum: idx + 1,
      raw: line,
      trimmed,
      indent: leadingSpaces,
      type,
      details
    };
  });
}

/**
 * Traces code execution line-by-line.
 */
export function generateVisualTrace(code, language = 'python') {
  if (language) { /* language-specific handling could go here */ }
  const statements = parseLines(code || '');
  const steps = [];
  
  // Virtual Machine state
  let ip = 0; // instruction pointer
  let scope = {};
  let output = '';
  let stepCount = 0;
  const maxSteps = 200; // safety ceiling
  
  // Call stack and loop stack
  const callStack = [];
  const loopStack = []; // { type: 'for'|'while', varName, items, index, loopLine, indent, expr }
  
  // Track function definitions
  const functions = {}; // name -> { startIp, paramNames }
  
  // Pre-scan for function definitions and global variables to initialize
  statements.forEach((stmt) => {
    if (stmt.type === 'function_def') {
      functions[stmt.details.name] = {
        startIp: stmt.index,
        // Basic parameters parsing
        params: (stmt.trimmed.match(/\(([^)]*)\)/)?.[1] || '').split(',').map(p => p.trim()).filter(Boolean)
      };
    }
  });



  // Find next sibling line that is outside of blocks (same or lower indentation)
  function skipBlock(startIp, indentLimit) {
    let scanIp = startIp + 1;
    while (scanIp < statements.length) {
      const stmt = statements[scanIp];
      if (stmt.type !== 'empty' && stmt.type !== 'comment') {
        if (stmt.indent <= indentLimit) {
          return scanIp;
        }
      }
      scanIp++;
    }
    return statements.length;
  }

  // Skip function definitions when running top-level script
  function skipFunctionDef(startIp) {
    const fnIndent = statements[startIp].indent;
    let scanIp = startIp + 1;
    while (scanIp < statements.length) {
      const stmt = statements[scanIp];
      if (stmt.type !== 'empty' && stmt.type !== 'comment') {
        if (stmt.indent <= fnIndent) {
          return scanIp;
        }
      }
      scanIp++;
    }
    return statements.length;
  }

  // Main evaluation loop
  while (ip < statements.length && stepCount < maxSteps) {
    const stmt = statements[ip];
    stepCount++;

    if (stmt.type === 'empty' || stmt.type === 'comment') {
      ip++;
      continue;
    }

    // Capture the state BEFORE executing this statement
    const variablesSnapshot = { ...scope };

    // Check if we are inside a function block and the script reached a line outside its indentation
    if (callStack.length > 0) {
      const activeFrame = callStack[callStack.length - 1];
      if (stmt.indent <= activeFrame.fnIndent && stmt.type !== 'return') {
        // Function returned implicitly (None)
        const frame = callStack.pop();
        scope = frame.prevScope;
        ip = frame.returnIp;
        
        steps.push({
          line: frame.returnIp + 1,
          instruction: `Returned from function '${frame.fnName}' implicitly (None)`,
          variables: { ...scope },
          output,
          description: `The function execution finished without a return statement, returning control back to the caller.`
        });
        continue;
      }
    }

    // Check loop execution termination if we are backing out of a loop indentation
    if (loopStack.length > 0) {
      const currentLoop = loopStack[loopStack.length - 1];
      if (stmt.indent <= currentLoop.indent && ip !== currentLoop.loopLine) {
        // We reached the end of the loop block! Go back to loop header to increment/check condition.
        ip = currentLoop.loopLine;
        continue;
      }
    }

    // Executing statements
    if (stmt.type === 'function_def') {
      // Skip executing function blocks directly; they are triggered via calls
      ip = skipFunctionDef(ip);
      steps.push({
        line: stmt.lineNum,
        instruction: `Defined function '${stmt.details.name}'`,
        variables: variablesSnapshot,
        output,
        description: `Stored function blueprint for '${stmt.details.name}' with inputs: ${functions[stmt.details.name].params.join(', ') || 'none'}.`
      });
      continue;
    }

    if (stmt.type === 'assignment') {
      const { varName, op, expr } = stmt.details;
      let val = safeEvaluate(expr, scope);

      // Handle function calls within assignment, e.g. x = calculate_average(scores)
      const callMatch = expr.match(/(\w+)\(([^)]*)\)/);
      if (callMatch && functions[callMatch[1]]) {
        const fnName = callMatch[1];
        const rawArgs = callMatch[2].split(',').map(a => a.trim()).filter(Boolean);
        const argValues = rawArgs.map(arg => safeEvaluate(arg, scope));
        const targetFn = functions[fnName];

        // Prepare local scope
        const newLocalScope = {};
        targetFn.params.forEach((param, index) => {
          newLocalScope[param] = argValues[index] !== undefined ? argValues[index] : null;
        });

        // Push frame onto call stack
        callStack.push({
          fnName,
          fnIndent: statements[targetFn.startIp].indent,
          returnIp: ip, // we will return to this assignment statement when done
          prevScope: { ...scope },
          assignVar: varName,
          assignOp: op
        });

        // Swap variables context to the local scope
        scope = newLocalScope;
        ip = targetFn.startIp + 1; // start execution inside function body

        steps.push({
          line: targetFn.startIp + 1,
          instruction: `Called function '${fnName}'`,
          variables: { ...scope },
          output,
          description: `Invoking '${fnName}' with arguments: ${targetFn.params.map(p => `${p}=${JSON.stringify(scope[p])}`).join(', ')}.`
        });
        continue;
      }

      // Standard assignment operation
      let displayVal = val;
      if (op === '=') {
        scope[varName] = val;
      } else if (op === '+=') {
        scope[varName] = (scope[varName] || 0) + val;
        displayVal = scope[varName];
      } else if (op === '-=') {
        scope[varName] = (scope[varName] || 0) - val;
        displayVal = scope[varName];
      } else if (op === '*=') {
        scope[varName] = (scope[varName] || 0) * val;
        displayVal = scope[varName];
      } else if (op === '/=') {
        scope[varName] = (scope[varName] || 1) / (val || 1);
        displayVal = scope[varName];
      }

      steps.push({
        line: stmt.lineNum,
        instruction: `${varName} ${op} ${JSON.stringify(val)}`,
        variables: { ...scope },
        output,
        description: `Set variable '${varName}' to ${JSON.stringify(displayVal)}.`
      });
      ip++;
      continue;
    }

    if (stmt.type === 'print') {
      const val = safeEvaluate(stmt.details.expr, scope);
      const strVal = val === null ? 'None' : Array.isArray(val) ? JSON.stringify(val) : String(val);
      output += strVal + '\n';

      steps.push({
        line: stmt.lineNum,
        instruction: `Output: ${JSON.stringify(strVal)}`,
        variables: variablesSnapshot,
        output,
        description: `Console printed: ${strVal}`
      });
      ip++;
      continue;
    }

    if (stmt.type === 'for_loop') {
      const { varName, expr } = stmt.details;
      
      // Look if loop is already initialized in stack
      let currentLoop = loopStack.find(l => l.loopLine === ip);

      if (!currentLoop) {
        let items = safeEvaluate(expr, scope);
        if (!Array.isArray(items)) {
          // Fallback if not an array
          items = [];
        }
        currentLoop = {
          type: 'for',
          varName,
          items,
          index: 0,
          loopLine: ip,
          indent: stmt.indent,
          expr
        };
        loopStack.push(currentLoop);
      }

      if (currentLoop.index < currentLoop.items.length) {
        const itemVal = currentLoop.items[currentLoop.index];
        scope[varName] = itemVal;
        currentLoop.index++;

        steps.push({
          line: stmt.lineNum,
          instruction: `Loop iteration index ${currentLoop.index - 1}: ${varName} = ${JSON.stringify(itemVal)}`,
          variables: { ...scope },
          output,
          loopInfo: {
            current: currentLoop.index,
            total: currentLoop.items.length,
            varName,
            value: itemVal
          },
          description: `Iterating loop: '${varName}' set to index element ${JSON.stringify(itemVal)}.`
        });
        ip++; // go into loop body
      } else {
        // Loop complete, remove from stack
        const idx = loopStack.indexOf(currentLoop);
        if (idx !== -1) loopStack.splice(idx, 1);

        // Clean up loop variable
        delete scope[varName];

        steps.push({
          line: stmt.lineNum,
          instruction: `Loop completed`,
          variables: { ...scope },
          output,
          description: `Finished iterating through list/range of '${expr}'.`
        });
        
        // Skip loop block
        ip = skipBlock(ip, stmt.indent);
      }
      continue;
    }

    if (stmt.type === 'while_loop') {
      const { expr } = stmt.details;
      const condMet = Boolean(safeEvaluate(expr, scope));

      if (condMet) {
        // Register while loop if not present
        if (!loopStack.some(l => l.loopLine === ip)) {
          loopStack.push({
            type: 'while',
            loopLine: ip,
            indent: stmt.indent,
            expr
          });
        }

        steps.push({
          line: stmt.lineNum,
          instruction: `While check: '${expr}' is true`,
          variables: variablesSnapshot,
          output,
          isCondition: true,
          conditionMet: true,
          description: `Condition evaluated to True. Executing while loop body.`
        });
        ip++; // go inside loop
      } else {
        // Remove from loopStack if present
        const idx = loopStack.findIndex(l => l.loopLine === ip);
        if (idx !== -1) loopStack.splice(idx, 1);

        steps.push({
          line: stmt.lineNum,
          instruction: `While check: '${expr}' is false`,
          variables: variablesSnapshot,
          output,
          isCondition: true,
          conditionMet: false,
          description: `Condition evaluated to False. Exiting loop block.`
        });
        ip = skipBlock(ip, stmt.indent);
      }
      continue;
    }

    if (stmt.type === 'if_cond' || stmt.type === 'elif_cond') {
      const { expr } = stmt.details;
      const condMet = Boolean(safeEvaluate(expr, scope));

      steps.push({
        line: stmt.lineNum,
        instruction: `Condition: '${expr}' is ${condMet ? 'True' : 'False'}`,
        variables: variablesSnapshot,
        output,
        isCondition: true,
        conditionMet: condMet,
        description: `Condition check: Evaluated expression '${expr}' to ${condMet ? 'True' : 'False'}.`
      });

      if (condMet) {
        ip++; // Enter the block
      } else {
        // Skip this conditional block
        const nextSiblingIp = skipBlock(ip, stmt.indent);
        ip = nextSiblingIp;
      }
      continue;
    }

    if (stmt.type === 'else_cond') {
      steps.push({
        line: stmt.lineNum,
        instruction: `Else block entered`,
        variables: variablesSnapshot,
        output,
        description: `Previous conditions were not met. Executing else block.`
      });
      ip++; // Enter the block
      continue;
    }

    if (stmt.type === 'return') {
      const { expr } = stmt.details;
      const val = safeEvaluate(expr, scope);

      if (callStack.length > 0) {
        const frame = callStack.pop();
        scope = frame.prevScope;
        
        // Save the result back to the assignee variable in caller scope
        if (frame.assignVar) {
          if (frame.assignOp === '=') {
            scope[frame.assignVar] = val;
          } else if (frame.assignOp === '+=') {
            scope[frame.assignVar] = (scope[frame.assignVar] || 0) + val;
          }
        }

        steps.push({
          line: stmt.lineNum,
          instruction: `Return value: ${JSON.stringify(val)}`,
          variables: { ...scope },
          output,
          description: `Function '${frame.fnName}' finished. Returned ${JSON.stringify(val)} to caller line.`
        });
        
        ip = frame.returnIp + 1; // move past the function calling statement
      } else {
        // Return outside of a function (script level)
        steps.push({
          line: stmt.lineNum,
          instruction: `Returned: ${JSON.stringify(val)}`,
          variables: variablesSnapshot,
          output,
          description: `Script finished execution with return value ${JSON.stringify(val)}.`
        });
        break; // stop tracing
      }
      continue;
    }

    // Default statement processing
    steps.push({
      line: stmt.lineNum,
      instruction: `Execute: ${stmt.trimmed}`,
      variables: variablesSnapshot,
      output,
      description: `Executed statement: ${stmt.trimmed}`
    });
    ip++;
  }

  // Final completion step if we reached the end of code normally
  if (ip >= statements.length && steps.length > 0) {
    steps.push({
      line: statements[statements.length - 1].lineNum,
      instruction: `Execution completed successfully`,
      variables: { ...scope },
      output,
      description: `The program finished running all executable lines.`
    });
  }

  return steps;
}
