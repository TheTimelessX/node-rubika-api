import { PaymentStatusTypes } from "./enums/PaymentStatusEnum";

export interface PaymentStatus {
    payment_id: string;
    status: PaymentStatusTypes;
}