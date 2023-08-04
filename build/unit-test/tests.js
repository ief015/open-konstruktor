"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const npn_1 = __importDefault(require("./tests/npn"));
const pnp_1 = __importDefault(require("./tests/pnp"));
const sr_latch_1 = __importDefault(require("./tests/sr-latch"));
const tests = {
    npn: npn_1.default,
    pnp: pnp_1.default,
    srlatch: sr_latch_1.default,
};
exports.default = tests;
