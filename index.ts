import { SendMessageCallback, SendMessageOptions, SendPollCallback } from "./callbacks/sendMessage";
import { SendLocationCallback, SendLocationOptions } from "./callbacks/sendLocation";
import { SendContactCallback, SendContactOptions } from "./callbacks/sendContact";
import { ForwardMessageCallback, ForwardMessageOptions } from "./callbacks/forwardMessage";
import {
    EditMessageTextCallback, EditMessageTextOptions,
    EditMessageKeypadOptions, EditMessageKeypadCallback
} from "./callbacks/editMessageText";
import { Chat } from "./models/Chat";
import { Connection } from "./connection/Connection";
import { Update } from "./models/updates/Update";
import { Message } from "./models/updates/Message";
import { PaymentStatus } from "./models/PaymentStatus";
import { BotCommand } from "./models/BotCommand";
import { EventEmitter } from "events";

interface ConstructorOptions {
    polling?: boolean;
    polling_interval?: number;
}

interface RemovedMessage {
    message_id: string | number;
    chat_id: string | number;
}

interface ActualEvents {
    message: (message: Message) => void;
    removedMessage: (message: RemovedMessage) => void;
    updatedMessage: (message: Message | undefined) => void;
    updatedPayment: (payment: PaymentStatus | undefined) => void;
    started: (message: Update) => void;
    stopped: (message: Update) => void;
    error: (errorMessage: any | string | Error) => void;
    close: () => void;
}


export class NodeRubikaApi extends EventEmitter {
    private connection: Connection;
    private token: string;
    private loopInterval: NodeJS.Timeout;
    private msgids: string[]; // stop repeat emitting a message
    private updmsg: any;
    private rmmsgs: string[];
    private paymsg: string[];
    private opts: ConstructorOptions;
    
    constructor(token: string, options: ConstructorOptions = { polling: true, polling_interval: 103 }){
        super();
        this.token = token;
        this.msgids = [];
        this.updmsg = {};
        this.rmmsgs = [];
        this.paymsg = [];
        this.opts = options;
        this.opts.polling = this.opts.polling ?? true;
        this.opts.polling_interval = this.opts.polling_interval ?? 103;
        this.connection = new Connection(token, this);
        if (this.opts.polling){
            this.start();
        }
    }

    emit<K extends keyof ActualEvents>(event: K, ...args: Parameters<ActualEvents[K]>): boolean {
        return super.emit(event, ...args);
    }

    on<K extends keyof ActualEvents>(event: K, listener: ActualEvents[K]): this {
        return super.on(event, listener);
    }

    off<K extends keyof ActualEvents>(event: K, listener: ActualEvents[K]): this {
        return super.off(event, listener);
    }

    async cleanPushedMessageIds(): Promise<boolean> {
        this.msgids = [];
        this.updmsg = {};
        this.rmmsgs = [];
        this.paymsg = [];
        return true;
    }

