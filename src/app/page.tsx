import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Home — PrintFrame",
  description: "Turn your precious photos into stunning custom cardboard frames.",
};

const HomeContent = dynamic(() => import("@/components/home-page"), { ssr: false });

export default function Page() {
  return <HomeContent />;
}
