/* TEMPORARY verification page — delete after checking callout layout. */
import Image from "next/image";
import { SilverButtonCallout } from "@/components/product/silver-button-callout";

const FRAMES = [
  { label: "desktop gallery (600px)", width: 600, img: "/product_Images/silver_button_linen.png" },
  { label: "tablet (420px)", width: 420, img: "/product_Images/silver_button_linen_women_shirt.png" },
  { label: "phone (330px)", width: 330, img: "/product_Images/silver_button_linen.png" },
];

export default function Page() {
  return (
    <div style={{ padding: 24, display: "flex", gap: 24, alignItems: "flex-start", background: "#fff" }}>
      {/* Force every reveal into its open state so the final layout can be inspected. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .frame * { opacity: 1 !important; transform: none !important; transition: none !important; animation: none !important; }
            .frame path { stroke-dashoffset: 0 !important; }
          `,
        }}
      />
      {FRAMES.map((f) => (
        <div key={f.label}>
          <p style={{ font: "12px sans-serif", marginBottom: 8 }}>{f.label}</p>
          <div
            className="frame"
            style={{ position: "relative", width: f.width, paddingBottom: "133.33%", overflow: "hidden", borderRadius: 8 }}
          >
            <Image src={f.img} alt="" fill sizes="600px" className="absolute inset-0 object-cover" />
            <SilverButtonCallout />
          </div>
        </div>
      ))}
    </div>
  );
}
