import { ButtonLocationTypes } from "../enums/ButtonLocationTypeEnum";
import { Location } from "../Location";

export interface ButtonLocation {
    default_pointer_location: Location;
    default_map_location: Location;
    type: ButtonLocationTypes;
    title?: string;
    location_image_url: string;
}