
import { createWalletClient, http, publicActions, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { scroll } from "viem/chains";

const WETH_CONTRACT_ADDRESS = "0x5300000000000000000000000000000000000004";

export async function wrapEth(
    privateKey: string,
    amountEth: string = "0.0001" // Very small amount by default
) {
    // 1. Setup Account & Client
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    const client = createWalletClient({
        account,
        chain: scroll,
        transport: http(),
    }).extend(publicActions);

    console.log(`  > Action: Wrapping ${amountEth} ETH on Scroll...`);
    console.log(`  > Wallet: ${account.address}`);

    // 2. Check Balance
    const balance = await client.getBalance({ address: account.address });
    const amountWei = parseEther(amountEth);

    if (balance < amountWei) {
        throw new Error(`Insufficient ETH balance. Have: ${balance}, Need: ${amountWei}`);
    }

    // 3. Send Transaction (Direct send to WETH contract)
    // WETH usually wraps ETH sent directly to it via receive() or deposit()
    // "deposit" is the standard WETH method.

    const hash = await client.writeContract({
        address: WETH_CONTRACT_ADDRESS,
        abi: [{
            constant: false,
            inputs: [],
            name: "deposit",
            outputs: [],
            payable: true,
            stateMutability: "payable",
            type: "function"
        }],
        functionName: "deposit",
        value: amountWei,
    });

    console.log(`  ⏳ Tx Sent: ${hash}`);

    // 4. Wait for Confirmation
    const receipt = await client.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
        console.log(`  ✅ Success! Wrapped ETH. Gas used: ${receipt.gasUsed}`);
        return hash;
    } else {
        throw new Error("Transaction reverted");
    }
}
