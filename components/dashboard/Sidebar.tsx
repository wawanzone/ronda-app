import { LayoutDashboard, PieChart, TrendingUp, Settings } from "lucide-react";

export function Sidebar() {
    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm h-full p-4">
            <div className="space-y-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Menu
                    </h2>
                    <div className="space-y-1">
                        <button className="w-full text-left px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-md transition-colors hover:bg-primary/20">
                            <div className="flex items-center gap-3">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-md">
                            <div className="flex items-center gap-3">
                                <PieChart className="h-4 w-4" />
                                Laporan
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-md">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-4 w-4" />
                                Analisis
                            </div>
                        </button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Pengaturan
                    </h2>
                    <div className="space-y-1">
                        <button className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-md">
                            <div className="flex items-center gap-3">
                                <Settings className="h-4 w-4" />
                                Umum
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
