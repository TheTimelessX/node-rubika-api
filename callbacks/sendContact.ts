import { Keypad } from "../models/keypads/Keypad";
import { ChatKeypadType } from "../models/enums/ChatKeypadTypeEnum";

export interface SendContactCallback {
    message_id: number | string;
}

export interface SendContactOptions {
    reply_to_message_id?: number | string;
    inline_keypad?: Keypad;
    chat_keypad?: Keypad;
    chat_keypad_type?: ChatKeypadType;
    disable_notification?: boolean;
}