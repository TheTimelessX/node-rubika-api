import { ButtonSelectionItem } from "./ButtonSelectionItem";

export interface ButtonSelection {
    selection_id: string;
    search_type: string;
    get_type: string;
    items: ButtonSelectionItem[];
    is_multi_selection: boolean;
    columns_count: string;
    title: string;
}