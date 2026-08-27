import type { ReactNode } from "react";

export interface PaperTableColumn<T> {
    key: string;
    label: ReactNode;
    render?: (row: T) => ReactNode;
    align?: 'left' | 'right' | 'center';
    className?: string;
}

interface PaperTableProps<T> {
    columns: PaperTableColumn<T>[];
    data: T[];
    rowKey: (row: T, index: number) => string | number;
    emptyMessage?: string;
}

export function PaperTable<T>({ columns, data, rowKey, emptyMessage = "—" }: PaperTableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-right text-xs text-text-muted border-b border-border">
                        {columns.map(col => (
                            <th
                                key={col.key}
                                className={`py-1 pr-2 text-right ${col.className || ''}`}
                                style={{ textAlign: col.align === 'center' ? 'center' : col.align === 'left' ? 'left' : 'right' }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-3 text-right text-text-muted">{emptyMessage}</td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr key={rowKey(row, index)} className="border-b border-border/50">
                                {columns.map(col => (
                                    <td
                                        key={col.key}
                                        className={`py-1 pr-2 text-right ${col.className || ''}`}
                                        style={{ textAlign: col.align === 'center' ? 'center' : col.align === 'left' ? 'left' : 'right' }}
                                    >
                                        {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
