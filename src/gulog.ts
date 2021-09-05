import { AsyncLocalStorage } from "async_hooks";
import * as Gulog from "gulog-js";
import { Process } from "gulog-js";

let store = new AsyncLocalStorage<Gulog.Process>();

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
export function withProcess<T>(type: string, callback: () => T): T;
export function withProcess<T>(type: string, initiatorData: Gulog.InitiatorData, callback: () => T): T;
export function withProcess<T>(
    type: string,
    initiatorData: Gulog.InitiatorData,
    overrideSettings: Gulog.Settings & { autoEnd: boolean },
    callback: () => T
): T;
export function withProcess<T>(type: string, arg0: any, arg1?: any, arg2?: any): T {
    let parentProcess = store.getStore();

    let callback: () => T,
        initiatorData: Gulog.InitiatorData | undefined = undefined,
        settings: (Gulog.Settings & { autoEnd: boolean }) | undefined = undefined;
    if (typeof arg0 === "function") {
        callback = arg0;
    } else if (typeof arg1 === "function") {
        initiatorData = arg0;
        callback = arg1;
    } else {
        initiatorData = arg0;
        settings = arg1;
        callback = arg2;
    }

    let process = new Process(type, initiatorData, parentProcess, settings);
    let result = store.run(process, callback);

    if (!process.ended && settings?.autoEnd !== false) {
        if (result instanceof Promise) {
            result.then(() => process.end(0));
        } else {
            process.end(0);
        }
    }

    return result;
}

export function getCurrentProcess() {
    let p = store.getStore();
    if (!p) throw new Error("There is no running Gulog process.");
    return p;
}

export function log(data: any, ...moreData: any[]) {
    let p = getCurrentProcess();
    return p.log(data, ...moreData);
}

export function warn(data: any, ...moreData: any[]) {
    let p = getCurrentProcess();
    return p.warn(data, ...moreData);
}

export function info(data: any, ...moreData: any[]) {
    let p = getCurrentProcess();
    return p.info(data, ...moreData);
}

export function error(data: any, ...moreData: any[]) {
    let p = getCurrentProcess();
    return p.error(data, ...moreData);
}

/**
 * @param exitCode An exit code describing the process exit cause, examples: `user-create-failed`, `failed`, `ok` or its number id.
 */
export function end(exitCode: string | number) {
    let p = getCurrentProcess();
    return p.end(exitCode);
}

export * from "gulog-js";
