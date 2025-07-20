import { File } from "./File";

export interface Sticker {
    sticker_id: string;
    file: File;
    emoji_character: string;
}