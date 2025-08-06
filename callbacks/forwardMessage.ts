export interface ForwardMessageCallback {
    new_message_id: number | string;
}

export interface ForwardMessageOptions {
    from_chat_id: number | string;
    disable_notification?: boolean;
}