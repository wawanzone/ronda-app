import { LucideIcon, ChevronRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface SummaryCardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    className?: string;
    iconClassName?: string;
    onClick?: () => void;
}

export function SummaryCard({ title, amount, icon: Icon, className, iconClassName, onClick }: SummaryCardProps) {
    return (
        <div
            className={cn(
                "card flex flex-col group min-h-[150px]",
                onClick && "cursor-pointer hover:-translate-y-1 hover:border-[#63d8a3]/40 active:scale-[0.99]",
                className
            )}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            } : undefined}
        >
            <div className="flex flex-row items-center justify-between pb-3">
                <span className="text-label font-medium">{title}</span>
                <div className={cn("p-2 rounded-lg bg-background-primary/60 border border-border-tertiary", iconClassName)}>
                    <Icon className="h-4 w-4 text-text-secondary opacity-90" />
                </div>
            </div>
            <div className="mt-auto">
                <div className="text-value-large">{formatCurrency(amount)}</div>
                {onClick && (
                    <div className="text-[13px] text-text-secondary mt-3 flex items-center gap-1 group-hover:text-text-primary transition-colors">
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
}

