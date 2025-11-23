export interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

export interface DateChecklist {
    date: string;
    items: ChecklistItem[];
    status?: 'NONE' | 'PLANNED' | 'PARTIAL' | 'COMPLETE' | 'MISSED';
    takenRatio?: number;
    requiredCount?: number;
    takenCount?: number;
}

