
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Notifications } from "./notifications";

export function Header() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search wallets, protocols..."
          className="pl-9 bg-muted/50 border-border/50 focus:ring-primary/50 h-9 text-sm"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <SignedIn>
          {/* Notifications */}
          <Notifications />

          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <a href="/pricing">Upgrade</a>
          </Button>

          {/* Connect Wallet */}
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus="avatar"
          />
          
          <div className="h-6 w-px bg-border/50 mx-1" />
          
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: "h-8 w-8"
              }
            }}
          />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm">Sign In</Button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
