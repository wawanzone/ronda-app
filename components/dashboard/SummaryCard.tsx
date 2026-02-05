import { LucideIcon } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface SummaryCardProps {
    title: string;
    amount: number;
    icon: LucideIcon;
    className?: string;
    iconClassName?: string;
}

export function SummaryCard({ title, amount, icon: Icon, className, iconClassName }: SummaryCardProps) {
    return (
        <div className={cn("card flex flex-col", className)}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-label mb-0">{title}</h3>
                <Icon className={cn("h-4 w-4 text-text-muted opacity-70", iconClassName)} />
            </div>
            <div className="pt-2">
                <div className="text-value text-lg sm:text-2xl tracking-tight">{formatCurrency(amount)}</div>
            </div>
        </div>
    );
}
