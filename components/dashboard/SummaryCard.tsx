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
                "card flex flex-col group",
                onClick && "cursor-pointer hover:bg-background-primary transition-all duration-200 active:scale-[0.99]",
                className
            )}
            onClick={onClick}
        >
            <div className="flex flex-row items-center justify-between pb-3">
                <span className="text-label">{title}</span>
                <div className={cn("p-1.5 rounded-md bg-background-primary border border-border-tertiary", iconClassName)}>
                    <Icon className="h-3.5 w-3.5 text-text-secondary opacity-80" />
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

