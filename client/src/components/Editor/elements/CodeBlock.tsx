import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';

interface CodeBlockProps {
  attributes: any;
  children: React.ReactNode;
  element: {
    language?: string;
  };
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ attributes, children, element }) => {
  const language = element.language || 'typescript';
  const [content, setContent] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    const code = children?.toString() || '';
    const highlighted = Prism.highlight(
      code,
      Prism.languages[language],
      language
    );
    setContent(highlighted);
  }, [children, language]);

  const handleCopy = () => {
    const code = children?.toString() || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (newLanguage: string) => {
    // Update the element's language property
    // You'll need to implement this through your state management
  };

  return (
    <pre {...attributes} className="relative group bg-gray-900 p-4 rounded-lg">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-2">
        <select
          contentEditable={false}
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-gray-800 text-white text-sm rounded px-2 py-1"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
        </select>
        <button
          onClick={handleCopy}
          className="bg-gray-800 text-white text-sm rounded px-2 py-1"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <code className={`language-${language}`}>
        {children}
      </code>
    </pre>
  );
}; 