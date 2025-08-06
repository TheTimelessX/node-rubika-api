import { Keypad } from "../models/keypads/Keypad";
import { ChatKeypadType } from "../models/enums/ChatKeypadTypeEnum";

export interface ForwardMessageCallback {
    new_message_id: number | string;
}

export interface ForwardMessageOptions {
    from_chat_id: number | string;
    disable_notification?: boolean;
}