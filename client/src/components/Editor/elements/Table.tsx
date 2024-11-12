import React from 'react';

interface TableProps {
  attributes: any;
  children: React.ReactNode;
  element: {
    rows: number;
    columns: number;
  };
}

export const Table: React.FC<TableProps> = ({ attributes, children, element }) => {
  return (
    <div className="my-4 overflow-x-auto">
      <table {...attributes} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<any> = ({ attributes, children }) => {
  return <tr {...attributes}>{children}</tr>;
};

export const TableCell: React.FC<any> = ({ attributes, children }) => {
  return (
    <td {...attributes} className="px-4 py-2 whitespace-nowrap">
      {children}
    </td>
  );
}; 