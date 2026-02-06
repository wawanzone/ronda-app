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
                "card flex flex-col",
                onClick && "cursor-pointer hover:bg-bg-secondary/50 transition-colors active:scale-[0.98]",
                className
            )}
            onClick={onClick}
        >
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-label mb-0">{title}</h3>
                <Icon className={cn("h-4 w-4 text-text-muted opacity-70", iconClassName)} />
            </div>
            <div className="pt-2">
                <div className="text-value text-lg sm:text-2xl tracking-tight">{formatCurrency(amount)}</div>
                {onClick && (
                    <div className="text-xs text-accent-blue mt-2 flex items-center gap-0.5 font-medium">
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3 h-3" />
                    </div>
                )}
            </div>
        </div>
    );
}
