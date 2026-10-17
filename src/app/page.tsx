import { Metadata } from "next";
import HomeContent from "@/components/home-page";

export const metadata: Metadata = {
  title: "Home — PrintFrame",
  description: "Turn your precious photos into stunning custom cardboard frames.",
};

export default function Page() {
  return <HomeContent />;
}
