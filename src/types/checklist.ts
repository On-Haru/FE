export interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

export interface DateChecklist {
    date: string;
    items: ChecklistItem[];
}

