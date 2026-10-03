/**
 * Captures the screenshots used in the user guide by driving headless Chrome over the DevTools protocol.
 *
 * Usage (from docs/user-guide, with the app running and seeded with demo data):
 *   npm run capture
 *
 * Environment variables:
 *   GUIDE_URL    Base URL of the running app (default http://127.0.0.1:8000)
 *   CHROME_PATH  Chrome or Edge executable (default: standard Chrome install on Windows)
 *
 * Note: the booking-confirmation screenshot places one real online booking (Maria Santos).
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(HERE, '..', '..');
const OUT = join(HERE, 'screenshots');
const BASE = process.env.GUIDE_URL ?? 'http://127.0.0.1:8000';
const CHROME =
    process.env.CHROME_PATH ??
    'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;

mkdirSync(OUT, { recursive: true });

/** Look up demo records to photograph, so the script works on any freshly seeded database. */
function demoRecordIds() {
    const php = `echo json_encode([
        "inhouse" => App\\Models\\Reservation::where("status", "checked_in")->whereHas("charges")->value("id")
            ?? App\\Models\\Reservation::where("status", "checked_in")->value("id"),
        "pending" => App\\Models\\Reservation::where("status", "pending")->value("id"),
        "guest" => App\\Models\\Reservation::where("status", "checked_in")->value("guest_id"),
        "itemUsed" => App\\Models\\StockMovement::whereNotNull("maintenance_request_id")->value("inventory_item_id")
            ?? App\\Models\\InventoryItem::value("id"),
        "workOrder" => App\\Models\\MaintenanceRequest::whereIn("status", ["open", "in_progress"])->value("id"),
        "employee" => App\\Models\\Employee::where("email", "frontdesk@hotel.test")->value("id"),
        "user" => App\\Models\\User::where("email", "trainee@hotel.test")->value("id"),
        "roomType" => App\\Models\\RoomType::value("id"),
    ]);`;
    const output = execFileSync(
        'php',
        ['artisan', 'tinker', '--execute', php],
        { cwd: PROJECT, encoding: 'utf8' },
    );

    return JSON.parse(output.trim().split('\n').pop());
}

const ids = demoRecordIds();

const chrome = spawn(
    CHROME,
    [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--hide-scrollbars',
        '--window-size=1440,900',
        `--user-data-dir=${mkdtempSync(join(tmpdir(), 'guide-chrome-'))}`,
        'about:blank',
    ],
    { stdio: 'ignore' },
);

let targets;
for (let i = 0; i < 40 && !targets; i++) {
    try {
        targets = await (
            await fetch(`http://127.0.0.1:${PORT}/json/list`)
        ).json();
    } catch {
        await sleep(250);
    }
}

const ws = new WebSocket(
    targets.find((t) => t.type === 'page').webSocketDebuggerUrl,
);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let messageId = 0;
const pending = new Map();
const listeners = [];

ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
    }

    if (message.method) {
        listeners.forEach((listener) => listener(message));
    }
});

const send = (method, params = {}) =>
    new Promise((resolvePromise, reject) => {
        const id = ++messageId;
        pending.set(id, (m) =>
            m.error
                ? reject(new Error(`${method}: ${m.error.message}`))
                : resolvePromise(m.result),
        );
        ws.send(JSON.stringify({ id, method, params }));
    });

const waitFor = (method, timeout = 20000) =>
    new Promise((resolvePromise) => {
        const timer = setTimeout(resolvePromise, timeout);
        const listener = (m) => {
            if (m.method === method) {
                clearTimeout(timer);
                listeners.splice(listeners.indexOf(listener), 1);
                resolvePromise(m);
            }
        };
        listeners.push(listener);
    });

const evaluate = async (expression) =>
    (
        await send('Runtime.evaluate', {
            expression,
            awaitPromise: true,
            returnByValue: true,
        })
    ).result.value;

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
});

async function go(path, wait = 2500) {
    const loaded = waitFor('Page.loadEventFired');
    await send('Page.navigate', { url: BASE + path });
    await loaded;
    await sleep(wait);
}

async function shot(name, { scrollTo = 0 } = {}) {
    await evaluate(`window.scrollTo(0, ${scrollTo})`);
    await sleep(500);
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
    console.log('captured', name);
}

async function fillAndSubmit(values) {
    await evaluate(`(() => {
        const values = ${JSON.stringify(values)};
        for (const [selector, value] of Object.entries(values)) {
            const element = document.querySelector(selector);
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
        document.querySelector('button[type=submit]').click();
    })()`);
    await sleep(3500);
}

async function login(email) {
    await send('Network.clearBrowserCookies');
    await go('/login', 1500);
    await fillAndSubmit({ '#email': email, '#password': 'password' });
}

const ymd = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return date.toISOString().slice(0, 10);
};
const stay = `check_in=${ymd(24)}&check_out=${ymd(26)}&guests=2`;

// Public site
await go('/');
await shot('public-home');
await shot('public-rooms', { scrollTo: 560 });
await shot('public-gallery', { scrollTo: 1450 });
await go(`/book?${stay}`);
await shot('public-search');
await go(`/book/standard-room?${stay}`);
await shot('public-booking-form');
await fillAndSubmit({
    '#first_name': 'Maria',
    '#last_name': 'Santos',
    '#email': 'maria.santos@example.com',
    '#phone': '09171234567',
});
await shot('public-confirmation');
await go('/tour?start=lobby', 9000);
await shot('public-tour');
await go('/tour?start=deluxe-room', 9000);
await shot('public-tour-deluxe');

// Login page
await send('Network.clearBrowserCookies');
await go('/login', 2000);
await shot('login');

// Administrator: every module
await login('admin@hotel.test');
await shot('admin-dashboard');
await shot('admin-dashboard-lower', { scrollTo: 700 });

const adminPages = [
    ['/admin/reservations', 'reservations-index'],
    ['/admin/reservations/create', 'reservations-create'],
    [`/admin/reservations/${ids.inhouse}`, 'reservations-show'],
    [`/admin/reservations/${ids.pending}`, 'reservations-pending'],
    ['/admin/guests', 'guests-index'],
    [`/admin/guests/${ids.guest}`, 'guests-show'],
    ['/admin/rooms', 'rooms-index'],
    ['/admin/room-types', 'room-types-index'],
    [`/admin/room-types/${ids.roomType}/edit`, 'room-types-edit'],
    ['/admin/inventory-items', 'inventory-index'],
    [`/admin/inventory-items/${ids.itemUsed}`, 'inventory-show'],
    ['/admin/inventory-items/create', 'inventory-create'],
    ['/admin/inventory-categories', 'inventory-categories'],
    ['/admin/maintenance-requests', 'maintenance-index'],
    ['/admin/maintenance-requests/create', 'maintenance-create'],
    [`/admin/maintenance-requests/${ids.workOrder}`, 'maintenance-show'],
    [`/admin/maintenance-requests/${ids.workOrder}/edit`, 'maintenance-edit'],
    ['/admin/employees', 'employees-index'],
    [`/admin/employees/${ids.employee}`, 'employees-show'],
    ['/admin/departments', 'departments-index'],
    ['/admin/shifts', 'shifts-index'],
    ['/admin/users', 'users-index'],
    [`/admin/users/${ids.user}/edit`, 'users-edit'],
];

for (const [path, name] of adminPages) {
    await go(path);
    await shot(name);
}

// Role-limited views
await login('maintenance@hotel.test');
await shot('role-maintenance-dashboard');
await login('inventory@hotel.test');
await shot('role-inventory-dashboard');

ws.close();
chrome.kill();
process.exit(0);
