import { MCPTool } from "./types";

export const DEFAULT_TOOLS: MCPTool[] = [
  {
    id: 'weather-tool',
    name: 'get_current_weather',
    description: 'Get the current weather in a given location',
    enabled: true,
    parameters: JSON.stringify({
      type: "OBJECT",
      properties: {
        location: {
          type: "STRING",
          description: "The city and state, e.g. San Francisco, CA"
        },
        unit: {
          type: "STRING",
          enum: ["celsius", "fahrenheit"],
          description: "The temperature unit"
        }
      },
      required: ["location"]
    }, null, 2),
    implementation: `
// Simulated weather fetch
const city = args.location.toLowerCase();
const temp = Math.floor(Math.random() * 30) + 10;
const condition = ['Sunny', 'Cloudy', 'Rainy', 'Windy'][Math.floor(Math.random() * 4)];

return {
  location: args.location,
  temperature: temp,
  unit: args.unit || 'celsius',
  condition: condition,
  note: "This is simulated data from the browser."
};
`
  },
  {
    id: 'calc-tool',
    name: 'calculator',
    description: 'Perform basic mathematical calculations',
    enabled: true,
    parameters: JSON.stringify({
      type: "OBJECT",
      properties: {
        expression: {
          type: "STRING",
          description: "The mathematical expression to evaluate, e.g. '2 + 2' or 'sqrt(16)'"
        }
      },
      required: ["expression"]
    }, null, 2),
    implementation: `
try {
  // Safe-ish evaluation for demo purposes
  // In production, use a math parser library
  const safeEval = new Function('return ' + args.expression);
  const result = safeEval();
  return { expression: args.expression, result: result };
} catch (e) {
  return { error: "Invalid expression" };
}
`
  },
  {
    id: 'stock-tool',
    name: 'get_stock_price',
    description: 'Get the current stock price for a given ticker symbol',
    enabled: false, // Disabled by default to show toggle functionality
    parameters: JSON.stringify({
        type: "OBJECT",
        properties: {
            ticker: {
                type: "STRING",
                description: "The stock ticker symbol, e.g. AAPL, GOOGL"
            }
        },
        required: ["ticker"]
    }, null, 2),
    implementation: `
const price = (Math.random() * 1000).toFixed(2);
return {
    ticker: args.ticker,
    price: parseFloat(price),
    currency: "USD",
    timestamp: new Date().toISOString()
};
`
  }
];
