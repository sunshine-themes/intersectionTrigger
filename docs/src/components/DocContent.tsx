import CodeBlock from "./CodeBlock";
import FeatureCard from "./FeatureCard";
import type { ContentBlock, Section } from "@/data/docSections";

const renderInlineMarkdown = (text: string) => {
  // Bold
  let result = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline underline-offset-4 hover:opacity-80">$1</a>');
  return result;
};

const ContentRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
      return <Tag dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.text || "") }} />;
    }
    case "paragraph":
      return <p dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(block.text || "") }} />;
    case "code":
      return <CodeBlock code={block.code || block.text || ""} language={block.language} title={block.title} />;
    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag>
          {block.items?.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} />
          ))}
        </ListTag>
      );
    }
    case "table":
      return (
        <div className="overflow-x-auto mb-4">
          <table>
            <thead>
              <tr>
                {block.headers?.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "features":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
          {block.features?.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} description={f.description} />
          ))}
        </div>
      );
    case "divider":
      return <hr />;
    default:
      return null;
  }
};

interface DocContentProps {
  sections: Section[];
}

const DocContent = ({ sections }: DocContentProps) => {
  return (
    <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-8 py-8">
      <div className="doc-prose">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            {section.content.map((block, i) => (
              <ContentRenderer key={`${section.id}-${i}`} block={block} />
            ))}
          </section>
        ))}
      </div>
    </main>
  );
};

export default DocContent;
