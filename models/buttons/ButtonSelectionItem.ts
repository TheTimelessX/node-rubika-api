import { ButtonSelectionTypes } from "../enums/ButtonSelectionTypeEnum";

export interface ButtonSelectionItem {
    text: string;
    image_url: string;
    type: ButtonSelectionTypes;
}