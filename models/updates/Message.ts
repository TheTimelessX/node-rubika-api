import { AuxData } from "../AuxData";
import { Location } from "../Location";
import { ContactMessage } from "../ContactMessage";
import { File } from "../File";
import { ForwardedFrom } from "../ForwardedFrom";
import { Sticker } from "../Sticker";
import { Poll } from "../Poll";
import { LiveLocation } from "../LiveLocation";
import { MessageSenderTypes } from "../enums/MessageSenderEnum";

export interface Message {
    message_id: string;
    text: string;
    time: number;
    is_edited: boolean;
    sender_type: MessageSenderTypes;
    sender_id: string;
    aux_data?: AuxData;
    file?: File;
    reply_to_message_id?: string;
    forwarded_from?: ForwardedFrom;
    forwarded_no_link?: string;
    location?: Location;
    sticker?: Sticker;
    contact_message?: ContactMessage;
    poll?: Poll;
    live_location?: LiveLocation;
    chat_id: string;
}