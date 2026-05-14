import Image from "next/image";
import { ThemeToggle } from "@/components/public/ThemeToggle";
import { BottomNav } from "@/components/public/BottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Exchange 286 Logo"
              width={36}
              height={36}
              className="rounded-full object-contain"
              priority
            />
            <div>
              <h1 className="font-bold text-base text-foreground leading-tight">
                Exchange 286
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Tukar Uang
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
