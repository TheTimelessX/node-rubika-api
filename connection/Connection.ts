import * as axios from "axios";
import { Update } from "../models/updates/Update";
import { EventEmitter } from "events";

interface UpdateRaw {
    updates: Update[];
    next_offset_id: string;
}

export class Connection {
    private token: string;
    private url: string;
    private theEmitter: EventEmitter

    constructor(token: string, emitter: EventEmitter){
        this.token = token;
        this.url = `https://botapi.rubika.ir/v3/${this.token}`;
        this.theEmitter = emitter;
    }

    async receiveUpdate(callback: (message: UpdateRaw) => void = () => {}){
        await axios.post(`https://botapi.rubika.ir/v3/${this.token}/getUpdates`, "{}", { headers: { "Content-Type": "application/json" } }).then(async (resp) => {
            if (resp.data){
                if (resp.status == 200){
                    if (resp.data['status'] == "OK"){
                        callback({
                            updates: resp.data['data']['updates'],
                            next_offset_id: resp.data['data']['next_offset_id']
                        });
                        return;
                    } else {
                        callback({
                            updates: [],
                            next_offset_id: ""
                        });
                        this.theEmitter.emit("error", resp.data);
                        return;
                    }
                } else {
                    this.theEmitter.emit("error", resp.data);
                    return;
                }
            } else {
                this.theEmitter.emit("error", "no data found");
                return;
            }
        })
    }

    async execute(method: string, input: any, callback: (data: any) => void = () => {}){
        await axios.post(`${this.url}/${method}`, input).then(async (resp) => {
            if (resp.data){
                if (resp.status == 200){
                    if (resp.data['status'] == "OK"){
                        callback(resp.data);
                        return;
                    } else {
                        this.theEmitter.emit("error", resp.data);
                        return;
                    }
                } else {
                    this.theEmitter.emit("error", resp.data);
                    return;
                }
            } else {
                this.theEmitter.emit("error", "no data found");
                return;
            }
        })
    }

}