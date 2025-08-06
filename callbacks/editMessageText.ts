import { Keypad } from "../models/keypads/Keypad";

export interface EditMessageTextCallback {
    message_id: number | string;
}

export interface EditMessageTextOptions {
    chat_id: number | string;
    message_id: number | string;
}

export interface EditMessageKeypadCallback extends EditMessageTextCallback {}

export interface EditMessageKeypadOptions {
    message_id: number | string;
    inline_keypad: Keypad;
}