import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Customize Your Frame — PrintFrame",
  description: "Choose your size, color, and matting. Upload your photo and preview in real-time.",
};

const FrameConfigurator = dynamic(() => import("@/components/frame-configurator"));

export default function Page() {
  return <FrameConfigurator />;
}
