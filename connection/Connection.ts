import * as axios from "axios";
import { Update } from "../models/updates/Update";
import { EventEmitter } from "events";

interface UpdateRaw {
    updates: Update[];
    next_offset_id: string;
}

export class Connection {
    private url: string;
    private theEmitter: EventEmitter

    constructor(token: string, emitter: EventEmitter){
        this.url = `https://botapi.rubika.ir/v3/${token}`;
        this.theEmitter = emitter;
    }

    async receiveUpdate(callback: (message: UpdateRaw) => void = () => {}){
        await axios.post(`https://botapi.rubika.ir/v3/BAIDD0ENHSSABISFPXKXFTUXTHYULOXXDBHOPBVNLGPZGTJDHQWKCUSWYSSNYMZP/getUpdates`).then(async (resp) => {
            if (resp.data.status == "OK"){
                callback({
                    updates: resp.data.data.updates,
                    next_offset_id: resp.data.data.next_offset_id
                });
                return;
            } else {
                this.theEmitter.emit("error", resp.data);
                return;
            }
        })
    }

}


// sample

// let token = "BAIDD0ENHSSABISFPXKXFTUXTHYULOXXDBHOPBVNLGPZGTJDHQWKCUSWYSSNYMZP";

// let n = new Connection(token);

// n.receiveUpdate(async (msgs) => {
//     console.log(msgs.updates[0])
// })