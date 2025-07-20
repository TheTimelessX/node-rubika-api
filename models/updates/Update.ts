import { Message } from "./Message";
import { UpdateTypes } from "../enums/UpdateTypeEnum";
import { PaymentStatus } from "../PaymentStatus";

export interface Update {
    type: UpdateTypes;
    chat_id: string;
    removed_message_id?: string;
    new_message: Message;
    updated_message?: Message;
    updated_payment?: PaymentStatus;
}