    private async start(){
        this.loopInterval = setInterval(async () => {
            await this.connection.receiveUpdate(async (theMsg) => {
                let theEvents = this.eventNames();
                if (theEvents.includes("close")){ clearInterval(this.loopInterval); process.off("uncaughtException", () => {}); return; }
                if (!process.eventNames().includes("uncaughtException")){ process.on("uncaughtException", async (err) => { this.emit("error", err); }) }
                let lastMessage = theMsg.updates[theMsg.updates.length - 1];
                if (lastMessage?.type == "NewMessage"){
                    if (!this.msgids.includes(lastMessage.new_message?.message_id)){
                        if (theEvents.includes("message")){
                            lastMessage.new_message.chat_id = lastMessage.chat_id;
                            this.emit("message", lastMessage.new_message);
                            this.msgids.push(lastMessage.new_message?.message_id);
                            return;
                        }
                    }
                } else if (lastMessage?.type == "RemovedMessage"){
                    if (theEvents.includes("removedMessage")){
                        if (lastMessage.removed_message_id){
                            if (!this.rmmsgs.includes(lastMessage.removed_message_id)){
                                this.emit("removedMessage", { message_id: lastMessage.removed_message_id, chat_id: lastMessage.chat_id });
                                this.rmmsgs.push(lastMessage.removed_message_id);
                                return;
                            }
                        }
                    }
                } else if (lastMessage?.type == "StartedBot" || lastMessage?.type == "StoppedBot"){
                    if (theEvents.includes("started") || theEvents.includes("stopped")){
                        this.emit(lastMessage?.type == "StartedBot" ? "started" : "stopped", lastMessage);
                        return;
                    }
                } else if (lastMessage?.type == "UpdatedMessage"){
                    if (theEvents.includes("updatedMessage")){
                        if (lastMessage.updated_message){
                            if (!Object.keys(this.updmsg).includes(lastMessage.updated_message.message_id.toString())){
                                lastMessage.updated_message.chat_id = lastMessage.chat_id;
                                this.emit("updatedMessage", lastMessage.updated_message);
                                this.updmsg[lastMessage.updated_message.message_id] = lastMessage.updated_message.text;
                                return;
                            } else if (this.updmsg[lastMessage.updated_message.message_id] != lastMessage.updated_message.text){
                                lastMessage.updated_message.chat_id = lastMessage.chat_id;
                                this.emit("updatedMessage", lastMessage.updated_message);
                                this.updmsg[lastMessage.updated_message.message_id] = lastMessage.updated_message.text;
                                return;
                            }
                        }
                    }
                } else if (lastMessage?.type == "UpdatedPayment"){
                    if (theEvents.includes("updatedPayment")){
                        if (lastMessage.updated_payment){
                            if (!this.paymsg.includes(lastMessage.updated_payment.payment_id)){
                                lastMessage.updated_payment.chat_id = lastMessage.chat_id;
                                this.emit("updatedPayment", lastMessage.updated_payment);
                                this.paymsg.push(lastMessage.updated_payment.payment_id);
                                return;
                            }
                        }
                    }
                }
            })
        }, this.opts.polling_interval);
    }

    sendMessage(chat_id: string | number, text: string, options: SendMessageOptions, callback: (data: SendMessageCallback) => void): Promise<void>;
    sendMessage(chat_id: string | number, text: string, options: SendMessageOptions): Promise<void>;
    sendMessage(chat_id: string | number, text: string, callback: (data: SendMessageCallback) => void): Promise<void>;
    sendMessage(chat_id: string | number, text: string): Promise<void>;

    async sendMessage(...args){
        if (args.length == 4){
            await this.connection.execute("sendMessage", {
                chat_id: args[0],
                text: args[1],
                reply_to_mesage_id: args[2]?.reply_to_mesage_id,
                inline_keypad: args[2]?.inline_keypad,
                chat_keypad: args[2]?.chat_keypad,
                chat_keypad_type: args[2]?.chat_keypad_type,
                disable_notification: [undefined, null].includes(args[2]?.disable_notification) ? false : args[2]?.disable_notification
            }, async (r) => {
                args[3](r.data);
            })
        } else if (args.length == 3){
            if (typeof args[2] == "function"){
                await this.connection.execute("sendMessage", {
                    chat_id: args[0],
                    text: args[1]
                }, async (r) => {
                    args[2](r.data);
                })
            } else {
                await this.connection.execute("sendMessage", {
                    chat_id: args[0],
                    text: args[1],
                    reply_to_mesage_id: args[2]?.reply_to_mesage_id,
                    inline_keypad: args[2]?.inline_keypad,
                    chat_keypad: args[2]?.chat_keypad,
                    chat_keypad_type: args[2]?.chat_keypad_type,
                    disable_notification: [undefined, null].includes(args[2]?.disable_notification) ? false : args[2]?.disable_notification
                })
            }
        } else if (args.length == 2){
            await this.connection.execute("sendMessage", {
                chat_id: args[0],
                text: args[1],
            })
        }
    }

