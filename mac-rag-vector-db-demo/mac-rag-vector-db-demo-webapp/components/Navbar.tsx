/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import Image from "next/image";
import mulesoftLogo from "@/lib/images/mulesoft-logo.png";
// import mulesoftLogoLight from "@/lib/images/mulesoft-light.png";
// import { buttonVariants } from "@/components/ui/button";
// import AuthButton from "@/components/AuthButton";

const Navbar = async () => {
  return (
    <header className="bg-mulesoft sticky w-full top-0 z-10 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src={mulesoftLogo}
              alt="MuleSoft Logo"
              width={150}
              height={40}
              className="object-contain"
            />
          </Link>
          {/* Add navigation items here if needed */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
