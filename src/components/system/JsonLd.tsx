import React from "react";

interface JsonLdProps {
  data: unknown;
}

export default function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data);
  if (json === undefined) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json.replace(/</g, "\\u003c") }}
    />
  );
}
