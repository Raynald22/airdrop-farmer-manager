
import { createWalletClient, http, publicActions, parseEther, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scroll } from "viem/chains";

// Scroll Addresses
const SWAP_ROUTER_02 = "0xfc30937f5cDe93Df8d48aCAF7e6f5D8D8A31F636";
const WETH = "0x5300000000000000000000000000000000000004";
const USDC = "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4";

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

export async function swapEthToUsdc(
    privateKey: string,
    amountEth: string = "0.00005" // ~$0.15
) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const client = createWalletClient({
        account,
        chain: scroll,
        transport: http(),
    }).extend(publicActions);

    console.log(`  > Action: Swapping ${amountEth} ETH -> USDC on Scroll...`);
    console.log(`  > Wallet: ${account.address}`);

    const amountIn = parseEther(amountEth);
    const balance = await client.getBalance({ address: account.address });

    if (balance < amountIn) {
        throw new Error(`Insufficient ETH. Have: ${balance}, Need: ${amountIn}`);
    }

    // Params for exactInputSingle
    // tokenIn: WETH (if sending ETH value, Router wraps it automatically)
    // tokenOut: USDC
    // fee: 3000 (0.3% pool usually exists)
    const params = {
        tokenIn: WETH,
        tokenOut: USDC,
        fee: 3000,
        recipient: account.address,
        amountIn: amountIn,
        amountOutMinimum: 0n, // Slippage unchecked for simplicity in bot
        sqrtPriceLimitX96: 0n,
    };

    const { request } = await client.simulateContract({
        address: SWAP_ROUTER_02,
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
