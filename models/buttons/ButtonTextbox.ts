import { ButtonTextboxTypeKeypad } from "../enums/ButtonTextboxTypeKeypadEnum";
import { ButtonTextboxTypeLine } from "../enums/ButtonTextboxTypeLineEnum";

export interface ButtonTextbox {
    type_inline: ButtonTextboxTypeLine;
    type_keypad: ButtonTextboxTypeKeypad;
    place_holder?: string;
    title?: string;
    default_value?: string;
}