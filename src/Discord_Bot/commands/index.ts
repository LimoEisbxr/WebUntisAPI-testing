import { PrismaClient } from "@prisma/client";

import * as ping from "./ping.js";
import * as login from "./login.js";
import * as timetabletoday from "./timetableToday.js";
import * as timetabledate from "./timetableDate.js";

export const prisma = new PrismaClient();

export const commands = {
    ping,
    login,
    timetabletoday,
    timetabledate,
};
