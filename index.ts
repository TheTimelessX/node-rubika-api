import { Connection } from "./connection/Connection";
import { EventEmitter } from "events";

interface ConstructorOptions {
    polling?: boolean;
    polling_interval?: number;
}

export class NodeRubikaApi extends EventEmitter {
    private connection: Connection;
    private opts: ConstructorOptions;
    
    constructor(token: string, options: ConstructorOptions = { polling: true, polling_interval: 103 }){
        super();
        this.opts.polling = this.opts.polling ?? true;
        this.opts.polling_interval = this.opts.polling_interval ?? 103;
        this.connection = new Connection(token, this);
    }

    // getting updates

}