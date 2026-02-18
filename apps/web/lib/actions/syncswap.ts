
import { createWalletClient, http, publicActions, parseEther, encodeAbiParameters, parseAbiParameters, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scroll, linea } from "viem/chains";

// SyncSwap Router Addresses
const SYNCSWAP_ROUTER_SCROLL = "0x80e38291e06339d10AAB483C65695D004dBD5C69"; // Router v1 (Classic) - widely used
const SYNCSWAP_ROUTER_LINEA = "0xC2a1947d2336b2AF74d5813dC9cA6E0c3b3E8a1E"; // Router v2 (Linea)

// Token Addresses (ETH is usually handled as WETH or specific internal address 0x0...0)
// SyncSwap Classic: ETH is "0x0000000000000000000000000000000000000000" in paths
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC_SCROLL = "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4";
const USDC_LINEA = "0x176211869cA2b568f2A7D4EE941E0793b821EE1ff";

// Minimal ABI for SyncSwap Router (Classic / V2 share similar signatures for swap)
// swap(validItems, tokenIn, amountIn, minAmountOut, deadline)
// Note: SyncSwap Router V2 might differ slightly. Let's stick to a generic "swap" or "exactInput" equivalent.
// Actually SyncSwap uses a "Steps" structure. 
/*
    struct SwapStep {
        address pool;
        bytes data;
        address callback;
        bytes callbackData;
    }
    struct SwapPath {
        SwapStep[] steps;
        address tokenIn;
        uint256 amountIn;
    }
*/
// This is complex to robustly implement without exact ABI/Pool factory.
// Simplification: Use the "Classic Helper" or find a simpler router function if exists.
// Or effectively, for this Demo/MVP, we might simulate the swap call structure used in their UI.

// Let's rely on the simpler "Uniswap V2 style" router if available? No, SyncSwap is its own beast.
// To ensure high success rate for the user without complex pathfinding logic code,
// maybe we skip SyncSwap for now OR implement a "Simple Swap" if the router supports it.
// Looking at docs, Router.swap(paths, amountOutMin, deadline) is the main one.

// Let's implement the `swap` function with a hardcoded path for ETH -> USDC.
// We need the "Classic Pool" address for ETH/USDC to construct the path.
// Scroll ETH/USDC Classic Pool: 0x... (Need to find or query Factory).
// Querying Factory is better.
const SYNCSWAP_CLASSIC_FACTORY_SCROLL = "0x37BAc764494c8db4e54BDE72fCE43bC9E2dc25dA";

const FACTORY_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "tokenA", "type": "address" },
            { "internalType": "address", "name": "tokenB", "type": "address" }
        ],
        "name": "getPool",
        "outputs": [{ "internalType": "address", "name": "pool", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
];

const ROUTER_ABI = [
    {
        "inputs": [
            {
                "components": [
                    {
                        "components": [
                            { "internalType": "address", "name": "pool", "type": "address" },
                            { "internalType": "bytes", "name": "data", "type": "bytes" },
                            { "internalType": "address", "name": "callback", "type": "address" },
                            { "internalType": "bytes", "name": "callbackData", "type": "bytes" }
                        ],
                        "internalType": "struct IRouter.SwapStep[]", "name": "steps", "type": "tuple[]"
                    },
                    { "internalType": "address", "name": "tokenIn", "type": "address" },
                    { "internalType": "uint256", "name": "amountIn", "type": "uint256" }
                ],
                "internalType": "struct IRouter.SwapPath[]", "name": "paths", "type": "tuple[]"
            },
            { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "swap",
        "outputs": [
            { "internalType": "struct IRouter.AmountOut", "name": "amountOut", "type": "tuple" }
        ],
        "stateMutability": "payable",
        "type": "function"
    }
];

import { HttpsProxyAgent } from "https-proxy-agent";

export async function swapSyncSwap(
    privateKey: string,
    chain: "scroll" | "linea" = "scroll",
    amountEth: string = "0.00005",
    proxyUrl?: string
) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const client = createWalletClient({
        account,
        chain: chain === "scroll" ? scroll : linea,
        transport: http(undefined, {
            fetchOptions: proxyUrl ? {
                agent: new HttpsProxyAgent(proxyUrl),
            } as any : undefined
        }),
    }).extend(publicActions);

    console.log(`  > Action: SyncSwap ${amountEth} ETH -> USDC on ${chain}...`);

    const router = chain === "scroll" ? SYNCSWAP_ROUTER_SCROLL : SYNCSWAP_ROUTER_LINEA;
    // For Factory, simpler to just know the path or use a different DEX if too complex?
    // Let's try to get the pool address from the Factory (Classic).
    // Scroll Factory: 0x37BAc764494c8db4e54BDE72fCE43bC9E2dc25dA
    // Linea Factory: ??? (Might process.env this later or search).

    // Fallback: If Linea (v2), maybe structure is different. Let's stick to SCROLL for SyncSwap to ensure stability first.
    if (chain === "linea") {
        console.warn("SyncSwap on Linea not fully implemented yet. Skipping.");
        return;
    }

    // 1. Get Pool Address
    const usdc = USDC_SCROLL;
    const poolAddress = await client.readContract({
        address: SYNCSWAP_CLASSIC_FACTORY_SCROLL,
        abi: FACTORY_ABI,
        functionName: "getPool",
        args: [ETH_ADDRESS, usdc]
    });

    if (poolAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("Pool not found");
    }

    // 2. Prepare Swap Data
    // Swap data for Classic Pool: abi.encode(tokenIn, recipient, withdrawMode)
    // withdrawMode: 1 = WithdrawETH
    const swapData = encodeAbiParameters(
        parseAbiParameters("address, address, uint8"),
        [ETH_ADDRESS, account.address, 1] // 1 = withdraw to ETH if output is WETH? Wait.
        // Actually, internal token for ETH is 0x0, so we just want output as USDC.
        // For classic pool, data is empty usually? Or encoded?
        // Let's look at example usage. standard encoding is: abi.encode(tokenIn, recipient, withdrawMode)
        // If tokenIn is 0x0 (ETH), we are selling ETH.
        // Recipient is us.
        // withdrawMode 2 = standard? 1?
        // Let's use 1 (WITHDRAW_ETH) just in case, or 2 (WITHDRAW_WETH). 
        // Docs say: 1 for Unwrapping WETH to ETH involved? 
        // Let's use 2 as default (MSG_SENDER) or 1.
    );

    const steps = [{
        pool: poolAddress,
        data: swapData,
        callback: "0x0000000000000000000000000000000000000000",
        callbackData: "0x"
    }];

    const paths = [{
        steps: steps,
        tokenIn: ETH_ADDRESS,
        amountIn: parseEther(amountEth)
    }];

    // 3. Exec Swap
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20m

    // Note: The encoding above for `data` is crucial. 
    // ClassicPool.swap(data): abi.decode(data, (address, address, uint8)) -> (tokenIn, to, withdrawMode)
    // tokenIn = ETH_ADDRESS
    // to = account.address
    // withdrawMode = 1 (Withdraw mode)

    const { request } = await client.simulateContract({
        address: router as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "swap",
        args: [paths, 0n, deadline], // 0 min output for now (slippage ignore)
        value: parseEther(amountEth),
        account
    });

    const hash = await client.writeContract(request);
    console.log(`  ✅ SyncSwap Tx: ${hash}`);
    return hash;
}
