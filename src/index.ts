import { AsyncLocalStorage } from "async_hooks";
import { GulogProcess, GulogSettings, InitiatorData } from "gulog-js";

let store = new AsyncLocalStorage<GulogProcess>();

/**
 * Creates a new Gulog process with async context, which you can log to using warn, error, info ...
 *
 * You don't have to pass the gulog process to every function because this api makes use of local 'thread' storage (the nodejs async_hooks package)
 *
 * If there was already a process running in the current context, it is set as its parent process (which will be visible on the gulog dashboard).
 *
 * @param type The type of process to create.
 * @param initiatorData Custom data about the client that initiated this process.
 * @param overrideSettings Settings to override Gulog.init()
 * @param callback Every call to log, info, warn, error ... in this function will log to this newly created process.
 */
export function withGulog<T>(type: string, callback: () => T): T;
export function withGulog<T>(type: string, initiatorData: InitiatorData, callback: () => T): T;
export function withGulog<T>(type: string, initiatorData: InitiatorData, overrideSettings: GulogSettings, callback: () => T): T;
export function withGulog<T>(type: string, arg0: any, arg1?: any, arg2?: any): T {
    let parentProcess = store.getStore();
    if (typeof arg0 === "function") {
        let process = new GulogProcess(type, undefined, parentProcess);
        return store.run(process, arg0);
    } else if (typeof arg1 === "function") {
        let process = new GulogProcess(type, arg0, parentProcess);
        return store.run(process, arg1);
    } else {
        let process = new GulogProcess(type, arg0, parentProcess, arg1);
        return store.run(process, arg2);
    }
}

export * from "gulog-js";
