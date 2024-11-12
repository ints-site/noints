import React from 'react';

interface FontSettingsProps {
  fontSize: number;
  fontFamily: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
}

const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana'
];

export const FontSettings: React.FC<FontSettingsProps> = ({
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange
}) => {
  return (
    <div className="flex items-center gap-2">
      <select
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value)}
        className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
      >
        {fontFamilies.map(font => (
          <option key={font} value={font}>{font}</option>
        ))}
      </select>
      
      <select
        value={fontSize}
        onChange={(e) => onFontSizeChange(Number(e.target.value))}
        className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
      >
        {[12, 14, 16, 18, 20, 24].map(size => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>
    </div>
  );
}; 