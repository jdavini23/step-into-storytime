import { StripeAgentToolkit } from "@stripe/agent-toolkit/modelcontextprotocol";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new StripeAgentToolkit({
    secretKey: "YOUR_STRIPE_SECRET_KEY",
    configuration: {
        actions: {
            paymentLinks: {
                create: true,
            },
            products: {
                create: true,
            },
            prices: {
                create: true,
            },
        },
    },
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Stripe MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});

console.warn("Remember to set the STRIPE_SECRET_KEY environment variable.");
