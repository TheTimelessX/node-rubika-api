import { AuxData } from "../AuxData";
import { Location } from "../Location";
import { File } from "../File";

export interface InlineMessage {
    sender_id: string;
    text: string;
    file?: File;
    location?: Location;
    aux_data?: AuxData;
    message_id: string;
    chat_id: string;
}