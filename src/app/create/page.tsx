import { Metadata } from "next";
import { FrameConfigurator } from "@/components/frame-configurator";

export const metadata: Metadata = {
  title: "Start Creating — PrintFrame",
  description: "Upload your photo, choose your frame, and we handle the rest.",
};

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-printframe-950 font-display mb-2">
        Start Creating
      </h1>
      <p className="text-printframe-600 mb-8">
        Upload your photo and customize your frame in just a few clicks.
      </p>
      <FrameConfigurator />
    </div>
  );
}
