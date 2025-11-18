import { ToolExecutionResult } from "../types";

export const executeTool = async (
  name: string,
  args: any,
  implementation: string
): Promise<ToolExecutionResult> => {
  console.log(`Executing tool: ${name} with args:`, args);

  try {
    // Create a function from the string implementation.
    // We pass 'args' as a parameter available to the user's code.
    // Warning: 'new Function' has security risks if running untrusted code from external sources.
    // Since this is a client-side playground where the user inputs their own code, it's acceptable for this context.
    const func = new Function('args', implementation);
    
    let result = func(args);

    // Handle async implementations
    if (result instanceof Promise) {
      result = await result;
    }

    return {
      name,
      result
    };
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return {
      name,
      result: {
        error: `Execution failed: ${error.message}`,
        stack: error.stack
      },
      isError: true
    };
  }
};
