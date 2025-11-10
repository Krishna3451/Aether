import Icons from "@/components/global/icons";
import { SettingsIcon, SunIcon, WandSparklesIcon, ShieldCheckIcon } from "lucide-react";

export const TABS = [
    {
        title: "General",
        value: "general",
        icon: SettingsIcon,
    },
    {
        title: "Theme",
        value: "theme",
        icon: SunIcon,
    },
    {
        title: "Behavior",
        value: "behavior",
        icon: WandSparklesIcon,
    },
    {
        title: "Billing",
        value: "billing",
        icon: Icons.card,
    },
    {
        title: "Security",
        value: "security",
        icon: ShieldCheckIcon,
    },
];
