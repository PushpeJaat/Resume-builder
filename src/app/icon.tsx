import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
          borderRadius: 120,
          color: "white",
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: -12,
        }}
      >
        C
      </div>
    ),
    size,
  );
}