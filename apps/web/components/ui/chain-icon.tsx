"use strict";

import { cn } from "@/lib/utils";

interface ChainIconProps {
  name: string;
  className?: string;
}

export function ChainIcon({ name, className }: ChainIconProps) {
  const lowerName = name.toLowerCase();

  // Common classes
  // const baseClasses = (str: string) => cn("fill-current", str); // Unused, removing or fixing


  switch (lowerName) {
    case "bitcoin":
    case "btc":
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#F7931A]", className)} fill="currentColor">
          <path d="M23.638 14.904c1.314-0.875 2.21-2.316 2.227-3.996 0.024-2.889-2.277-5.234-5.166-5.263l-2.091-0.007-0.5-2.001c-0.126-0.501-0.579-0.852-1.096-0.852-0.621 0-1.125 0.503-1.125 1.125 0 0.046 0.003 0.091 0.010 0.135l0.485 1.94-1.89-0.006-0.499-1.996c-0.126-0.501-0.579-0.852-1.096-0.852-0.621 0-1.125 0.503-1.125 1.125 0 0.046 0.003 0.091 0.010 0.135l0.484 1.936-3.791-0.013c-0.621-0.001-1.125 0.505-1.125 1.125s0.505 1.125 1.125 1.125l2.259 0.008c0.046 0.354 0.063 0.706 0.063 1.050l-0.038 8.046c-0.002 0.344-0.020 0.697-0.066 1.050l-2.345-0.008c-0.621-0.001-1.125 0.505-1.125 1.125s0.505 1.125 1.125 1.125l3.96-0.013 0.487 1.95c0.118 0.472 0.543 0.803 1.026 0.803 0.090 0 0.181-0.011 0.269-0.033 0.603-0.151 0.963-0.756 0.812-1.359l-0.482-1.927 1.89 0.006 0.484 1.936c0.118 0.472 0.543 0.803 1.026 0.803 0.090 0 0.181-0.011 0.269-0.033 0.603-0.151 0.964-0.756 0.812-1.359l-0.485-1.939 2.073 0.007c3.811 0.038 6.942-3.033 6.969-6.845 0.010-1.446-0.34-2.812-1.002-4.008zM17.818 9.537l1.791 0.006c1.648 0.016 2.962 1.34 2.948 2.998-0.013 1.658-1.378 3.016-3.027 3.011l-1.791-0.006 0.080-6.010zM17.155 20.669l-1.916-0.006-0.092-6.521 1.916 0.006c1.83 0.019 3.298 1.498 3.283 3.328-0.016 1.829-1.528 3.295-3.191 3.293z" />
        </svg>
      );
    case "solana":
    case "sol":
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#00FFA3]", className)} fill="currentColor">
          <path d="M4.773 8.35c-0.198-0.147-0.199-0.407 0.001-0.556l2.457-1.838c0.887-0.662 2.127-0.771 3.123-0.274l16.103 8.043c0.198 0.147 0.199 0.407-0.001 0.556l-2.457 1.838c-0.887 0.662-2.127 0.771-3.123 0.274l-16.103-8.043zM27.227 12.028c0.198 0.147 0.199 0.407-0.001 0.556l-2.457 1.838c-0.887 0.662-2.127 0.771-3.123 0.274l-16.103-8.043c-0.198-0.147-0.199-0.407 0.001-0.556l2.457-1.838c0.887-0.662 2.127-0.771 3.123-0.274l16.103 8.043zM4.773 19.336c-0.198-0.147-0.199-0.407 0.001-0.556l2.457-1.838c0.887-0.662 2.127-0.771 3.123-0.274l16.103 8.043c0.198 0.147 0.199 0.407-0.001 0.556l-2.457 1.838c-0.887 0.662-2.127 0.771-3.123 0.274l-16.103-8.043z" />
        </svg>
      );
    case "zksync":
    case "zk":
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#8C8DFC]", className)} fill="currentColor">
           {/* Mock zkSync logo: Two interlocking letter-like shapes */}
           <path d="M6 10h12l-6 12h14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "base":
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#0052FF]", className)} fill="currentColor">
            <circle cx="16" cy="16" r="14" fill="currentColor" />
            <path d="M16 8a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" fill="#FFF" />
        </svg>
      );
    case "scroll":
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#FFF6D4]", className)} fill="currentColor">
          <circle cx="16" cy="16" r="14" fill="#FDF3D8" />
          <path d="M11 12h10v8h-10z" fill="#111" /> {/* Abstract scroll */}
        </svg>
      );
    case "linea":
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#60DFFF]", className)} fill="currentColor">
           <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none"/>
           <path d="M10 16h12" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case "ethereum":
    case "eth":
    default:
      return (
        <svg viewBox="0 0 32 32" className={cn("text-[#627EEA]", className)} fill="currentColor">
          <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378L24 17.616z" />
        </svg>
      );
  }
}