    sendPoll(chat_id: string | number, question: string, options: string[], callback: (data: SendPollCallback) => void): Promise<void>;
    sendPoll(chat_id: string | number, question: string, options: string[]): Promise<void>;

    async sendPoll(...args){
        if (args.length == 4){
            await this.connection.execute("sendPoll", {
                chat_id: args[0],
                question: args[1],
                options: args[2]
            }, async (r) => {
                args[3](r);
            })
        } else if (args.length == 3){
            await this.connection.execute("sendPoll", {
                chat_id: args[0],
                question: args[1],
                options: args[2]
            })
        }
    }

    setCommand(commands: BotCommand[], callback: (data: any) => void): Promise<void>;
    setCommand(commands: BotCommand[]): Promise<void>;

    async setCommand(...args){
        if (args.length == 2){
            await this.connection.execute("setCommands", {
                bot_commands: args[0]
            }, async (r) => {
                args[1](r);
            })
        } else if (args.length == 1){
            await this.connection.execute("setCommands", {
                bot_commands: args[0]
            })
        }
    }

    sendLocation(chat_id: string | number, latitude: string, longitude: string, options: SendLocationOptions, callback: (data: SendLocationCallback) => void): Promise<void>;
    sendLocation(chat_id: string | number, latitude: string, longitude: string, options: SendLocationOptions): Promise<void>;
    sendLocation(chat_id: string | number, latitude: string, longitude: string, callback: (data: SendLocationCallback) => void): Promise<void>;
    sendLocation(chat_id: string | number, latitude: string, longitude: string): Promise<void>;

    async sendLocation(...args){
        if (args.length == 5){
            await this.connection.execute("sendLocation", {
                chat_id: args[0],
                latitude: args[1],
                longitude: args[2],
                reply_to_mesage_id: args[3]?.reply_to_mesage_id,
                inline_keypad: args[3]?.inline_keypad,
                chat_keypad: args[3]?.chat_keypad,
                chat_keypad_type: args[3]?.chat_keypad_type,
                disable_notification: [undefined, null].includes(args[3]?.disable_notification) ? false : args[3]?.disable_notification
            }, async (r) => {
                args[4](r);
            })
        } else if (args.length == 4){
            if (typeof args[3] == 'function'){
                await this.connection.execute("sendLocation", {
                    chat_id: args[0],
                    latitude: args[1],
                    longitude: args[2]
                }, async (r) => {
                    args[3](r);
                })
            } else {
                await this.connection.execute("sendLocation", {
                    chat_id: args[0],
                    latitude: args[1],
                    longitude: args[2],
                    reply_to_mesage_id: args[3]?.reply_to_mesage_id,
                    inline_keypad: args[3]?.inline_keypad,
                    chat_keypad: args[3]?.chat_keypad,
                    chat_keypad_type: args[3]?.chat_keypad_type,
                    disable_notification: [undefined, null].includes(args[3]?.disable_notification) ? false : args[3]?.disable_notification
                })
            }
        } else if (args.length == 3){
            await this.connection.execute("sendLocation", {
                chat_id: args[0],
                latitude: args[1],
                longitude: args[2]
            })
        }
    }

    sendContact(chat_id: string | number, first_name: string, last_name: string, phone_number: string, options: SendContactOptions, callback: (data: SendContactCallback) => void): Promise<void>;
    sendContact(chat_id: string | number, first_name: string, last_name: string, phone_number: string, options: SendContactOptions): Promise<void>;
    sendContact(chat_id: string | number, first_name: string, last_name: string, phone_number: string, callback: (data: SendContactCallback) => void): Promise<void>;
    sendContact(chat_id: string | number, first_name: string, last_name: string, phone_number: string): Promise<void>;

