import { PrismaClient } from '@prisma/client';

import * as ping from './ping.js';
import * as timetabletoday from './timetableToday.js';
import * as timetabledate from './timetableDate.js';
import * as primaryuser from './addPrimaryUser.js';
import * as login from './login.js';
import * as init from './init.js';
import * as setupprehournotify from './setupPreNotify.js';

export const prisma = new PrismaClient();

export const commands = {
    ping,
    timetabletoday,
    timetabledate,
    primaryuser,
    login,
    init,
    setupprehournotify,
};
