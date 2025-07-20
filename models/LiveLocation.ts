import { Location } from "./Location";
import { LiveLocationStatusTypes } from "./enums/LiveLocationStatusEnum";

export interface LiveLocation {
    start_time: string;
    live_period: number; // in seconds
    current_location: Location;
    user_id: string;
    status: LiveLocationStatusTypes;
    last_update_time: string;
}