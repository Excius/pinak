import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { getPublicPage, type PublicPage } from "@/services/content.service";

type InlinePart = {
  text: string;
  style?: "bold" | "italic" | "code" | "link";
  url?: string;
};

function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const pattern =
    /(\[([^\]]+)\]\((https?:\/\/[^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[2] && match[3]) {
      parts.push({ text: match[2], style: "link", url: match[3] });
    } else if (match[4] || match[5]) {
      parts.push({ text: match[4] || match[5], style: "bold" });
    } else if (match[6] || match[7]) {
      parts.push({ text: match[6] || match[7], style: "italic" });
    } else if (match[8]) {
      parts.push({ text: match[8], style: "code" });
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }

  return parts;
}

function InlineText({ content }: { content: string }) {
  return (
    <Text className="text-base leading-7 text-text-secondary">
      {parseInline(content).map((part, index) => (
        <Text
          key={`${part.text}-${index}`}
          className={
            part.style === "bold"
              ? "font-bold text-text-primary"
              : part.style === "italic"
                ? "italic"
                : part.style === "code"
                  ? "rounded bg-surface-light font-mono text-primary"
                  : part.style === "link"
                    ? "text-primary underline"
                    : undefined
          }
          onPress={
            part.style === "link" && part.url
              ? () => void Linking.openURL(part.url!)
              : undefined
          }
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Array<
    | { type: "heading"; level: number; text: string }
    | { type: "paragraph"; text: string }
    | { type: "list"; ordered: boolean; items: string[] }
    | { type: "quote"; text: string }
    | { type: "rule" }
  > = [];

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const listItem = line.match(/^([-*+]|\d+\.)\s+(.+)$/);

    if (!line) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: Math.min(heading[1].length, 3),
        text: heading[2],
      });
    } else if (/^([-*_])(?:\s*\1){2,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "rule" });
    } else if (listItem) {
      flushParagraph();
      const ordered = /^\d+\./.test(listItem[1]);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(listItem[2]);
    } else if (line.startsWith(">")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: line.replace(/^>\s?/, "") });
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();

  return (
    <View>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <Text
              key={index}
              className={`font-display font-bold text-text-primary ${
                block.level === 1
                  ? "mb-3 mt-2 text-3xl"
                  : block.level === 2
                    ? "mb-2 mt-7 text-2xl"
                    : "mb-2 mt-5 text-xl"
              }`}
            >
              <InlineText content={block.text} />
            </Text>
          );
        }
        if (block.type === "paragraph") {
          return <InlineText key={index} content={block.text} />;
        }
        if (block.type === "quote") {
          return (
            <View key={index} className="my-3 border-l-2 border-primary pl-4">
              <InlineText content={block.text} />
            </View>
          );
        }
        if (block.type === "rule") {
          return (
            <View key={index} className="my-5 border-t border-surface-border" />
          );
        }
        return (
          <View key={index} className="my-1">
            {block.items.map((item, itemIndex) => (
              <View key={`${item}-${itemIndex}`} className="flex-row py-1">
                <Text className="mr-3 text-base text-primary">
                  {block.ordered ? `${itemIndex + 1}.` : "•"}
                </Text>
                <View className="flex-1">
                  <InlineText content={item} />
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

export function StaticPage({ slug }: { slug: string }) {
  const [page, setPage] = useState<PublicPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPublicPage(slug)
      .then((result) => {
        if (active) setPage(result);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Unable to load page",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-surface-border px-4 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3 rounded-full bg-surface-light p-2"
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#C9A962" />
        </Pressable>
        <Text className="flex-1 font-display text-2xl font-bold text-text-primary">
          {page?.title || "Information"}
        </Text>
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={52}
            color="#C9A962"
          />
          <Text className="mt-4 text-center text-base text-text-secondary">
            {error}
          </Text>
        </View>
      ) : page ? (
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <MarkdownContent content={page.content} />
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C9A962" />
        </View>
      )}
    </SafeAreaView>
  );
}
