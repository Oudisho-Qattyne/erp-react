import type { SubscriptionTransaction } from "../../../../domain/entities/subscriptionRequests/versions/subscriptionRequestV100";
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider";

interface TransactionReceiptProps {
    transactions: SubscriptionTransaction[];
}

export const TransactionReceipt = ({ transactions }: TransactionReceiptProps) => {
    const { t } = useLanguage();

    const text = (key: string) => t(`transaction_receipt.${key}`, 'investments');
    const typeLabel = (v?: string) => t(`subscription_request.type_${v}`, 'investments') || v;
    const statusLabel = (v?: string) => t(`subscription_request.tx_status_${v}`, 'investments') || v;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transactions.map((tx) => (
                <div
                    key={tx.id}
                    className="relative bg-card border border-border rounded-md p-6 shadow-sm bg-[linear-gradient(0deg,rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[22px_22px] dark:bg-[linear-gradient(0deg,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)]"
                >
                    <div className="border-b-2 border-dashed border-border pb-3 mb-4">
                        <h3 className="text-center text-lg font-black text-black tracking-wide uppercase dark:text-white">
                            {text('title')}
                        </h3>
                        <p className="text-center text-xs text-black/60 mt-1 dark:text-white/70">
                            {text('no')}: {tx.id}
                        </p>
                    </div>

                    <dl className="space-y-2 text-sm">
                        
                        <div className="flex justify-between gap-4">
                            <dt className="text-black font-medium dark:text-white">{text('status')}</dt>
                            <dd className="font-bold text-black capitalize text-left dark:text-white">{statusLabel(tx.transaction_status)}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                            <dt className="text-black font-medium dark:text-white">{text('value')}</dt>
                            <dd className="font-bold text-black text-left dark:text-white">
                                {tx.transaction_value} SYP
                            </dd>
                        </div>
                        {tx.client_payed_amount != null && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-black font-medium dark:text-white">{t('subscription_request.client_payed_amount', 'investments')}</dt>
                                <dd className="font-bold text-black text-left dark:text-white">{tx.client_payed_amount} {tx.transaction_currency_id}</dd>
                            </div>
                        )}
                       
                        
                        <div className="flex justify-between gap-4">
                            <dt className="text-black font-medium dark:text-white">{text('date')}</dt>
                            <dd className="font-bold text-black text-left dark:text-white">{tx.formatted_transaction_date}</dd>
                        </div>
                    </dl>

                    {tx.reason && (
                        <p className="mt-4 pt-3 border-t border-dashed border-border text-xs text-black/70 leading-relaxed dark:text-white/80">
                            {tx.reason}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};
