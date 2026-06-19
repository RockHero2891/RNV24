import { useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import {
  autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap, snippetCompletion,
} from '@codemirror/autocomplete';
import { indentUnit } from '@codemirror/language';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import type { CompletionSource } from '@codemirror/autocomplete';

export type CodeEditorLang = 'html' | 'codigo' | 'sql';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeEditorLang;
  disabled?: boolean;
  placeholder?: string;
}

const completionSources: Record<CodeEditorLang, CompletionSource> = {
  codigo: (context) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: [
        snippetCompletion('function ${name}(${params}) {\n\t${}\n}', { label: 'function', type: 'keyword', detail: 'declarar funcion' }),
        snippetCompletion('const ${name} = ${value};', { label: 'const', type: 'keyword', detail: 'constante' }),
        snippetCompletion('let ${name} = ${value};', { label: 'let', type: 'keyword', detail: 'variable' }),
        snippetCompletion('if (${condition}) {\n\t${}\n}', { label: 'if', type: 'keyword', detail: 'condicional' }),
        snippetCompletion('for (const ${item} of ${items}) {\n\t${}\n}', { label: 'for...of', type: 'keyword', detail: 'bucle' }),
        snippetCompletion('return ${value};', { label: 'return', type: 'keyword', detail: 'retornar valor' }),
        { label: 'console.log', type: 'function', apply: 'console.log()' },
      ],
    };
  },
  html: (context) => {
    const word = context.matchBefore(/[\w-]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: [
        snippetCompletion('<div>${}</div>', { label: 'div', type: 'type', detail: 'contenedor' }),
        snippetCompletion('<section>\n\t${}\n</section>', { label: 'section', type: 'type', detail: 'seccion' }),
        snippetCompletion('<button type="button">${}</button>', { label: 'button', type: 'type', detail: 'boton' }),
        snippetCompletion('<style>\n\t${}\n</style>', { label: 'style', type: 'type', detail: 'css interno' }),
        snippetCompletion('display: flex;', { label: 'display:flex', type: 'property', detail: 'css' }),
        snippetCompletion('gap: ${10px};', { label: 'gap', type: 'property', detail: 'css' }),
        snippetCompletion('background: ${#ffffff};', { label: 'background', type: 'property', detail: 'css' }),
      ],
    };
  },
  sql: (context) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return {
      from: word.from,
      options: [
        snippetCompletion('SELECT ${columns}\nFROM ${table};', { label: 'SELECT', type: 'keyword', detail: 'consulta' }),
        snippetCompletion('JOIN ${table} ON ${condition}', { label: 'JOIN', type: 'keyword', detail: 'union' }),
        snippetCompletion('GROUP BY ${columns}', { label: 'GROUP BY', type: 'keyword', detail: 'agrupar' }),
        snippetCompletion('ORDER BY ${column} DESC', { label: 'ORDER BY', type: 'keyword', detail: 'ordenar' }),
        snippetCompletion('WITH ${name} AS (\n\t${}\n)\nSELECT * FROM ${name};', { label: 'WITH', type: 'keyword', detail: 'cte' }),
        snippetCompletion('INSERT INTO ${table} (${columns})\nVALUES (${values});', { label: 'INSERT INTO', type: 'keyword', detail: 'insertar' }),
        { label: 'SUM', type: 'function', apply: 'SUM()' },
      ],
    };
  },
};

/**
 * Editor de código estilo VSCode: resaltado de sintaxis, autocompletado con
 * dropdown, indentación automática, soporte de Tab y copiar/pegar habilitado.
 */
export function CodeEditor({ value, onChange, language, disabled, placeholder }: CodeEditorProps) {
  const langExtension = useMemo(() => {
    switch (language) {
      case 'html':   return html({ autoCloseTags: true, matchClosingTags: true });
      case 'sql':    return sql({ dialect: PostgreSQL, upperCaseKeywords: true });
      case 'codigo':
      default:       return javascript({ jsx: false, typescript: false });
    }
  }, [language]);

  const extensions = useMemo(() => [
    langExtension,
    lineNumbers(),
    highlightActiveLine(),
    history(),
    closeBrackets(),
    indentUnit.of('    '),
    autocompletion({
      activateOnTyping: true,
      defaultKeymap: true,
      override: [completionSources[language]],
    }),
    keymap.of([
      indentWithTab,          // Tab indenta, Shift+Tab des-indenta
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      ...completionKeymap,
    ]),
    EditorView.theme({
      '&': { fontSize: '13.5px', backgroundColor: '#0f172a' },
      '.cm-content': { fontFamily: '"JetBrains Mono", Consolas, monospace', padding: '12px 0', caretColor: '#60a5fa' },
      '.cm-gutters': { backgroundColor: '#0f172a', color: '#475569', border: 'none' },
      '.cm-activeLine': { backgroundColor: 'rgba(96,165,250,0.06)' },
      '.cm-activeLineGutter': { backgroundColor: 'rgba(96,165,250,0.08)' },
      '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(96,165,250,0.25) !important' },
      '.cm-tooltip-autocomplete': {
        backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,.35)', overflow: 'hidden',
      },
      '.cm-tooltip-autocomplete ul li': { padding: '4px 10px', fontFamily: '"JetBrains Mono", monospace', fontSize: '12.5px' },
      '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#2563eb', color: '#fff' },
      '.cm-scroller': { overflow: 'auto' },
      '&.cm-focused': { outline: 'none' },
    }),
    EditorState.tabSize.of(4),
    EditorView.lineWrapping,
  ], [langExtension]);

  return (
    <div className="overflow-hidden rounded-lg border border-surface-700 focus-within:border-brand-400 transition-colors">
      <CodeMirror
        value={value}
        height="220px"
        theme="dark"
        editable={!disabled}
        placeholder={placeholder}
        extensions={extensions}
        onChange={onChange}
        basicSetup={false}
      />
    </div>
  );
}
