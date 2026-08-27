interface SubscriptionRequestpaperHeaderProps {
    version?: string;
}

export const SubscriptionRequestpaperHeader = ({ version }: SubscriptionRequestpaperHeaderProps) => {
    return (
        <div className="relative w-full flex justify-between items-center ">
            <div className="relative flex-1  flex flex-col justify-center ">
                <p>الجمهورية العربية السورية</p>
                <p>وزارة الصناعة</p>
            </div>

            <div className="relative flex-1 flex flex-col justify-center items-center gap-1">
                <img src="/Syrian.png" className="relative w-[150px] aspect-auto" />
                {version && <p className="text-xs text-text-muted">الإصدار {version}</p>}
            </div>

            <div className="relative flex-1 text-left flex flex-col justify-center items-end">
                <p>Syrian Arab Republic</p>
                <p>Ministry of Industry</p>
            </div>

        </div>
    )

}
