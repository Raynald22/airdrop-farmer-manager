import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "glass border-border/30 shadow-none bg-background/50 backdrop-blur-xl",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "text-foreground bg-accent/50 hover:bg-accent border-border/50",
              formFieldLabel: "text-foreground",
              formFieldInput: "bg-muted/30 border-border/50 text-foreground",
              footerActionLink: "text-primary hover:text-primary/90",
            }
          }}
        />
      </div>
    </div>
  );
}
