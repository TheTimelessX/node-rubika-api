import { KeypadRow } from "./KeypadRow";

export interface Keypad {
    rows: KeypadRow[];
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
}