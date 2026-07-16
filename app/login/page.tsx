import type { Metadata } from "next";
import { SignIn2 } from "@/components/ui/clean-minimal-sign-in";

export const metadata: Metadata = {
  title: "Вход — Vista",
};

export default function LoginPage() {
  return <SignIn2 />;
}
