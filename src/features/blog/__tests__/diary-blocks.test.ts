import {
  diaryBlockSpan,
  moveItem,
  orderDiaryBlocks,
  parseDiarySettings,
  resolveDiaryBackground,
  toDiaryBlock,
} from "../diary-blocks";

describe("toDiaryBlock", () => {
  it("reads the block fields from legacy_payload", () => {
    const block = toDiaryBlock({
      id: "p1",
      title: "Instante",
      content: "",
      legacy_payload: {
        post_format: "video",
        youtube_url: "https://youtu.be/dQw4w9WgXcQ?t=30",
        card_size: "large",
        tone: "night",
      },
    });
    expect(block).toMatchObject({
      id: "p1",
      kind: "video",
      youtubeId: "dQw4w9WgXcQ",
      size: "large",
      tone: "night",
    });
  });

  it("accepts the mapped repository shape", () => {
    const block = toDiaryBlock({
      id: "p2",
      title: "Frase",
      content: "A vida acontece no contato.",
      post_format: "quote",
      quote_author: "Laura Perls",
      image: "https://x.supabase.co/a.jpg",
    });
    expect(block.kind).toBe("quote");
    expect(block.size).toBe("small");
    expect(block.tone).toBe("sand");
    expect(block.quoteAuthor).toBe("Laura Perls");
    expect(block.imageUrl).toBe("https://x.supabase.co/a.jpg");
  });

  it("turns a video without a valid YouTube id into a text block", () => {
    expect(
      toDiaryBlock({
        id: "p3",
        post_format: "video",
        youtube_url: "https://vimeo.com/1",
      }).kind,
    ).toBe("text");
  });

  it("maps legacy sizes and rejects unsafe image urls", () => {
    const block = toDiaryBlock({
      id: "p4",
      image: "javascript:alert(1)",
      legacy_payload: { card_size: "tall", bg_style: "default" },
    });
    expect(block.size).toBe("large");
    expect(block.tone).toBe("paper");
    expect(block.imageUrl).toBeNull();
    expect(block.kind).toBe("article");
  });

  it("falls back to the external url for old video posts", () => {
    expect(
      toDiaryBlock({
        id: "p5",
        post_format: "video",
        externalUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      }).youtubeId,
    ).toBe("dQw4w9WgXcQ");
  });
});

describe("orderDiaryBlocks", () => {
  const blocks = [
    { id: "a", date: "2026-01-01" },
    { id: "b", date: "2026-03-01" },
    { id: "c", date: "2026-02-01" },
    { id: "d", date: "2026-05-01" },
  ];

  it("puts new blocks first (newest first) and then the saved order", () => {
    expect(
      orderDiaryBlocks(blocks, ["c", "a", "gone"]).map((b) => b.id),
    ).toEqual(["d", "b", "c", "a"]);
  });

  it("keeps the saved order when every block is placed", () => {
    expect(
      orderDiaryBlocks(blocks, ["b", "d", "a", "c"]).map((b) => b.id),
    ).toEqual(["b", "d", "a", "c"]);
  });
});

describe("moveItem", () => {
  it("moves without mutating and ignores out-of-range moves", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveItem(list, 2, 1)).toEqual(["a", "c", "b"]);
    expect(moveItem(list, 0, -1)).toEqual(list);
    expect(list).toEqual(["a", "b", "c"]);
  });
});

describe("settings and layout", () => {
  it("parses settings defensively and reads the legacy theme", () => {
    expect(
      parseDiarySettings({
        background: "noite",
        backgroundImageUrl: "javascript:void(0)",
        order: ["a", "a", 3, "", "b"],
      }),
    ).toEqual({
      background: "noite",
      backgroundImageUrl: null,
      order: ["a", "b"],
    });
    expect(parseDiarySettings(null, { theme: "watercolor" }).background).toBe(
      "aquarela",
    );
    expect(parseDiarySettings("lixo").background).toBe("papel");
  });

  it("resolves unknown backgrounds to paper", () => {
    expect(resolveDiaryBackground("inexistente").id).toBe("papel");
    expect(resolveDiaryBackground("dark").dark).toBe(true);
  });

  it("gives larger spans to larger blocks and tall photos two rows", () => {
    expect(diaryBlockSpan({ size: "small", kind: "quote" })).toBe(
      "sm:col-span-1 lg:col-span-2",
    );
    expect(diaryBlockSpan({ size: "full", kind: "text" })).toBe(
      "sm:col-span-2 lg:col-span-6",
    );
    expect(diaryBlockSpan({ size: "large", kind: "photo" })).toContain(
      "lg:row-span-2",
    );
    expect(diaryBlockSpan({ size: "large", kind: "video" })).not.toContain(
      "row-span",
    );
  });
});