    async sendContact(...args){
        if (args.length == 6){
            await this.connection.execute("sendContact", {
                chat_id: args[0],
                first_name: args[1],
                last_name: args[2],
                phone_number: args[3],
                reply_to_mesage_id: args[4]?.reply_to_mesage_id,
                inline_keypad: args[4]?.inline_keypad,
                chat_keypad: args[4]?.chat_keypad,
                chat_keypad_type: args[4]?.chat_keypad_type,
                disable_notification: [undefined, null].includes(args[4]?.disable_notification) ? false : args[4]?.disable_notification
            }, async (r) => {
                args[5](r);
            })
        } else if (args.length == 5){
            if (typeof args[4] == 'function'){
                await this.connection.execute("sendContact", {
                    chat_id: args[0],
                    first_name: args[1],
                    last_name: args[2],
                    phone_number: args[3]
                }, async (r) => {
                    args[4](r);
                })
            } else {
                await this.connection.execute("sendContact", {
                    chat_id: args[0],
                    first_name: args[1],
                    last_name: args[2],
                    phone_number: args[3],
                    reply_to_mesage_id: args[4]?.reply_to_mesage_id,
                    inline_keypad: args[4]?.inline_keypad,
                    chat_keypad: args[4]?.chat_keypad,
                    chat_keypad_type: args[4]?.chat_keypad_type,
                    disable_notification: [undefined, null].includes(args[4]?.disable_notification) ? false : args[4]?.disable_notification
                })
            }
        } else {
            await this.connection.execute("sendContact", {
                chat_id: args[0],
                first_name: args[1],
                last_name: args[2],
                phone_number: args[3]
            })
        }
    }

    getChat(chat_id: string | number, callback: (data: Chat) => void): Promise<void>;
    getChat(chat_id: string | number): Promise<void>;

    async getChat(...args){
        if (args.length == 2){
            await this.connection.execute("getChat", {
                chat_id: args[0]
            }, async (r) => {
                args[1](r);
            })
        } else if (args.length == 1){
            await this.connection.execute("getChat", {
                chat_id: args[0]
            })
        }
    }

    forwardMessage(chat_id: string | number, options: ForwardMessageOptions, callback: (data: ForwardMessageCallback) => void): Promise<void>;
    forwardMessage(chat_id: string | number, options: ForwardMessageOptions): Promise<void>;

    async forwardMessage(...args){
        if (!args[1].from_chat_id){
            throw new Error(`there is no 'from_chat_id' parameter in "forwardMessage" ( second arg )`);
        }

        if (args.length == 3){
            await this.connection.execute("forwardMessage", {
                to_chat_id: args[0],
                from_chat_id: args[1].from_chat_id,
                disable_notification: [undefined, null].includes(args[1]?.disable_notification) ? false : args[1]?.disable_notification
            }, async (r) => {
                args[2](r);
            })
        } else if (args.length == 2){
            await this.connection.execute("forwardMessage", {
                to_chat_id: args[0],
                from_chat_id: args[1].from_chat_id,
                disable_notification: [undefined, null].includes(args[1]?.disable_notification) ? false : args[1]?.disable_notification
            })
        }
    }

    editMessageText(text: string, options: EditMessageTextOptions, callback: (data: EditMessageTextCallback) => void): Promise<void>;
    editMessageText(text: string, options: EditMessageTextOptions): Promise<void>;

    async editMessageText(...args){
        if (!args[1].chat_id || !args[1].message_id){
            throw new Error(`there is no 'chat_id' or 'message_id' parameter in "editMessageText" ( second arg )`);
        }

        if (args.length == 3){
            await this.connection.execute("editMessageText", {
                text: args[0],
                chat_id: args[1].chat_id,
                message_id: args[1].message_id
            }, async (r) => {
                args[2](r)
            })
        } else if (args.length == 2){
            await this.connection.execute("editMessageText", {
                text: args[0],
                chat_id: args[1].chat_id,
                message_id: args[1].message_id
            })
        }
    }

    editMessageKeypad(chat_id: string | number, options: EditMessageKeypadOptions, callback: (data: EditMessageKeypadCallback) => void): Promise<void>;
    editMessageKeypad(chat_id: string | number, options: EditMessageKeypadOptions): Promise<void>;

