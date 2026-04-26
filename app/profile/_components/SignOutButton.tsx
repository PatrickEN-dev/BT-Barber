"use client";

import { Button } from "@/app/_components/ui/button";
import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";

const SignOutButton = () => (
  <Button
    type="button"
    variant="destructive"
    className="w-full justify-center"
    onClick={() => signOut({ callbackUrl: "/" })}
  >
    <LogOutIcon size={16} className="mr-2" />
    Sair
  </Button>
);

export default SignOutButton;
