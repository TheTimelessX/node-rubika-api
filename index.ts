import { Connection } from "./connection/Connection";
import { Update } from "./models/updates/Update";
import { Message } from "./models/updates/Message";
import { PaymentStatus } from "./models/PaymentStatus";
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
                if (lastMessage.type == "NewMessage"){
                    if (!this.msgids.includes(lastMessage.new_message?.message_id)){
                        if (theEvents.includes("message")){
                            lastMessage.new_message.chat_id = lastMessage.chat_id;
                            this.emit("message", lastMessage.new_message);
                            this.msgids.push(lastMessage.new_message?.message_id);
                            return;
                        }
                    }
                } else if (lastMessage.type == "RemovedMessage"){
                    if (theEvents.includes("removedMessage")){
                        if (lastMessage.removed_message_id){
                            if (!this.rmmsgs.includes(lastMessage.removed_message_id)){
                                this.emit("removedMessage", { message_id: lastMessage.removed_message_id, chat_id: lastMessage.chat_id });
                                this.rmmsgs.push(lastMessage.removed_message_id);
                                return;
                            }
                        }
                    }
                } else if (lastMessage.type == "StartedBot" || lastMessage.type == "StoppedBot"){
                    if (theEvents.includes("started") || theEvents.includes("stopped")){
                        this.emit(lastMessage.type == "StartedBot" ? "started" : "stopped", lastMessage);
                        return;
                    }
                } else if (lastMessage.type == "UpdatedMessage"){
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
                } else if (lastMessage.type == "UpdatedPayment"){
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

    async sendMessage(){
        await this.connection.execute("sendPoll", { "token": this.token,"question": "fff", "options": ["d", "g"]}, async (r) => {console.log(r)})
    }

}

let nra = new NodeRubikaApi("BAIDD0ENHSSABISFPXKXFTUXTHYULOXXDBHOPBVNLGPZGTJDHQWKCUSWYSSNYMZP", { polling_interval: 103, polling: false });

nra.sendMessage();

// nra.on("message", async (msg) => {
//     console.log(msg)
// })

// nra.on("updatedMessage", async (yousure) => {
//     console.log(yousure)
// })

// nra.on("removedMessage", async (a) => {
//     console.log(a);
// })

nra.on("error", async (er) => {
    console.log(er)
})