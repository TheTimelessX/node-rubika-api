import { File } from "./File";

export interface Bot {
    bot_id: string;
    bot_title: string;
    avatar: File;
    description: string;
    username: string;
    start_message: string;
    share_url: string;
}