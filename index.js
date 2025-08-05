"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRubikaApi = void 0;
var Connection_1 = require("./connection/Connection");
var events_1 = require("events");
var NodeRubikaApi = /** @class */ (function (_super) {
    __extends(NodeRubikaApi, _super);
    function NodeRubikaApi(token, options) {
        if (options === void 0) { options = { polling: true, polling_interval: 103 }; }
        var _a, _b;
        var _this = _super.call(this) || this;
        _this.token = token;
        _this.msgids = [];
        _this.updmsg = {};
        _this.rmmsgs = [];
        _this.paymsg = [];
        _this.opts = options;
        _this.opts.polling = (_a = _this.opts.polling) !== null && _a !== void 0 ? _a : true;
        _this.opts.polling_interval = (_b = _this.opts.polling_interval) !== null && _b !== void 0 ? _b : 103;
        _this.connection = new Connection_1.Connection(token, _this);
        if (_this.opts.polling) {
            _this.start();
        }
        return _this;
    }
    NodeRubikaApi.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return _super.prototype.emit.apply(this, __spreadArray([event], args, false));
    };
    NodeRubikaApi.prototype.on = function (event, listener) {
        return _super.prototype.on.call(this, event, listener);
    };
    NodeRubikaApi.prototype.off = function (event, listener) {
        return _super.prototype.off.call(this, event, listener);
    };
    NodeRubikaApi.prototype.cleanPushedMessageIds = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.msgids = [];
                this.updmsg = {};
                this.rmmsgs = [];
                this.paymsg = [];
                return [2 /*return*/, true];
            });
        });
    };
    NodeRubikaApi.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.loopInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.connection.receiveUpdate(function (theMsg) { return __awaiter(_this, void 0, void 0, function () {
                                    var theEvents, lastMessage;
                                    var _this = this;
                                    var _a, _b;
                                    return __generator(this, function (_c) {
                                        theEvents = this.eventNames();
                                        if (theEvents.includes("close")) {
                                            clearInterval(this.loopInterval);
                                            process.off("uncaughtException", function () { });
                                            return [2 /*return*/];
                                        }
                                        if (!process.eventNames().includes("uncaughtException")) {
                                            process.on("uncaughtException", function (err) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                this.emit("error", err);
                                                return [2 /*return*/];
                                            }); }); });
                                        }
                                        lastMessage = theMsg.updates[theMsg.updates.length - 1];
                                        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "NewMessage") {
                                            if (!this.msgids.includes((_a = lastMessage.new_message) === null || _a === void 0 ? void 0 : _a.message_id)) {
                                                if (theEvents.includes("message")) {
                                                    lastMessage.new_message.chat_id = lastMessage.chat_id;
                                                    this.emit("message", lastMessage.new_message);
                                                    this.msgids.push((_b = lastMessage.new_message) === null || _b === void 0 ? void 0 : _b.message_id);
                                                    return [2 /*return*/];
                                                }
                                            }
                                        }
                                        else if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "RemovedMessage") {
                                            if (theEvents.includes("removedMessage")) {
                                                if (lastMessage.removed_message_id) {
                                                    if (!this.rmmsgs.includes(lastMessage.removed_message_id)) {
                                                        this.emit("removedMessage", { message_id: lastMessage.removed_message_id, chat_id: lastMessage.chat_id });
                                                        this.rmmsgs.push(lastMessage.removed_message_id);
                                                        return [2 /*return*/];
                                                    }
                                                }
                                            }
                                        }
                                        else if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "StartedBot" || (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "StoppedBot") {
                                            if (theEvents.includes("started") || theEvents.includes("stopped")) {
                                                this.emit((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "StartedBot" ? "started" : "stopped", lastMessage);
                                                return [2 /*return*/];
                                            }
                                        }
                                        else if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "UpdatedMessage") {
                                            if (theEvents.includes("updatedMessage")) {
                                                if (lastMessage.updated_message) {
                                                    if (!Object.keys(this.updmsg).includes(lastMessage.updated_message.message_id.toString())) {
                                                        lastMessage.updated_message.chat_id = lastMessage.chat_id;
                                                        this.emit("updatedMessage", lastMessage.updated_message);
                                                        this.updmsg[lastMessage.updated_message.message_id] = lastMessage.updated_message.text;
                                                        return [2 /*return*/];
                                                    }
                                                    else if (this.updmsg[lastMessage.updated_message.message_id] != lastMessage.updated_message.text) {
                                                        lastMessage.updated_message.chat_id = lastMessage.chat_id;
                                                        this.emit("updatedMessage", lastMessage.updated_message);
                                                        this.updmsg[lastMessage.updated_message.message_id] = lastMessage.updated_message.text;
                                                        return [2 /*return*/];
                                                    }
                                                }
                                            }
                                        }
                                        else if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) == "UpdatedPayment") {
                                            if (theEvents.includes("updatedPayment")) {
                                                if (lastMessage.updated_payment) {
                                                    if (!this.paymsg.includes(lastMessage.updated_payment.payment_id)) {
                                                        lastMessage.updated_payment.chat_id = lastMessage.chat_id;
                                                        this.emit("updatedPayment", lastMessage.updated_payment);
                                                        this.paymsg.push(lastMessage.updated_payment.payment_id);
                                                        return [2 /*return*/];
                                                    }
                                                }
                                            }
                                        }
                                        return [2 /*return*/];
                                    });
                                }); })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }, this.opts.polling_interval);
                return [2 /*return*/];
            });
        });
    };
    NodeRubikaApi.prototype.sendMessage = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        if (!(args.length == 4)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connection.execute("sendMessage", {
                                chat_id: args[0],
                                text: args[1],
                                reply_to_mesage_id: (_a = args[2]) === null || _a === void 0 ? void 0 : _a.reply_to_mesage_id,
                                inline_keypad: (_b = args[2]) === null || _b === void 0 ? void 0 : _b.inline_keypad,
                                chat_keypad: (_c = args[2]) === null || _c === void 0 ? void 0 : _c.chat_keypad,
                                chat_keypad_type: (_d = args[2]) === null || _d === void 0 ? void 0 : _d.chat_keypad_type,
                                disable_notification: [undefined, null].includes((_e = args[2]) === null || _e === void 0 ? void 0 : _e.disable_notification) ? false : (_f = args[2]) === null || _f === void 0 ? void 0 : _f.disable_notification
                            }, function (r) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    args[3](r.data);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 1:
                        _o.sent();
                        return [3 /*break*/, 9];
                    case 2:
                        if (!(args.length == 3)) return [3 /*break*/, 7];
                        if (!(typeof args[2] == "function")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.connection.execute("sendMessage", {
                                chat_id: args[0],
                                text: args[1]
                            }, function (r) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    args[2](r.data);
                                    return [2 /*return*/];
                                });
                            }); })];
                    case 3:
                        _o.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.connection.execute("sendMessage", {
                            chat_id: args[0],
                            text: args[1],
                            reply_to_mesage_id: (_g = args[2]) === null || _g === void 0 ? void 0 : _g.reply_to_mesage_id,
                            inline_keypad: (_h = args[2]) === null || _h === void 0 ? void 0 : _h.inline_keypad,
                            chat_keypad: (_j = args[2]) === null || _j === void 0 ? void 0 : _j.chat_keypad,
                            chat_keypad_type: (_k = args[2]) === null || _k === void 0 ? void 0 : _k.chat_keypad_type,
                            disable_notification: [undefined, null].includes((_l = args[2]) === null || _l === void 0 ? void 0 : _l.disable_notification) ? false : (_m = args[2]) === null || _m === void 0 ? void 0 : _m.disable_notification
                        })];
                    case 5:
                        _o.sent();
                        _o.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        if (!(args.length == 2)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.connection.execute("sendMessage", {
                                chat_id: args[0],
                                text: args[1],
                            })];
                    case 8:
                        _o.sent();
                        _o.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return NodeRubikaApi;
}(events_1.EventEmitter));
exports.NodeRubikaApi = NodeRubikaApi;
// let nra = new NodeRubikaApi("BAIDD0ENHSSABISFPXKXFTUXTHYULOXXDBHOPBVNLGPZGTJDHQWKCUSWYSSNYMZP", { polling_interval: 103, polling: false });
// nra.sendMessage(
//     "b0FkJg90Cub0c514f5d49da683f84d16",
//     "hi",
//     {
//         reply_to_message_id: 3,
//         inline_keypad: {
//             one_time_keyboard: false,
//             resize_keyboard: true,
//             rows: [
//                 {
//                     buttons: [
//                         {
//                             type: "Simple",
//                             id: "sayHElloworld",
//                             button_text: "HHHHH"
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
