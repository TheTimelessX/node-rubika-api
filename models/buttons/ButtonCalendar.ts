import { ButtonCalendarTypes } from "../enums/ButtonCalendarTypeEnum";

export interface ButtonCalendar {
    default_value?: string;
    type: ButtonCalendarTypes;
    min_year: string;
    max_year: string;
    title: string;
}