
import { createWalletClient, http, publicActions, parseEther, encodeFunctionData, erc20Abi, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scroll, base, linea, scrollSepolia, baseSepolia, lineaSepolia } from "viem/chains";

// Aave V3 Pool Addresses
const AAVE_POOL_SCROLL = "0x11fCfe75c6F79F6675D6537D3cFfe";
const AAVE_POOL_BASE = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

// WETH Addresses
const WETH_SCROLL = "0x5300000000000000000000000000000000000004";
const WETH_BASE = "0x4200000000000000000000000000000000000006";
const WETH_LINEA = "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f";

// Testnet Pools
const TESTNET_POOLS = {
    "base-sepolia": {
        pool: "0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27",
        weth: "0x4200000000000000000000000000000000000006",
    },
    "scroll-sepolia": {
        pool: "0x48914C788295b5db23aF2b5F0B3BE775C4eA9440",
        weth: "0x5300000000000000000000000000000000000004",
    },
    // Linea Sepolia skipped for now
} as const;

const AAVE_POOL_ABI = [
    {
        inputs: [
            { internalType: "address", name: "asset", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
            { internalType: "address", name: "onBehalfOf", type: "address" },
            { internalType: "uint16", name: "referralCode", type: "uint16" }
        ],
        name: "supply",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
];

export type LendingChain = "scroll" | "base" | "linea" | "scroll-sepolia" | "base-sepolia" | "linea-sepolia";

import { HttpsProxyAgent } from "https-proxy-agent";

export async function supplyWeth(
    privateKey: string,
    chain: LendingChain = "scroll",
    amountEth: string = "0.0001",
    proxyUrl?: string
) {
    // If Linea is requested but we lack a confident pool address, fallback or throw?
    // Let's support Base/Scroll fully for now.
    if (chain === "linea" || chain === "linea-sepolia") {
        console.warn(`Lending on ${chain} temporarily disabled due to address verification.`);
        return;
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    let targetChain: Chain = scroll;
    let poolAddress = AAVE_POOL_SCROLL;
    let wethAddress = WETH_SCROLL;

    if (chain === "base") {
        targetChain = base;
        poolAddress = AAVE_POOL_BASE;
        wethAddress = WETH_BASE;
    } else if (chain === "base-sepolia") {
        targetChain = baseSepolia;
        poolAddress = TESTNET_POOLS["base-sepolia"].pool;
        wethAddress = TESTNET_POOLS["base-sepolia"].weth;
    } else if (chain === "scroll-sepolia") {
        targetChain = scrollSepolia;
        poolAddress = TESTNET_POOLS["scroll-sepolia"].pool;
        wethAddress = TESTNET_POOLS["scroll-sepolia"].weth;
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

    console.log(`  > Action: Supplying ${amountEth} WETH to Aave on ${chain}...`);

    const amountWei = parseEther(amountEth);

    // 1. Check WETH Allowance
    const allowance = await client.readContract({
        address: wethAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account.address, poolAddress as `0x${string}`],
    });

    if (allowance < amountWei) {
        console.log("  🔓 Approving WETH...");
        const { request } = await client.simulateContract({
            address: wethAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [poolAddress as `0x${string}`, amountWei],
            account,
        });
        const hash = await client.writeContract(request);
        await client.waitForTransactionReceipt({ hash });
        console.log("  🔓 Approved!");
    }

    // 2. Supply
    const { request: supplyRequest } = await client.simulateContract({
        address: poolAddress as `0x${string}`,
        abi: AAVE_POOL_ABI,
        functionName: "supply",
        args: [wethAddress as `0x${string}`, amountWei, account.address, 0],
        account,
    });
    const hash = await client.writeContract(supplyRequest);

    console.log(`  ⏳ Tx Sent: ${hash}`);

    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log(`  ✅ Success! Supplied WETH. Gas: ${receipt.gasUsed}`);
        return hash;
    } else {
        throw new Error("Supply Transaction Reverted");
    }
}
