import type { JSONContent } from "@tiptap/core";

interface Props {
  about: string | null;
}

type RenderNodeProps = {
  node: JSONContent;
};

type RenderMarkProps = {
  mark: NonNullable<JSONContent["marks"]>[number];
  children: React.ReactNode;
};

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

function parseAbout(about: string | null): JSONContent | null {
  if (!about) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(about);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as JSONContent;
  } catch (error) {
    console.error("[AboutRenderer] Failed to parse about:", error);

    return null;
  }
}

function getSafeHref(href: unknown): string | null {
  if (typeof href !== "string") {
    return null;
  }

  const trimmedHref = href.trim();

  if (!trimmedHref) {
    return null;
  }

  try {
    const url = new URL(trimmedHref);

    if (!SAFE_LINK_PROTOCOLS.has(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getSafeImageSrc(src: unknown): string | null {
  if (typeof src !== "string") {
    return null;
  }

  const trimmedSrc = src.trim();

  if (!trimmedSrc) {
    return null;
  }

  try {
    const url = new URL(trimmedSrc);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getTextAlignStyle(
  attrs: JSONContent["attrs"],
): React.CSSProperties | undefined {
  const textAlign = attrs?.textAlign;

  if (
    textAlign !== "left" &&
    textAlign !== "center" &&
    textAlign !== "right" &&
    textAlign !== "justify"
  ) {
    return undefined;
  }

  return {
    textAlign,
  };
}

function renderMarks(
  children: React.ReactNode,
  marks: JSONContent["marks"],
): React.ReactNode {
  if (!marks?.length) {
    return children;
  }

  return marks.reduce<React.ReactNode>((content, mark) => {
    if (!mark) {
      return content;
    }

    return renderMark({
      mark,
      children: content,
    });
  }, children);
}

function renderMark({ mark, children }: RenderMarkProps): React.ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong>{children}</strong>;

    case "italic":
      return <em>{children}</em>;

    case "strike":
      return <s>{children}</s>;

    case "underline":
      return <u>{children}</u>;

    case "code":
      return <code>{children}</code>;

    case "highlight":
      return <mark>{children}</mark>;

    case "link": {
      const href = getSafeHref(mark.attrs?.href);

      if (!href) {
        return children;
      }

      return (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow">
          {children}
        </a>
      );
    }

    case "textStyle":
      return children;

    default:
      return children;
  }
}

function renderChildren(node: JSONContent): React.ReactNode {
  if (!node.content?.length) {
    return null;
  }

  return node.content.map((child, index) => (
    <RenderNode key={`${child.type ?? "node"}-${index}`} node={child} />
  ));
}

function renderNode({ node }: RenderNodeProps): React.ReactNode {
  const style = getTextAlignStyle(node.attrs);

  switch (node.type) {
    case "doc":
      return <>{renderChildren(node)}</>;

    case "paragraph":
      return <p style={style}>{renderChildren(node)}</p>;

    case "heading": {
      const level = node.attrs?.level;

      if (level === 1) {
        return <h1 style={style}>{renderChildren(node)}</h1>;
      }

      if (level === 2) {
        return <h2 style={style}>{renderChildren(node)}</h2>;
      }

      if (level === 3) {
        return <h3 style={style}>{renderChildren(node)}</h3>;
      }

      if (level === 4) {
        return <h4 style={style}>{renderChildren(node)}</h4>;
      }

      if (level === 5) {
        return <h5 style={style}>{renderChildren(node)}</h5>;
      }

      if (level === 6) {
        return <h6 style={style}>{renderChildren(node)}</h6>;
      }

      return <p style={style}>{renderChildren(node)}</p>;
    }

    case "bulletList":
      return <ul>{renderChildren(node)}</ul>;

    case "orderedList":
      return <ol>{renderChildren(node)}</ol>;

    case "listItem":
      return <li>{renderChildren(node)}</li>;

    case "blockquote":
      return <blockquote>{renderChildren(node)}</blockquote>;

    case "codeBlock":
      return (
        <pre>
          <code>{renderChildren(node)}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr />;

    case "hardBreak":
      return <br />;

    case "image": {
      const src = getSafeImageSrc(node.attrs?.src);

      if (!src) {
        return null;
      }

      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";

      const title =
        typeof node.attrs?.title === "string" ? node.attrs.title : undefined;

      return (
        <img
          src={src}
          alt={alt}
          title={title}
          loading="lazy"
          decoding="async"
        />
      );
    }

    case "text":
      return renderMarks(node.text ?? "", node.marks);

    default:
      return renderChildren(node);
  }
}

export default function AboutRenderer({ about }: Props) {
  const document = parseAbout(about);

  if (!document) {
    return null;
  }

  return (
    <div className="about-viewer">
      <RenderNode node={document} />
    </div>
  );
}

function RenderNode({ node }: RenderNodeProps) {
  return renderNode({ node });
}
