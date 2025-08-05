import { ButtonTypes } from "./enums/ButtonTypeEnum";
import { ButtonLocation } from "./buttons/ButtonLocation";
import { ButtonSelection } from "./buttons/ButtonSelection";
import { ButtonCalendar } from "./buttons/ButtonCalendar";
import { ButtonNumberPicker } from "./buttons/ButtonNumberPicker";
import { ButtonStringPicker } from "./buttons/ButtonStringPicker";
import { ButtonTextbox } from "./buttons/ButtonTextbox";

export interface Button {
    id: string;
    type: ButtonTypes;
    button_text: string;
    button_selection?: ButtonSelection;
    button_location?: ButtonLocation;
    button_number_picker?: ButtonNumberPicker;
    button_string_picker?: ButtonStringPicker;
    button_calendar?: ButtonCalendar;
    button_textbox?: ButtonTextbox;
}