// src/app/page.tsx (Key additions/changes)
"use client"; // Required for client-side hooks like useAccount
import HomeContent from "@/components/ui/HomeContent"; // Import the new component
import { useAccount } from "wagmi"; // Import the wagmi hook
export default function Home() {
  const { isConnected } = useAccount(); // Get wallet connection status
  return (
    <div>
      {/* Conditionally render based on connection status */}
      {isConnected ? (
        <div>
          {" "}
          {/* Wrap conditional components */}
          <HomeContent />
        </div>
      ) : (
        <div>
          {" "}
          {/* Wrap conditional components */}
          Please connect a wallet...
        </div>
      )}
    </div>
  );
}
