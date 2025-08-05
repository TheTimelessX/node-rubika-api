import { Keypad } from "../models/keypads/Keypad";
import { ChatKeypadType } from "../models/enums/ChatKeypadTypeEnum";

export interface SendMessageCallback {
    message_id: number;
}

export interface SendMessageOptions {
    reply_to_message_id?: number;
    inline_keypad?: Keypad;
    chat_keypad?: Keypad;
    chat_keypad_type?: ChatKeypadType;
    disable_notification?: boolean;
}