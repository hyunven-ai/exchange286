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
        {/* 3-col grid: spacer | logo center | theme toggle */}
        <div className="max-w-2xl mx-auto px-4 h-14 grid grid-cols-[40px_1fr_40px] items-center">
          {/* Left spacer — mirrors ThemeToggle width */}
          <div />

          {/* Logo centered */}
          <div className="flex flex-col items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dzojrrwtr/image/upload/v1778851463/logo-286_mswyvu.png"
              alt="Exchange 286 Logo"
              width={152}
              height={38}
              className="rounded-full object-contain"
              priority
            />
          </div>

          {/* Theme toggle right */}
          <div className="flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24">{children}</main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
