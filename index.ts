import { Connection } from "./connection/Connection";
import { Update } from "./models/updates/Update";
import { Message } from "./models/updates/Message";
import { PaymentStatus } from "./models/PaymentStatus";
import { BotCommand } from "./models/BotCommand";
import { SendMessageCallback, SendMessageOptions,
         SendPollCallback
 } from "./callbacks/sendMessage";
import { EventEmitter } from "events";

interface ConstructorOptions {
    polling?: boolean;
    polling_interval?: number;
}

interface RemovedMessage {
    message_id: string;
    chat_id: string;
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

    sendMessage(chat_id: string, text: string, options: SendMessageOptions, callback: (data: SendMessageCallback) => void): Promise<void>;
    sendMessage(chat_id: string, text: string, options: SendMessageOptions): Promise<void>;
    sendMessage(chat_id: string, text: string, callback: (data: SendMessageCallback) => void): Promise<void>;
    sendMessage(chat_id: string, text: string): Promise<void>;

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

    sendPoll(chat_id: string, question: string, options: string[], callback: (data: SendPollCallback) => void): Promise<void>;
    sendPoll(chat_id: string, question: string, options: string[]): Promise<void>;

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

}

// let nra = new NodeRubikaApi("BAIDD0ENHSSABISFPXKXFTUXTHYULOXXDBHOPBVNLGPZGTJDHQWKCUSWYSSNYMZP", { polling_interval: 103, polling: true });

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