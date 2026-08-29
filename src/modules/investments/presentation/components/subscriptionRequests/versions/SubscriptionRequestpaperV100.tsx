import type { SubscriptionRequestV100, SubscriptionFacility, SubscriptionProductionCapacityRow, SubscriptionDailyConsumptionRow } from "../../../../domain/entities/subscriptionRequests/versions/subscriptionRequestV100";
import type { SubscriptionRequestV100Record } from "../../../../domain/entities/subscriptionRequests/subscriptionRequest";
import { SubscriptionRequestpaperHeader } from "../components/SubscriptionRequestpaperHeader";
import { TransactionReceipt } from "../components/TransactionReceipt";
import { AuthorizedPersonsTable } from "../components/AuthorizedPersonsTable";
import { PaperTable } from "../components/PaperTable";
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider";

interface SubscriptionRequestpaperV100Props {
    request: SubscriptionRequestV100Record;
}

export const SubscriptionRequestpaperV100 = ({ request }: SubscriptionRequestpaperV100Props) => {
    const { t } = useLanguage();
    const payload: SubscriptionRequestV100 | undefined = request.payload;

    const label = (key: string) => t(`subscription_request.${key}`, 'investments');

    const plotStatusLabel = (v?: string) => t(`plot_status.${v}`, 'investments') || v;
    const requestStatusLabel = (v?: string) => t(`dossier.status_${v}`, 'investments') || v;
    const companyTypeLabel = (v?: string) => t(`facilities.company_type_${v}`, 'investments') || v;
    const genderLabel = (v?: string) => t(`investors.gender_${v}`, 'investments') || v;

    const renderProduction = (rows: SubscriptionProductionCapacityRow[] | undefined, title: string) => {
        if (!rows || rows.length === 0) return null;
        return (
            <div className="mt-3">
                <span className="text-xs text-text-muted">{title}:</span>
                <PaperTable
                    columns={[
                        { key: 'material', label: label('material'), render: (r) => <span className="font-medium text-text">{r.material}</span> },
                        { key: 'production', label: label('production'), render: (r) => <>{r.production}</> },
                    ]}
                    data={rows}
                    rowKey={(_, idx) => idx}
                />
            </div>
        );
    };

    const renderConsumption = (rows: SubscriptionDailyConsumptionRow[] | undefined) => {
        if (!rows || rows.length === 0) return null;
        return (
            <div className="mt-3">
                <span className="text-xs text-text-muted">{label('daily_consumption')}:</span>
                <PaperTable
                    columns={[
                        {
                            key: 'material',
                            label: label('material'),
                            render: (r) => <span className="font-medium text-text">{typeof r.consumable_material?.name === 'string' ? r.consumable_material.name : "—"}</span>,
                        },
                        { key: 'consumption', label: label('consumption'), render: (r) => <>{r.consumption}</> },
                    ]}
                    data={rows}
                    rowKey={(r, idx) => r.id ?? idx}
                />
            </div>
        );
    };

    if (!payload) return null;

    const renderFacility = (facility: SubscriptionFacility) => (
        <div className="border border-border/50 rounded-md p-3">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-text">{facility.name ?? "—"}</span>
                <span className="text-xs text-text-muted">{facility.address ?? "—"}</span>
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-sm">
                <div>
                    <dt className="text-xs text-text-muted">{label('company_type')}</dt>
                    <dd className="font-medium text-text">{facility.company_type ? companyTypeLabel(facility.company_type) : "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('email')}</dt>
                    <dd className="font-medium text-text">{facility.email ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('first_phone')}</dt>
                    <dd className="font-medium text-text">{facility.first_phone_number ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('second_phone')}</dt>
                    <dd className="font-medium text-text">{facility.second_phone_number ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('commercial_register')}</dt>
                    <dd className="font-medium text-text">{facility.commercial_register ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('commercial_register_date')}</dt>
                    <dd className="font-medium text-text">{facility.commercial_register_date ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('company_nationality')}</dt>
                    <dd className="font-medium text-text">
                        {(() => {
                            const natName = facility.company_nationality?.name;
                            return typeof natName === 'string' ? natName : (natName?.ar ?? natName?.en ?? "—");
                        })()}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('workers')}</dt>
                    <dd className="font-medium text-text">{facility.number_of_workers ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('total_capital_usd')}</dt>
                    <dd className="font-medium text-text">{facility.total_capital_in_usd ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('total_capital_syp')}</dt>
                    <dd className="font-medium text-text">{facility.total_capital_in_syp ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('machines_usd')}</dt>
                    <dd className="font-medium text-text">{facility.value_of_machines_in_usd ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('machines_syp')}</dt>
                    <dd className="font-medium text-text">{facility.value_of_machines_in_syp ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('electrical_power')}</dt>
                    <dd className="font-medium text-text">{facility.electrical_power_capacity ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('drinking_water')}</dt>
                    <dd className="font-medium text-text">{facility.yearly_estimated_drinking_water_consumption ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('industrial_water')}</dt>
                    <dd className="font-medium text-text">{facility.yearly_estimated_industrial_water_consumption ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('patrols')}</dt>
                    <dd className="font-medium text-text">{facility.number_or_patrols ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('telephone_lines')}</dt>
                    <dd className="font-medium text-text">{facility.telephone_lines_number ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('internet_data')}</dt>
                    <dd className="font-medium text-text">{facility.monthly_internet_data_requirement ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('imported_raw_materials')}</dt>
                    <dd className="font-medium text-text">{facility.yearly_imported_raw_materials ?? "—"}</dd>
                </div>
                <div>
                    <dt className="text-xs text-text-muted">{label('export_ratio')}</dt>
                    <dd className="font-medium text-text">{facility.export_to_production_ratio ?? "—"} %</dd>
                </div>
                {facility.partnership_type && (
                    <div>
                        <dt className="text-xs text-text-muted">{label('partnership_type')}</dt>
                        <dd className="font-medium text-text">{facility.partnership_type.name ?? "—"}</dd>
                    </div>
                )}
            </dl>

            {renderProduction(facility.daily_production_capacities, label('daily_production'))}
            {renderProduction(facility.monthly_production_capacities, label('monthly_production'))}
            {renderProduction(facility.yearly_production_capacities, label('yearly_production'))}
            {renderConsumption(facility.daily_consumption)}
            {facility.require_all_persons_for_legal_matters && (
                <p className="mt-2 text-xs text-text-muted">✓ {label('require_all_persons')}</p>
            )}
        </div>
    );

    return(
        <div className="max-w-4xl mx-auto p-8 rounded-lg border border-border bg-card shadow-sm">
            <SubscriptionRequestpaperHeader version="1.0.0"/>

            <div className="mt-8 space-y-6">
                <section className="border border-border rounded-md p-4">
                    <h3 className="text-sm font-bold text-text mb-2 border-b border-border pb-2">{label('plot')}</h3>
                    {payload.plot ? (
                        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <dt className="text-xs text-text-muted">{label('code')}</dt>
                                <dd className="font-medium text-text">{payload.plot.code ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">{label('identifier')}</dt>
                                <dd className="font-medium text-text">{payload.plot.identifier ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">{label('area')}</dt>
                                <dd className="font-medium text-text">{payload.plot.area ?? "—"} ㎡</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-text-muted">{label('status')}</dt>
                                <dd className="font-medium text-text">{plotStatusLabel(payload.plot.status) ?? "—"}</dd>
                            </div>
                            {payload.plot.plot_area_id != null && (
                                <div>
                                    <dt className="text-xs text-text-muted">{label('plot_area')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.plot_area_id}</dd>
                                </div>
                            )}
                            {payload.plot.plot_classification_id != null && (
                                <div>
                                    <dt className="text-xs text-text-muted">{label('plot_classification')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.plot_classification_id}</dd>
                                </div>
                            )}
                            {payload.plot.latitude != null && (
                                <div>
                                    <dt className="text-xs text-text-muted">{label('latitude')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.latitude}</dd>
                                </div>
                            )}
                            {payload.plot.longitude != null && (
                                <div>
                                    <dt className="text-xs text-text-muted">{label('longitude')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.longitude}</dd>
                                </div>
                            )}
                            {payload.plot.allocated_dossier_id != null && (
                                <div>
                                    <dt className="text-xs text-text-muted">{label('allocated_dossier')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.allocated_dossier_id}</dd>
                                </div>
                            )}
                            {payload.plot.updated_at != null && (
                                <div>
                                    <dt className="text-xs text-text-muted">{label('updated_at')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.updated_at}</dd>
                                </div>
                            )}
                            {payload.plot.notes != null && (
                                <div className="col-span-2 md:col-span-3">
                                    <dt className="text-xs text-text-muted">{label('notes')}</dt>
                                    <dd className="font-medium text-text">{payload.plot.notes}</dd>
                                </div>
                            )}
                        </dl>
                    ) : (
                        <p className="text-sm text-text-muted">—</p>
                    )}
                </section>

                {payload.partners && payload.partners.length > 0 && (
                    <section className="border border-border rounded-md p-4">
                        <h3 className="text-sm font-bold text-text mb-2 border-b border-border pb-2">{label('partners')}</h3>
                        <PaperTable
                            columns={[
                                {
                                    key: 'name',
                                    label: label('partner_name'),
                                    render: (p) => <span className="font-medium text-text">{p.investor?.first_name ?? "—"} {p.investor?.last_name ?? "—"}</span>,
                                },
                                { key: 'father_name', label: label('father_name'), render: (p) => <>{p.investor?.father_name ?? "—"}</> },
                                { key: 'mother_name', label: label('mother_name'), render: (p) => <>{p.investor?.mother_name ?? "—"}</> },
                                { key: 'grandfather_name', label: label('grandfather_name'), render: (p) => <>{p.investor?.grandfather_name ?? "—"}</> },
                                { key: 'national_id', label: label('national_id'), render: (p) => <>{p.investor?.national_id ?? "—"}</> },
                                { key: 'nationality', label: label('nationality'), render: (p) => <>{p.investor?.nationality ?? "—"}</> },
                                { key: 'gender', label: label('gender'), render: (p) => <>{p.investor?.gender ? genderLabel(p.investor?.gender) : "—"}</> },
                                { key: 'passport_number', label: label('passport_number'), render: (p) => <>{p.investor?.passport_number ?? "—"}</> },
                                { key: 'address', label: label('address'), render: (p) => <>{p.investor?.address ?? "—"}</> },
                            ]}
                            data={payload.partners}
                            rowKey={(_, idx) => idx}
                        />
                    </section>
                )}

                {payload.authorized_persons && payload.authorized_persons.length > 0 && (
                    <section className="border border-border rounded-md p-4">
                        <h3 className="text-sm font-bold text-text mb-2 border-b border-border pb-2">{label('authorized_persons')}</h3>
                        <AuthorizedPersonsTable
                            rows={payload.authorized_persons.map(ap => ({
                                name: ap.person?.name ?? "—",
                                role: ap.role_in_facility ?? null,
                                required: ap.is_required_for_legal_matters,
                            }))}
                        />
                    </section>
                )}

                {payload.facility && (
                    <section className="border border-border rounded-md p-4">
                        <h3 className="text-sm font-bold text-text mb-2 border-b border-border pb-2">{label('facilities')}</h3>
                        {renderFacility(payload.facility)}
                    </section>
                )}

                {request.transactions && request.transactions.length > 0 && (
                    <section className="border border-border rounded-md p-4">
                        <h3 className="text-sm font-bold text-text mb-2 border-b border-border pb-2">{label('transactions')}</h3>
                        <TransactionReceipt transactions={request.transactions} />
                    </section>
                )}

                <section className="border border-border rounded-md p-4">
                    <h3 className="text-sm font-bold text-text mb-2 border-b border-border pb-2">{label('info')}</h3>
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <dt className="text-xs text-text-muted">{label('status')}</dt>
                            <dd className="font-medium text-text">{requestStatusLabel(request.status) ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-text-muted">{label('created_at')}</dt>
                            <dd className="font-medium text-text">{request.created_at ?? "—"}</dd>
                        </div>
                    </dl>
                </section>
            </div>
        </div>
    )
}