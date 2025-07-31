"use client";

import InputField from "@/components/ui/InputField";
import { useState, useMemo, useEffect } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import {
  useChainId,
  useConfig,
  useAccount,
  useWriteContract,
  useReadContracts,
  useWaitForTransactionReceipt,
} from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { calculateTotal, formatTokenAmount } from "@/utils";

import { CgSpinner } from "react-icons/cg";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const total: number = useMemo(() => {
    return calculateTotal(amounts);
  }, [amounts]);

  // Get dynamic data using wagmi hooks
  const account = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const {
    data: hash,
    isPending,
    error,
    writeContractAsync,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
  } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
  });

  const tSenderAddress: string = useMemo(() => {
    return chainsToTSender[chainId]?.tsender;
  }, [chainId]);

  useEffect(() => {
    const savedTokenAddress = localStorage.getItem("tokenAddress");
    const savedRecipients = localStorage.getItem("recipients");
    const savedAmounts = localStorage.getItem("amounts");
    if (savedTokenAddress) setTokenAddress(savedTokenAddress);
    if (savedRecipients) setRecipients(savedRecipients);
    if (savedAmounts) setAmounts(savedAmounts);
  }, []);

  useEffect(() => {
    localStorage.setItem("tokenAddress", tokenAddress);
    localStorage.setItem("recipients", recipients);
    localStorage.setItem("amounts", amounts);
  }, [tokenAddress, recipients, amounts]);

  const { data: tokenDetails, isLoading: isLoadingTokenDetails } =
    useReadContracts({
      contracts: [
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "name",
        },
        {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "decimals",
        },
      ],
    });

  const tokenName =
    tokenDetails?.[0]?.status === "success" ? tokenDetails[0].result : null;
  const tokenDecimals =
    tokenDetails?.[1]?.status === "success" ? tokenDetails[1].result : null;

  console.log(`tokenName: ${tokenName}  tokenDecimals: ${tokenDecimals}`);

  async function handleSubmit() {
    // You can access the current state values here
    console.log("Token Address:", tokenAddress);
    console.log("Recipients:", recipients);
    console.log("Amounts:", amounts);

    // const tSenderAddress = chainsToTSender[chainId]?.tsender;
    console.log("Current Chain ID:", chainId);
    console.log("TSender Address for this chain:", tSenderAddress);

    const approvedAmount = await getApprovedAmount();

    if (approvedAmount < total) {
      try {
        const approveHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(total)],
        });
        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approveHash,
        });

        if (approvalReceipt.status === "success") {
          console.log("Approval successful, proceeding to airdrop.");
          await executeAirdrop(); // Call airdrop AFTER successful approval
        } else {
          console.error("Approval transaction failed.");
          // Handle UI feedback
        }
      } catch (err) {
        console.error("Approval process error:", err);
        // Handle UI feedback
      }
    } else {
      console.log("Sufficient allowance, proceeding directly to airdrop.");
      await executeAirdrop(); // Call airdrop directly
    }

    console.log(`approvedAmount is ${approvedAmount}`);
    console.log(`total is ${total}`);
  }

  function getButtonContent() {
    if (isPending)
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <CgSpinner className="animate-spin" size={20} />
          <span>Confirming in wallet...</span>
        </div>
      );
    if (isConfirming)
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <CgSpinner className="animate-spin" size={20} />
          <span>Waiting for transaction to be included...</span>
        </div>
      );
    if (error || isError) {
      console.log(error);
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <span>Error, see console.</span>
        </div>
      );
    }
    if (isConfirmed) {
      return "Transaction confirmed.";
    }
    return "Send Tokens";
  }

  async function getApprovedAmount(): Promise<number> {
    if (!tSenderAddress) {
      alert("No address found, please use a supported chain");
      return 0;
    }
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });
    return response as number;
  }

  async function executeAirdrop() {
    try {
      console.log("Executing airdropERC20...");
      // Prepare arguments - requires parsing user input
      const recipientAddresses = recipients // Assuming 'recipients' is a string like "addr1, addr2\naddr3"
        .split(/[, \n]+/) // Split by comma, space, or newline
        .map((addr) => addr.trim()) // Remove whitespace
        .filter((addr) => addr !== "") // Remove empty entries
        .map((addr) => addr as `0x${string}`); // Cast to address type
      const transferAmounts = amounts // Assuming 'amounts' is a string like "10, 20\n30"
        .split(/[, \n]+/)
        .map((amt) => amt.trim())
        .filter((amt) => amt !== "")
        .map((amount) => BigInt(amount)); // Convert amounts to BigInt
      if (recipientAddresses.length !== transferAmounts.length) {
        throw new Error("Mismatch between number of recipients and amounts.");
      }
      // Initiate Airdrop Transaction
      const airdropHash = await writeContractAsync({
        abi: tsenderAbi, // Spender contract's ABI
        address: tSenderAddress as `0x${string}`, // Spender contract's address
        functionName: "airdropERC20",
        args: [
          tokenAddress as `0x${string}`, // 1. Token being sent
          recipientAddresses, // 2. Array of recipient addresses
          transferAmounts, // 3. Array of amounts (BigInt)
          total,
        ],
      });
      console.log("Airdrop transaction hash:", airdropHash);
      // Optional: Wait for airdrop confirmation if needed for further UI updates
      console.log("Waiting for airdrop confirmation...");
      const airdropReceipt = await waitForTransactionReceipt(config, {
        hash: airdropHash,
      });
      console.log("Airdrop confirmed:", airdropReceipt);
      // Update UI based on success/failure
    } catch (err) {
      console.error("Airdrop failed:", err);
      // Handle UI feedback for error
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <InputField
          label="Token Address"
          placeholder="0x"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <InputField
          label="Recipients"
          placeholder="0x123..., 0x456..."
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          large={true} // Example of another prop
        />
        <InputField
          label="Amounts"
          placeholder="100, 200, ..."
          value={amounts}
          onChange={(e) => setAmounts(e.target.value)}
          large={true}
        />
        <button
          className={`bg-blue-600 cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] text-white transition-colors font-semibold relative border`}
          disabled={isPending}
        >
          {isPending || error || isConfirming
            ? getButtonContent()
            : "Send Tokens"}
        </button>
      </form>

      {/* 交易详情卡片 - 新增部分 */}
      <div className="bg-white border border-zinc-300 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-900 mb-3">
          Transaction Details
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Token Name:</span>
            <span className="font-mono text-zinc-900">
              {(tokenDetails?.[0]?.result as string) || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Amount (wei):</span>
            <span className="font-mono text-zinc-900">{total || "0"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Amount (tokens):</span>
            <span className="font-mono text-zinc-900">
              {total && tokenDetails?.[0]?.result
                ? formatTokenAmount(total, tokenDetails[1].result as number)
                : "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
