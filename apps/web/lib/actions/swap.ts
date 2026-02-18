import { createWalletClient, http, publicActions, parseEther, encodeFunctionData, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scroll, base, linea, baseSepolia, scrollSepolia, lineaSepolia } from "viem/chains";

// Contract Addresses
const CONTRACTS = {
    scroll: {
        router: "0xfc30937f5cDe93Df8d48aCAF7e6f5D8D8A31F636", // Uniswap V3 (Scroll)
        weth: "0x5300000000000000000000000000000000000004",
        usdc: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
    },
    base: {
        router: "0x2626664c9261c8f33Bf99E656bdEf11f9E21741e481", // Uniswap V3 SwapRouter02
        weth: "0x4200000000000000000000000000000000000006",
        usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
    linea: {
        // Uniswap V3 SwapRouter02 on Linea
        router: "0x3d4e44Eb3553C04415C16335B76aA7e5d7c2a44f",
        weth: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
        usdc: "0x176211869cA2b568f2A7D4EE941E0793b821EE1ff",
    }
} as const;

const TESTNET_CONTRACTS = {
    "base-sepolia": {
        router: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
        weth: "0x4200000000000000000000000000000000000006",
        usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
    "scroll-sepolia": {
        router: "0x17AFD0263D6909Ba1F9a8EAC697f76532365Fb95", // Uniswap V3 Router from example
        weth: "0x5300000000000000000000000000000000000004",
        usdc: "0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D", // Aave Faucet USDC
    },
    "linea-sepolia": {
        router: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
        weth: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f", // Sepolia WETH (often verified on Linea too)
        usdc: "0x176211869cA2b568f2A7D4EE941E0793b821EE1ff", // USDC from docs
    }
} as const;

// Quick ABI for exactInputSingle (Uniswap V3)
const ROUTER_ABI = [
    {
        inputs: [
            {
                components: [
                    { name: "tokenIn", type: "address" },
                    { name: "tokenOut", type: "address" },
                    { name: "fee", type: "uint24" },
                    { name: "recipient", type: "address" },
                    { name: "amountIn", type: "uint256" },
                    { name: "amountOutMinimum", type: "uint256" },
                    { name: "sqrtPriceLimitX96", type: "uint160" },
                ],
                name: "params",
                type: "tuple",
            },
        ],
        name: "exactInputSingle",
        outputs: [{ name: "amountOut", type: "uint256" }],
        stateMutability: "payable",
        type: "function",
    },
];

export type SwapChain = "scroll" | "base" | "linea" | "base-sepolia" | "scroll-sepolia" | "linea-sepolia";

import { HttpsProxyAgent } from "https-proxy-agent";

export async function swapEthToUsdc(
    privateKey: string,
    chain: SwapChain = "scroll",
    amountEth: string = "0.00005", // ~$0.15
    proxyUrl?: string
) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    let targetChain: Chain = scroll;
    // Use a loose type or specific union for addresses to avoid TS mismatch on literal types
    let addresses: { router: string; weth: string; usdc: string } = CONTRACTS.scroll;

    // Mainnet selection
    if (chain === "base") {
        targetChain = base;
        addresses = CONTRACTS.base;
    } else if (chain === "linea") {
        targetChain = linea;
        addresses = CONTRACTS.linea;
    }
    // Testnet selection
    else if (chain === "base-sepolia") {
        targetChain = baseSepolia;
        addresses = TESTNET_CONTRACTS["base-sepolia"];
    } else if (chain === "scroll-sepolia") {
        targetChain = scrollSepolia;
        addresses = TESTNET_CONTRACTS["scroll-sepolia"];
    } else if (chain === "linea-sepolia") {
        targetChain = lineaSepolia;
        addresses = TESTNET_CONTRACTS["linea-sepolia"];
    }

    const client = createWalletClient({
        account,
        chain: targetChain,
        transport: http(undefined, {
            fetchOptions: proxyUrl ? {
                agent: new HttpsProxyAgent(proxyUrl),
            } as any : undefined
        }),
    }).extend(publicActions);

    const client = createWalletClient({
        account,
        chain: targetChain,
        transport: http(),
    }).extend(publicActions);

    console.log(`  > Action: Swapping ${amountEth} ETH -> USDC on ${chain.toUpperCase()}...`);
    console.log(`  > Wallet: ${account.address}`);

    const amountIn = parseEther(amountEth);
    const balance = await client.getBalance({ address: account.address });

    if (balance < amountIn) {
        throw new Error(`Insufficient ETH. Have: ${balance}, Need: ${amountIn}`);
    }

    // Params for exactInputSingle
    const params = {
        tokenIn: addresses.weth,
        tokenOut: addresses.usdc,
        fee: 3000,
        recipient: account.address,
        amountIn: amountIn,
        amountOutMinimum: 0n, // Slippage unchecked for simplicity in bot
        sqrtPriceLimitX96: 0n,
    };

    const { request } = await client.simulateContract({
        address: addresses.router as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [params],
        value: amountIn, // Sending ETH with the call
        account,
    });

    const hash = await client.writeContract(request);
    console.log(`  ⏳ Tx Sent: ${hash}`);

    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log(`  ✅ Success! Swapped ETH -> USDC. Gas: ${receipt.gasUsed}`);
        return hash;
    } else {
        throw new Error("Swap Reverted");
    }
}
