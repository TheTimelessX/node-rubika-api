import { PollStatusTypes } from "./enums/PollStatusEnum";

export interface PollStatus {
    state: PollStatusTypes;
    selection_index: number; // -1 means did not select
    percent_vote_options: number[];
    total_vote: number;
    show_total_votes: boolean;
}