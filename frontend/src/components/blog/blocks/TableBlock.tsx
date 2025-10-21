/**
 * TableBlock
 * 
 * Wagtail StreamFieldのTableBlockをレンダリングします。
 * データを表形式で表示し、比較や整理された情報の提示に使用します。
 */

import React from 'react';

interface TableValue {
  data: string[][];
  first_row_is_table_header?: boolean;
  first_col_is_header?: boolean;
}

interface TableBlockProps {
  value: TableValue;
}

export function TableBlock({ value }: TableBlockProps) {
  const { data, first_row_is_table_header = false, first_col_is_header = false } = value;

  if (!data || data.length === 0) {
    return null;
  }

  // ヘッダー行とボディ行を分離
  const hasHeaderRow = first_row_is_table_header;
  const headerRow = hasHeaderRow ? data[0] : null;
  const bodyRows = hasHeaderRow ? data.slice(1) : data;

  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        {/* ヘッダー */}
        {headerRow && (
          <thead className="bg-gray-100">
            <tr>
              {headerRow.map((cell, colIndex) => (
                <th
                  key={colIndex}
                  className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        
        {/* ボディ */}
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {row.map((cell, colIndex) => {
                // 最初の列がヘッダーの場合
                const isFirstColHeader = first_col_is_header && colIndex === 0;
                
                return isFirstColHeader ? (
                  <th
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 bg-gray-50"
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-4 py-2 text-gray-700"
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
