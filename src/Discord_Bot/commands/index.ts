import * as ping from "./ping.js";
import * as login from "./login.js";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export const commands = {
    ping,
    login,
};
