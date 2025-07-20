import { ForwardedFromTypes } from "./enums/ForwardedFromEnum";

export interface ForwardedFrom {
    type_from: ForwardedFromTypes;
    message_id: string;
    from_chat_id: string;
    from_sender_id: string;
}