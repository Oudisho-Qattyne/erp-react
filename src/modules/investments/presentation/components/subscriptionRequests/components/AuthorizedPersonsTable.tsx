import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider";
import { PaperTable } from "./PaperTable";

export interface AuthorizedPersonRow {
  name: string;
  role: string | null;
  required?: boolean;
}

interface AuthorizedPersonsTableProps {
  rows: AuthorizedPersonRow[];
  namespace?: string;
}

export const AuthorizedPersonsTable = ({ rows, namespace = 'subscription_request' }: AuthorizedPersonsTableProps) => {
    const { t } = useLanguage();

    const label = (key: string) => t(`${namespace}.${key}`, 'investments') || t(`subscription_request.${key}`, 'investments');

    return (
        <div className="mt-2">
            <span className="text-xs text-text-muted">{label('authorized_persons')}:</span>
            <div className="mt-1">
                <PaperTable
                    columns={[
                        {
                            key: 'name',
                            label: label('partner_name'),
                            render: (row) => <span className="font-medium text-text">{row.name}</span>,
                        },
                        {
                            key: 'role',
                            label: label('authorized_person_role'),
                            render: (row) => <>{row.role ?? "—"}</>,
                        },
                        {
                            key: 'required',
                            label: label('authorized_person_required'),
                            render: (row) => <>{row.required ? "✓" : "—"}</>,
                        },
                    ]}
                    data={rows}
                    rowKey={(_, idx) => idx}
                />
            </div>
        </div>
    );
};
