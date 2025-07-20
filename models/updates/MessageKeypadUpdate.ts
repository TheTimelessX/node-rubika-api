import { Keypad } from "../keypads/Keypad";

export interface MessageKeypadUpdate {
    message_id: string;
    inline_keypad: Keypad;
}