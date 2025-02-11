import type { ConsolaInstance, ConsolaOptions, FormatOptions, LogObject, LogType } from "consola";
import type { ColorFunction, ColorName } from "consola/utils";
import { sep } from "node:path";
import { formatWithOptions } from "node:util";
import { createConsola } from "consola";
import { colors, stripAnsi } from "consola/utils";

export const color = colors;

function getColorFn(color: ColorName = "white"): ColorFunction {
    return colors[color] || colors.white;
}

function getBgColor(color = "white"): ColorFunction {
    const firstLetter = color[0].toUpperCase();
    const rest = color.slice(1);
    const colorName: ColorName = `bg${firstLetter}${rest}` as ColorName;

    return colors[colorName] || colors.bgWhite;
}

const TYPE_COLOR_MAP: { [k in LogType]?: ColorName } = {
    error: "red",
    fatal: "bgRed",
    ready: "green",
    warn: "yellow",
    info: "blue",
    success: "magenta",
    debug: "cyan",
    trace: "gray",
    fail: "red",
    start: "blue",
    log: "white",
};

const TYPE_PREFIX: { [k in LogType]?: string } = {
    error: "ERROR",
    fatal: "FATAL",
    ready: "READY",
    warn: "WARN",
    info: "INFO",
    success: "INIT",
    debug: "DEBUG",
    trace: "TRACE",
    fail: "FAIL",
    start: "START",
    log: "",
};

const AT_TRACE_PATTERN = /^at +/;
const PARENTHESES_CONTENT_PATTERN = /\((.+)\)/;

function parseStack(stack: string): string[] {
    const cwd: string = process.cwd() + sep;

    const lines: string[] = stack
        .split("\n")
        .splice(1)
        .map(l => l.trim().replace("file://", "").replace(cwd, ""));

    return lines;
}

function formatStack(stack: string, opts: FormatOptions): string {
    const indent = "  ".repeat((opts?.errorLevel || 0) + 1);
    return `\n${indent}${parseStack(stack)
        .map(
            line =>
                `  ${line.replace(AT_TRACE_PATTERN, m => color.gray(m)).replace(PARENTHESES_CONTENT_PATTERN, (_, m) => `(${color.cyan(m)})`)}`,
        )
        .join(`\n${indent}`)}`;
}

function formatError(err: unknown, opts: FormatOptions): string {
    if (!(err instanceof Error)) {
        return formatWithOptions(opts, err);
    }

    const message: string = err.message ?? formatWithOptions(opts, err);
    const stack: string = err.stack ? formatStack(err.stack, opts) : "";

    const level: number = opts?.errorLevel || 0;
    const causedPrefix: string = level > 0 ? `${"  ".repeat(level)}[cause]: ` : "";
    const causedError: string = err.cause ? `\n\n${formatError(err.cause, { ...opts, errorLevel: level + 1 })}` : "";

    return `${causedPrefix + message}\n${stack}${causedError}`;
}

function formatTimestamp(date: Date): string {
    const _date: string = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).format(date).replace(/\./g, "/").replace(",", "");

    return color.gray(`[${_date}]`);
}

type FormatStyleFn = () => string;
type FormatStylesMap = Record<LogType | "default", FormatStyleFn>;

function createBadgeStyle(payload: LogObject, typeColor: ColorName): string {
    return color.bold(getBgColor(typeColor)(color.black(` ${payload.type.toUpperCase()} `)));
}

function createTextStyle(typePrefix: string, typeColor: ColorName): string {
    return color.bold(getColorFn(typeColor)(typePrefix));
}

function formatType(payload: LogObject, isBadge: boolean): string {
    const typeColor: ColorName = TYPE_COLOR_MAP[payload.type] as ColorName;
    const typePrefix: string = TYPE_PREFIX[payload.type] || payload.type.toUpperCase();

    const FORMAT_STYLES: FormatStylesMap = {
        fatal: (): string => createBadgeStyle(payload, typeColor),
        fail: (): string => createBadgeStyle(payload, typeColor),
        error: (): string => createTextStyle(typePrefix, typeColor),
        warn: (): string => createTextStyle(typePrefix, typeColor),
        info: (): string => createTextStyle(typePrefix, typeColor),
        success: (): string => createTextStyle(typePrefix, typeColor),
        debug: (): string => createTextStyle(typePrefix, typeColor),
        trace: (): string => createTextStyle(typePrefix, typeColor),
        start: (): string => createTextStyle(typePrefix, typeColor),
        log: (): string => createTextStyle(typePrefix, typeColor),
        silent: (): string => createTextStyle(typePrefix, typeColor),
        ready: (): string => createTextStyle(typePrefix, typeColor),
        box: (): string => createTextStyle(typePrefix, typeColor),
        verbose: (): string => createTextStyle(typePrefix, typeColor),
        default: (): string => {
            return isBadge ? createBadgeStyle(payload, typeColor) : createTextStyle(typePrefix, typeColor);
        },
    };

    const formatter: FormatStyleFn = FORMAT_STYLES[payload.type] || FORMAT_STYLES.default;
    const formattedType: string = formatter();

    const visibleLength: number = stripAnsi(formattedType).length;
    const padding: number = Math.max(0, 7 - visibleLength);

    return formattedType + " ".repeat(padding);
}

function formatArgs(args: unknown[], opts: FormatOptions): string {
    const _args: unknown[] = args.map((arg: unknown): unknown => {
        if (arg instanceof Error && typeof arg.stack === "string") {
            return formatError(arg, opts);
        }
        return arg;
    });

    return formatWithOptions(opts, ..._args);
}

function characterFormat(str: string): string {
    return str
        .replace(/`([^`]+)`/g, (_: string, m: string | number): string => color.cyan(m))
        .replace(/\s+_([^_]+)_\s+/g, (_: string, m: string | number): string => ` ${color.underline(m)} `);
}

function formatPayload(payload: LogObject, opts: FormatOptions): string {
    const [message, ...additional] = formatArgs(payload.args, opts).split("\n");

    const date: string = formatTimestamp(payload.date);
    const isLogType: boolean = payload.type === "log";
    const isBadge: boolean = (payload.badge as boolean) ?? payload.level < 2;
    const type: string = isLogType ? "" : formatType(payload, isBadge);

    let line: string;
    const format: string = isLogType
        ? [date, characterFormat(message)].join(" ")
        : [type, date, characterFormat(message)].join(" ");

    line = format;
    line += characterFormat(additional.length > 0 ? `\n${additional.join("\n")}` : "");

    return line;
}

function writeStream(data: string, stream: NodeJS.WriteStream): boolean {
    const write = stream.write;
    return write.call(stream, data);
}

export const logger: ConsolaInstance = createConsola({
    level: 3,
    reporters: [
        {
            log(logObj: LogObject, ctx: { options: ConsolaOptions }): boolean {
                const line = formatPayload(logObj, {
                    columns: ctx.options.stdout?.columns || 0,
                    ...ctx.options.formatOptions,
                });

                return writeStream(
                    `${line}\n`,
                    logObj.level < 2 ? ctx.options.stderr || process.stderr : ctx.options.stdout || process.stdout,
                );
            },
        },
    ],
});
