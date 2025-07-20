import { chatTypes } from "./enums/ChatTypeEnum";

export interface Chat {
    chat_id: string;
    chat_type: chatTypes;
    user_id: string;
    first_name: string;
    last_name: string;
    title: string;
    username: string;
}