    async editMessageKeypad(...args){
        if (!args[1].chat_id || !args[1].message_id){
            throw new Error(`there is no 'message_id' or 'inline_keypad' parameter in "editMessageKeypad" ( second arg )`);
        }

        if (args.length == 3){
            await this.connection.execute("editMessageKeypad", {
                chat_id: args[0],
                message_id: args[1].message_id,
                inline_keypad: args[1].inline_keypad
            }, async (r) => {
                args[2](r);
            })
        } else if (args.length == 2){
            await this.connection.execute("editMessageKeypad", {
                chat_id: args[0],
                message_id: args[1].message_id,
                inline_keypad: args[1].inline_keypad
            })
        }
    }

    deleteMessage(chat_id: string | number, message_id: string | number, callback: (data: any) => void): Promise<void>;
    deleteMessage(chat_id: string | number, message_id: string | number): Promise<void>;

    async deleteMessage(...args){
        if (args.length == 3){
            await this.connection.execute("deleteMessage", {
                chat_id: args[0],
                message_id: args[1],
            }, async (r) => {
                args[2](r);
            })
        } else if (args.length == 2){
            await this.connection.execute("deleteMessage", {
                chat_id: args[0],
                message_id: args[1],
            })  
        }
    }
}

// let nra = new NodeRubikaApi("BAIDD0ENHSSABISFPXKXFTUXTHYULOXXDBHOPBVNLGPZGTJDHQWKCUSWYSSNYMZP", { polling_interval: 103, polling: true });
// nra.deleteMessage("b0FkJg90Cub0c514f5d49da683f84d16",
//     1375947995037921000, async (r) => {
//     console.log(r)
// })

// nra.sendMessage(
//     "b0FkJg90Cub0c514f5d49da683f84d16",
//     "Hello world 1",
//     async (r) => {
//         console.log(r) // { message_id: 1375947995037921000 }
//     }
// )

// nra.setCommand(
//     [{
//         command: "say",
//         description: "say something"
//     }],
//     async (x) => {
//         console.log(x)
//     }
// )

// nra.sendPoll(
//     "b0FkJg90Cub0c514f5d49da683f84d16",
//     "How you doing?",
//     [
//         "good",
//         "cool",
//         "fine",
//         "bad"
//     ],
//     async (x) => {
//         console.log(x)
//     }
// )

// nra.on("message", async (msg) => {
//     if (msg.text.startsWith("/start")){
//         console.log(msg)
//         await nra.sendMessage(
//             "b0GPgAs0465b529387cde6e40808aecc",
//             `Hello`
//         )
//     }
// })

// nra.on("message", async (msg) => {
//     if (msg.aux_data){
//         console.log(msg.aux_data)
//     }
// })

// nra.sendMessage(
//     "b0FkJg90Cub0c514f5d49da683f84d16",
//     "hi",
//     {
//         reply_to_message_id: 3,
//         // chat_keypad_type: 'New',
//         // chat_keypad: {
//         //     resize_keyboard: true,
//         //     one_time_keyboard: false,
//         //     rows: [
//         //         {
//         //             buttons: [
//         //                 {
//         //                     button_text: "Hello world",
//         //                     type: "Simple",
//         //                     id: "tttt"
//         //                 }
//         //             ]
//         //         }
//         //     ]
//         // }
//         inline_keypad: {
//             one_time_keyboard: true,
//             resize_keyboard: true,
//             rows: [
//                 {
//                     buttons: [
//                         {
//                             type: "Simple",
//                             id: "sayHElloworld",
//                             button_text: "HHHHH"
//                         },
//                         {
//                             type: "Simple",
//                             id: "kkhh",
//                             button_text: "okkkkk"
//                         }
//                     ]
//                 },
//                 {
//                     buttons: [
//                         {
//                             type: 'Simple',
//                             id: "No",
//                             button_text: "close"
//                         }
//                     ]
//                 }
//             ]
//         }
//     }
// )

// nra.on("updatedMessage", async (yousure) => {
//     console.log(yousure)
// })

// nra.on("removedMessage", async (a) => {
//     console.log(a);
// })

// nra.on("error", async (er) => {
//     console.log(er)
// })