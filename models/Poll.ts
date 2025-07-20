import { PollStatus } from "./PollStatus";

export interface Poll {
    question: string;
    options: string[];
    poll_status: PollStatus;
}