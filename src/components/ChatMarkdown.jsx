import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { T } from "./ui";

/**
 * Renderiza o texto de uma mensagem da Secretária como markdown —
 * em especial tabelas (horário | compromisso, etc.), negrito e listas,
 * em vez de texto cru com barras e colchetes.
 */
export function ChatMarkdown({ text }) {
  return (
    <div className="text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1.5">{children}</p>,
          strong: ({ children }) => <strong style={{ color: T.ink }}>{children}</strong>,
          ul: ({ children }) => <ul className="list-disc list-inside my-1.5 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside my-1.5 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          code: ({ children }) => (
            <code className="text-xs font-mono px-1 py-0.5 rounded" style={{ backgroundColor: T.surfaceAlt }}>{children}</code>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" style={{ color: T.brand, textDecoration: "underline" }}>{children}</a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg" style={{ border: `1px solid ${T.border}` }}>
              <table className="w-full text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead style={{ backgroundColor: T.surfaceAlt }}>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr style={{ borderBottom: `1px solid ${T.border}` }}>{children}</tr>,
          th: ({ children }) => (
            <th className="text-left font-semibold px-2.5 py-1.5" style={{ color: T.ink }}>{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5" style={{ color: T.inkSoft }}>{children}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
