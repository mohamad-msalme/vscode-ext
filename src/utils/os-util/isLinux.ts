import { isMac } from "./isMac";
import { isWindows } from "./isWindows";

export const isLinux = () => !(isWindows() || isMac());
