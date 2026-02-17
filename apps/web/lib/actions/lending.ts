
import { createWalletClient, http, publicActions, parseEther, encodeFunctionData, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scroll, base } from "viem/chains";

// Aave V3 Pool Addresses
const AAVE_POOL_SCROLL = "0x11fCfe75c6F79F6675D6537D3cFfe";
const AAVE_POOL_BASE = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

// WETH Addresses
const WETH_SCROLL = "0x5300000000000000000000000000000000000004";
const WETH_BASE = "0x4200000000000000000000000000000000000006";

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

export async function supplyWeth(
    privateKey: string,
    chain: "scroll" | "base" = "scroll",
    amountEth: string = "0.0001"
) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const targetChain = chain === "scroll" ? scroll : base;
    const poolAddress = chain === "scroll" ? AAVE_POOL_SCROLL : AAVE_POOL_BASE;
    const wethAddress = chain === "scroll" ? WETH_SCROLL : WETH_BASE;

    const client = createWalletClient({
        account,
        chain: targetChain,
        transport: http(),
    }).extend(publicActions);

    console.log(`  > Action: Supplying ${amountEth} WETH to Aave on ${chain}...`);

    const amountWei = parseEther(amountEth);

    // 1. Check WETH Allowance
    const allowance = await client.readContract({
        address: wethAddress,
        abi: erc20Abi,
        functionName: "allowance",
        args: [account.address, poolAddress],
    });

    if (allowance < amountWei) {
        console.log("  > Approving WETH...");
        const hash = await client.writeContract({
            address: wethAddress,
            abi: erc20Abi,
            functionName: "approve",
            args: [poolAddress, amountWei * 10n], // Approve 10x to save gas later
        });
        await client.waitForTransactionReceipt({ hash });
        console.log("  > Approved.");
    }

    // 2. Supply
    const hash = await client.writeContract({
        address: poolAddress,
        abi: AAVE_POOL_ABI,
        functionName: "supply",
        args: [wethAddress, amountWei, account.address, 0],
    });

    console.log(`  ⏳ Tx Sent: ${hash}`);

    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log(`  ✅ Success! Supplied WETH. Gas: ${receipt.gasUsed}`);
        return hash;
    } else {
        throw new Error("Supply Transaction Reverted");
    }
}
