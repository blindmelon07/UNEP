/**
 * Builds the UNEP Hotel user guide (Word .docx) from the screenshots in ./screenshots.
 *
 * Usage (from docs/user-guide):
 *   npm install       # once, installs the docx library for this folder only
 *   npm run capture   # optional: refresh the screenshots from the running app
 *   npm run build     # writes UNEP-Hotel-User-Guide.docx to the project root
 *
 * After building, open the file in Word and right-click the table of contents > Update Field
 * to fill in the page numbers.
 */
const fs = require('fs');
const path = require('path');
const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
    HeadingLevel,
    ImageRun,
    LevelFormat,
    PageNumber,
    Packer,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableOfContents,
    TableRow,
    TextRun,
    WidthType,
} = require('docx');

const PROJECT = path.resolve(__dirname, '..', '..');
const SHOTS = path.join(__dirname, 'screenshots');
const LOGO = path.join(PROJECT, 'public', 'images', 'unep-htm-logo.jpg');
const OUTPUT =
    process.env.GUIDE_OUTPUT ??
    path.join(PROJECT, 'UNEP-Hotel-User-Guide.docx');

const GREEN = '134B2F';
const GOLD = 'C68A14';
const GREY = '475569';
const FONT = 'Calibri';
const CONTENT_WIDTH = 9026; // A4 width minus 1" margins, in DXA

// ---------- helpers ----------
let figureNumber = 0;
let stepsInstance = 0;

const text = (value, options = {}) =>
    new TextRun({ text: value, font: FONT, ...options });

/** Parse **bold** markers inside a sentence into runs. */
function rich(value, base = {}) {
    return value
        .split(/(\*\*[^*]+\*\*)/g)
        .filter(Boolean)
        .map((part) =>
            part.startsWith('**')
                ? text(part.slice(2, -2), { ...base, bold: true })
                : text(part, base),
        );
}

const p = (value, options = {}) =>
    new Paragraph({
        children: rich(value),
        spacing: { after: 120, line: 288 },
        ...options,
    });
const h1 = (value) =>
    new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [text(value)],
        pageBreakBefore: true,
    });
const h2 = (value) =>
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [text(value)] });
const bullets = (items) =>
    items.map(
        (item) =>
            new Paragraph({
                children: rich(item),
                numbering: { reference: 'bullets', level: 0 },
                spacing: { after: 60, line: 276 },
            }),
    );

/** A numbered procedure; each call restarts at 1. */
function steps(items) {
    const instance = ++stepsInstance;
    return items.map(
        (item) =>
            new Paragraph({
                children: rich(item),
                numbering: { reference: 'steps', level: 0, instance },
                spacing: { after: 80, line: 276 },
            }),
    );
}

function figure(file, caption, { width = 600 } = {}) {
    figureNumber += 1;
    const data = fs.readFileSync(path.join(SHOTS, `${file}.png`));
    const height = Math.round((width * 900) / 1440);
    return [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 60 },
            keepNext: true,
            children: [
                new ImageRun({
                    type: 'png',
                    data,
                    transformation: { width, height },
                    altText: {
                        title: caption,
                        description: caption,
                        name: file,
                    },
                }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
                text(`Figure ${figureNumber}. `, {
                    bold: true,
                    size: 18,
                    color: GREY,
                }),
                text(caption, { italics: true, size: 18, color: GREY }),
            ],
        }),
    ];
}

/** A shaded call-out box (tip, note or warning). */
function callout(kind, value) {
    const styles = {
        Tip: { fill: 'EFFAF3', border: '2A9259' },
        Note: { fill: 'FEF7E6', border: 'E3A923' },
        Important: { fill: 'FDECEC', border: 'C0392B' },
    }[kind];
    return new Paragraph({
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: styles.fill },
        border: {
            left: {
                style: BorderStyle.SINGLE,
                size: 24,
                color: styles.border,
                space: 8,
            },
        },
        indent: { left: 160, right: 160 },
        spacing: { before: 120, after: 200, line: 276 },
        children: [text(`${kind}: `, { bold: true }), ...rich(value)],
    });
}

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
const cellBorders = {
    top: cellBorder,
    bottom: cellBorder,
    left: cellBorder,
    right: cellBorder,
};

function table(headers, rows, widths) {
    const total = widths.reduce((a, b) => a + b, 0);
    const scaled = widths.map((w) => Math.round((w / total) * CONTENT_WIDTH));
    scaled[scaled.length - 1] +=
        CONTENT_WIDTH - scaled.reduce((a, b) => a + b, 0);
    const cell = (value, index, isHeader) =>
        new TableCell({
            width: { size: scaled[index], type: WidthType.DXA },
            borders: cellBorders,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            shading: isHeader
                ? { type: ShadingType.CLEAR, color: 'auto', fill: GREEN }
                : undefined,
            children: [
                new Paragraph({
                    spacing: { after: 0 },
                    children: isHeader
                        ? [
                              text(value, {
                                  bold: true,
                                  color: 'FFFFFF',
                                  size: 20,
                              }),
                          ]
                        : rich(value, { size: 20 }),
                }),
            ],
        });
    return new Table({
        width: { size: CONTENT_WIDTH, type: WidthType.DXA },
        columnWidths: scaled,
        rows: [
            new TableRow({
                tableHeader: true,
                children: headers.map((h, i) => cell(h, i, true)),
            }),
            ...rows.map(
                (row) =>
                    new TableRow({
                        children: row.map((v, i) => cell(v, i, false)),
                    }),
            ),
        ],
    });
}

// ---------- content ----------
const cover = [
    new Paragraph({
        spacing: { before: 600 },
        alignment: AlignmentType.CENTER,
        children: [
            new ImageRun({
                type: 'jpg',
                data: fs.readFileSync(LOGO),
                transformation: { width: 260, height: 260 },
                altText: {
                    title: 'UNEP HTM logo',
                    description:
                        'UNEP Department of Hospitality & Tourism Management logo',
                    name: 'logo',
                },
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 120 },
        children: [
            text('UNEP Hotel Management System', {
                bold: true,
                size: 52,
                color: GREEN,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [text('User Guide', { size: 40, color: GOLD })],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
            text(
                'Reservations · Front Desk · Housekeeping & Maintenance · Inventory · Human Resources',
                { size: 22, color: GREY },
            ),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000, after: 60 },
        children: [
            text('Department of Hospitality & Tourism Management', {
                bold: true,
                size: 24,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
            text(
                'University of Northeastern Philippines · Iriga City, Camarines Sur',
                { size: 22 },
            ),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
            text('Version 1.0 · October 2026', { size: 20, color: GREY }),
        ],
    }),
];

const contents = [
    new Paragraph({
        pageBreakBefore: true,
        spacing: { after: 240 },
        children: [text('Contents', { bold: true, size: 36, color: GREEN })],
    }),
    new TableOfContents('Contents', {
        hyperlink: true,
        headingStyleRange: '1-2',
    }),
    p(
        'If the page numbers above are not shown, right-click the table and choose **Update Field**.',
        { spacing: { before: 240 } },
    ),
];

const intro = [
    h1('1. Introduction'),
    p(
        'The UNEP Hotel Management System runs the day-to-day operations of the training hotel of the University of Northeastern Philippines Department of Hospitality & Tourism Management. It brings together five areas of work in one place:',
    ),
    ...bullets([
        '**Reservations and front desk** — bookings, room assignment, check-in, billing (the folio) and check-out.',
        '**Housekeeping and maintenance** — the live room board and work orders for repairs.',
        '**Inventory** — stock levels, deliveries, issues and low-stock alerts.',
        '**Human resources** — employee records, departments and the weekly shift roster.',
        '**A public website** — where guests view rooms, take a virtual tour and book online.',
    ]),
    h2('1.1 Who should read what'),
    p(
        'Each staff member only sees the parts of the system that match their role. Use this table to find the chapters that apply to you.',
    ),
    table(
        ['Your role', 'Read these chapters'],
        [
            [
                'Everyone',
                '2 Getting started, 9 Rules the system enforces, 10 Troubleshooting',
            ],
            [
                'Front Desk (agents, night auditors, HTM trainees)',
                '4 Front desk and reservations',
            ],
            ['Maintenance / Housekeeping', '5 Housekeeping and maintenance'],
            ['Inventory (storekeeper)', '6 Inventory'],
            ['Human Resources', '7 Human resources'],
            ['Administrator', 'All chapters, especially 8 Administration'],
            ['Guests and marketing staff', '3 The public website'],
        ],
        [4, 6],
    ),
];

const gettingStarted = [
    h1('2. Getting started'),
    h2('2.1 Signing in'),
    p(
        'The staff portal is reached from the **Staff login** link at the top-right of the public website, or directly at **/login**.',
    ),
    ...steps([
        'Open the hotel website and click **Staff login**.',
        'Enter the email address and password given to you by the administrator.',
        'Tick **Keep me signed in** only on a computer that is not shared.',
        'Click **Sign in**. You are taken to your dashboard.',
    ]),
    ...figure('login', 'The staff login page'),
    callout(
        'Important',
        'If you see "These credentials do not match our records", check your email and password. After five wrong attempts you must wait one minute. Disabled accounts cannot sign in — ask the administrator.',
    ),
    h2('2.2 Roles and what each one can open'),
    table(
        ['Role', 'Modules in the menu'],
        [
            [
                'Admin',
                'Everything: Front Office, Inventory, Maintenance, Human Resources and Staff Accounts',
            ],
            [
                'Front Desk',
                'Reservations, Guests, Rooms (room board) and Room Types',
            ],
            [
                'Maintenance',
                'Work Orders, plus the Rooms board to mark rooms clean or under repair',
            ],
            ['Inventory', 'Stock Items and Categories'],
            ['Human Resources', 'Employees, Departments and Shift Roster'],
        ],
        [2, 7],
    ),
    h2('2.3 The dashboard and menu'),
    p(
        'After signing in you land on the **Dashboard**. The left-hand menu lists only the modules your role can use. The cards at the top give a summary of today; click any card link to jump to the details.',
    ),
    ...figure(
        'admin-dashboard',
        'The administrator dashboard: occupancy, arrivals and departures, payments, work orders, low stock and staff on shift',
    ),
    p(
        "Lower down, the dashboard shows the live room status bar, today's arrivals and departures, active work orders and items that need reordering.",
    ),
    ...figure('admin-dashboard-lower', 'Lower part of the dashboard'),
    ...figure(
        'role-maintenance-dashboard',
        'The same dashboard for a Maintenance user — only maintenance information and menu items are shown',
    ),
    h2('2.4 Messages, colours and signing out'),
    ...bullets([
        'A **green message** in the bottom-right corner confirms an action was saved. A **red message** explains why an action was refused.',
        'Red text under a form field explains what to correct before saving again.',
        'Coloured badges show statuses (see the Appendix for the full list).',
        'To finish, click **Log out** at the bottom of the left-hand menu.',
    ]),
    h2('2.5 Demo accounts (training copy only)'),
    p(
        'The training copy of the system comes with these demo logins. Every demo account uses the password **password**.',
    ),
    table(
        ['Email', 'Name', 'Role'],
        [
            ['admin@hotel.test', 'Hotel Administrator', 'Admin'],
            [
                'frontdesk@hotel.test',
                'Marites Obias',
                'Front Desk (supervisor)',
            ],
            [
                'nightaudit@hotel.test',
                'Jerome Volante',
                'Front Desk (night auditor)',
            ],
            [
                'trainee@hotel.test',
                'Princess Sabater',
                'Front Desk (HTM student trainee)',
            ],
            [
                'maintenance@hotel.test',
                'Ramon Imperial',
                'Maintenance (chief engineer)',
            ],
            [
                'housekeeping@hotel.test',
                'Liza Badiola',
                'Maintenance (executive housekeeper)',
            ],
            ['inventory@hotel.test', 'Arnel Tria', 'Inventory (storekeeper)'],
            ['hr@hotel.test', 'Rowena Nacional', 'Human Resources'],
            [
                'inactive@hotel.test',
                'Former Clerk',
                'Disabled — cannot sign in',
            ],
        ],
        [4, 3.5, 4],
    ),
    callout(
        'Important',
        'Before the system is used with real guests, the administrator must change every demo password or delete the demo accounts (see chapter 8).',
    ),
];

const publicSite = [
    h1('3. The public website'),
    p(
        'Guests use the public website to learn about the hotel and to book a stay. No account is needed.',
    ),
    h2('3.1 Home page and rooms'),
    ...figure('public-home', 'The home page with the availability search box'),
    p(
        'Under the search box guests see every room type with its photo, nightly rate, capacity and amenities. **Walk through this room** opens the virtual tour at that room.',
    ),
    ...figure('public-rooms', 'Room types with rates and amenities'),
    ...figure(
        'public-gallery',
        'Photo gallery — click any photo to view it full size',
    ),
    h2('3.2 Virtual tour'),
    p(
        'The virtual tour lets guests walk through the hotel from their browser.',
    ),
    ...bullets([
        '**Drag** the picture to look around. Use **Ctrl + mouse wheel** or pinch to zoom.',
        'Click a **labelled door** (for example "Economy Room →") to walk into the next area.',
        'Hover or tap a **gold dot** to see what it is (bed, shower, front desk…).',
        'Use the list on the right to jump straight to any room or training facility. The button at the bottom-right switches to full screen.',
    ]),
    ...figure(
        'public-tour',
        'Virtual tour — the lobby, with labelled doors and gold information dots',
    ),
    ...figure('public-tour-deluxe', 'Virtual tour — inside the Deluxe Room'),
    h2('3.3 Booking online'),
    ...steps([
        'On the home page or **Book a stay**, choose the check-in and check-out dates and the number of guests, then click **Check availability**.',
        'The results list only the room types that are free for those dates and can fit the party. Click **Select** on the room you want.',
        'Fill in your name, email and mobile number, the number of adults and children, and any special requests.',
        'Click **Reserve now**. The confirmation page shows your **booking reference** (for example RSV-PKIOTSFC). Keep it for check-in.',
    ]),
    ...figure('public-search', 'Availability results for the chosen dates'),
    ...figure(
        'public-booking-form',
        'Guest details form with the price summary',
    ),
    ...figure(
        'public-confirmation',
        'Booking confirmation with the booking reference',
    ),
    callout(
        'Note',
        'Online bookings are held as **Pending** until the front desk assigns a room. No payment is taken online — the guest settles at the front desk.',
    ),
];

const frontDesk = [
    h1('4. Front desk and reservations'),
    p(
        'This chapter is for Front Desk staff and administrators. It follows a guest from booking to check-out.',
    ),
    h2('4.1 Finding reservations'),
    p(
        'Open **Reservations** in the menu. Use the search box (booking code or guest name), the **status** filter, or the **date** filter to show everyone staying on a given night.',
    ),
    ...figure(
        'reservations-index',
        'The reservations list with search and filters',
    ),
    h2('4.2 Creating a walk-in or phone reservation'),
    ...steps([
        'Click **New reservation** (on the dashboard or the Reservations page).',
        "Enter the guest's first name, last name, email and phone. To book a returning guest, open their profile under **Guests** and click **New reservation** there instead — their details are filled in for you.",
        'Choose the **room type**, the **check-in** and **check-out** dates, and the number of adults and children. The price is calculated as you type.',
        'Choose the **booking source** (Walk In or Phone) and click **Create reservation**.',
    ]),
    ...figure(
        'reservations-create',
        'New reservation form with live price estimate',
    ),
    callout(
        'Note',
        'The system refuses the booking if no room of that type is free for the whole stay, or if there are more guests than the room sleeps.',
    ),
    h2('4.3 Confirming an online booking (assigning a room)'),
    p(
        'Online bookings arrive as **Pending** and appear on the dashboard as "pending bookings to confirm". To confirm one:',
    ),
    ...steps([
        'Open the reservation from the dashboard link or the Reservations list (filter Status = Pending).',
        'In the **Room** panel on the right, pick a free room from the list.',
        'Click **Assign & confirm**. The status changes to **Confirmed**.',
    ]),
    ...figure(
        'reservations-pending',
        'A pending online booking waiting for a room',
    ),
    h2('4.4 Checking a guest in'),
    ...steps([
        'Open the reservation and make sure a room is assigned.',
        'Check the room badge shows **Available**. If it shows **Cleaning**, ask housekeeping to mark it clean first (chapter 5).',
        'Click **Check in**. The reservation becomes **Checked In** and the room becomes **Occupied**.',
    ]),
    callout(
        'Tip',
        'Check-in is refused if the stay starts on a later date, if the room is not ready, or if the stay has already ended (a no-show). For a no-show, edit the dates or cancel the booking.',
    ),
    h2('4.5 The folio: charges and payments'),
    p(
        'The **Folio** on the reservation page lists the room charge, any extra charges, all payments and the **Balance due**.',
    ),
    ...bullets([
        '**Add charge** — enter a description (Minibar, Laundry, Late check-out…) and the amount.',
        '**Record payment** — enter the amount, choose Cash, Card, GCash or Bank Transfer, and add the OR number or reference. The amount is pre-filled with the balance.',
        'Use **Remove** or **Void** to undo a charge or payment entered by mistake. This is only possible while the stay is open.',
    ]),
    ...figure(
        'reservations-show',
        'A checked-in reservation with its folio, payment and charge forms',
    ),
    h2('4.6 Checking a guest out'),
    ...steps([
        'Open the reservation and make sure the **Balance due** is ₱0.00. Record any remaining payment first.',
        'Click **Check out** and confirm.',
        'The reservation becomes **Checked Out** and the room is sent to **Cleaning** for housekeeping.',
    ]),
    callout(
        'Important',
        'Check-out is refused while any balance remains. After check-out the folio is locked and can no longer be changed.',
    ),
    h2('4.7 Editing or cancelling a reservation'),
    ...bullets([
        '**Edit** (Pending or Confirmed only) changes dates, room type, room or party size. The total is recalculated automatically.',
        '**Cancel booking** (Pending or Confirmed only) releases the room for other guests.',
    ]),
    h2('4.8 Guests'),
    p(
        '**Guests** lists every guest profile. Open a profile to see contact details, ID information and the full stay history.',
    ),
    ...figure('guests-index', 'The guest list with search'),
    ...figure('guests-show', 'A guest profile with stay history'),
    h2('4.9 Room board and room types'),
    p(
        '**Rooms** shows every room by floor with its live status. Quick buttons let you mark a room clean, send it for cleaning or return it to service. **Report issue** opens a maintenance work order for that room.',
    ),
    ...figure('rooms-index', 'The room board'),
    p(
        '**Room Types** sets the name, nightly rate, capacity, amenities and photo shown on the public website.',
    ),
    ...figure('room-types-index', 'Room types'),
    ...figure('room-types-edit', 'Editing a room type'),
    callout(
        'Note',
        'A room becomes Occupied only through check-in. You cannot change the type of a room that has upcoming bookings assigned to it.',
    ),
];

const maintenance = [
    h1('5. Housekeeping and maintenance'),
    p(
        'This chapter is for Maintenance and Housekeeping staff. Maintenance users see the **Rooms** board and **Work Orders**.',
    ),
    h2('5.1 Keeping room status up to date'),
    ...steps([
        'Open **Rooms**. Rooms that guests have just left show **Cleaning**.',
        'When a room has been cleaned and inspected, click **Mark clean**. It becomes **Available** and can be checked in.',
        'Use **Needs cleaning** or **Return to service** as required.',
    ]),
    h2('5.2 Work orders'),
    p(
        '**Work Orders** lists every maintenance request. Open requests are shown first, the most urgent at the top. Filter by status or priority.',
    ),
    ...figure('maintenance-index', 'The work order list'),
    h2('5.3 Reporting an issue'),
    ...steps([
        'Click **Report an issue** (or **Report issue** on a room card on the room board).',
        "Describe the problem in **What's wrong?**, then choose the **room** — or type another **location** such as Lobby or Kitchen.",
        'Set the **priority** and, if known, **assign** a technician.',
        'Tick **Take the room out of order** if guests must not use the room until it is fixed. The room status changes to **Maintenance** automatically.',
        'Click **Submit work order**.',
    ]),
    ...figure('maintenance-create', 'Reporting a new issue'),
    h2('5.4 Working on and resolving a request'),
    p(
        'Open a work order to see its details, who reported it and who is assigned. Use **Issue part** to take spare parts from inventory — the stock level is reduced automatically and the part is recorded on the job.',
    ),
    ...figure('maintenance-show', 'A work order with the parts used'),
    ...steps([
        'Click **Update status**.',
        'Change the status to **In Progress**, **On Hold**, **Resolved** or **Cancelled**.',
        'When resolving, describe what was done in **Resolution notes**.',
        'Click **Save changes**. When the last open request for a room is closed, the room returns to **Available** automatically.',
    ]),
    ...figure('maintenance-edit', 'Updating the status of a work order'),
];

const inventory = [
    h1('6. Inventory'),
    p('This chapter is for the storekeeper and administrators.'),
    ...figure(
        'role-inventory-dashboard',
        "The Inventory user's dashboard with low-stock alerts",
    ),
    h2('6.1 Stock items'),
    p(
        '**Stock Items** lists every item with its quantity on hand, reorder level, unit cost and stock value. Items at or below their reorder level are marked **Low**. Tick **Low stock only** to see what needs ordering.',
    ),
    ...figure('inventory-index', 'Stock items with low-stock flags'),
    h2('6.2 Receiving, issuing and recounting stock'),
    p(
        'Quantities only change through stock movements, so there is always a full history. Open an item and use **Update stock**:',
    ),
    table(
        ['Movement', 'When to use it', 'Quantity to enter'],
        [
            ['In', 'A delivery arrives', 'The quantity received'],
            [
                'Out',
                'Stock is issued to housekeeping, the bar or a department',
                'The quantity issued',
            ],
            [
                'Adjustment',
                'After a physical count',
                'The **counted** quantity on hand — the system records the difference',
            ],
        ],
        [2, 5, 4],
    ),
    ...figure(
        'inventory-show',
        'An item with its movement history, including parts used on maintenance',
    ),
    callout(
        'Note',
        'The system refuses to issue more than is on hand. Items that were used on maintenance work orders cannot be deleted, so their history is kept.',
    ),
    h2('6.3 Adding items and categories'),
    p(
        'Click **Add item**, fill in the name, SKU, category, unit, reorder level and unit cost, and an optional **opening quantity** (recorded as the first stock-in). Manage categories under **Categories**.',
    ),
    ...figure('inventory-create', 'Adding a stock item'),
    ...figure('inventory-categories', 'Inventory categories'),
];

const hr = [
    h1('7. Human resources'),
    p('This chapter is for Human Resources staff and administrators.'),
    h2('7.1 Employees'),
    p(
        '**Employees** lists all staff with their department, position, hire date and status (Active, On Leave or Terminated). Search by name, employee number or position.',
    ),
    ...figure('employees-index', 'The employee list'),
    p(
        'Open an employee to see their details, upcoming shifts and any open maintenance work orders assigned to them. An employee can be linked to a staff login under **Linked staff login**.',
    ),
    ...figure('employees-show', 'An employee profile'),
    h2('7.2 Departments'),
    p(
        'Add, rename or delete departments. A department that still has employees cannot be deleted.',
    ),
    ...figure('departments-index', 'Departments'),
    h2('7.3 Shift roster'),
    ...steps([
        'Open **Shift Roster**. Use **Previous**, **This week** and **Next** to move between weeks. Today is outlined in green.',
        'In **Schedule a shift**, choose the employee, date, start and end times, then click **Add shift**.',
        'To remove a shift, hover over it and click **Remove**.',
    ]),
    ...figure('shifts-index', 'The weekly shift roster'),
    callout(
        'Note',
        'An employee can only have one shift per day. Night shifts may end the following morning (for example 22:00 to 06:00).',
    ),
];

const admin = [
    h1('8. Administration'),
    p('Only administrators can manage staff accounts.'),
    h2('8.1 Staff accounts'),
    ...figure('users-index', 'Staff accounts'),
    ...steps([
        'Click **Add account**, or **Edit** next to an existing account.',
        'Enter the name and email, and choose the **role** — the description under the field explains what that role can open.',
        'Set a password (at least 8 characters) and confirm it. When editing, leave the password blank to keep the current one.',
        'Untick **Account is active** to stop someone signing in without deleting their history. They are signed out on their next click.',
        'Click **Save changes**.',
    ]),
    ...figure('users-edit', 'Editing a staff account'),
    callout(
        'Important',
        'You cannot remove your own administrator role, deactivate yourself, or delete your own account. This prevents the hotel being locked out.',
    ),
];

const rules = [
    h1('9. Rules the system enforces'),
    p(
        'The system checks these rules automatically. If an action is refused, the red message explains which rule applies.',
    ),
    table(
        ['Area', 'Rule'],
        [
            [
                'Bookings',
                'A room type can only be booked when at least one room of that type is free for every night of the stay.',
            ],
            [
                'Bookings',
                'A new stay may start on the same day another guest checks out.',
            ],
            [
                'Bookings',
                "The number of adults and children cannot exceed the room type's capacity.",
            ],
            [
                'Check-in',
                'Requires an assigned, Available room, on or after the check-in date and before the check-out date.',
            ],
            [
                'Check-out',
                'Requires a zero balance. The room is then set to Cleaning.',
            ],
            [
                'Folio',
                'Charges and payments are locked once a reservation is checked out or cancelled.',
            ],
            [
                'Rooms',
                'Occupied is set only by check-in and cleared only by check-out.',
            ],
            [
                'Rooms',
                "A room's type cannot change while bookings are assigned to it.",
            ],
            [
                'Maintenance',
                'A blocking work order puts the room into Maintenance; closing the last one returns it to Available.',
            ],
            [
                'Inventory',
                'Stock cannot go below zero. Items used on work orders cannot be deleted.',
            ],
            ['Shifts', 'One shift per employee per day.'],
            [
                'Accounts',
                'Inactive accounts cannot sign in; administrators cannot lock themselves out.',
            ],
        ],
        [2, 8],
    ),
];

const troubleshooting = [
    h1('10. Troubleshooting'),
    table(
        ['Problem', 'What to do'],
        [
            [
                '"No room is available for the selected dates"',
                'All rooms of that type are booked. Try other dates or another room type, or check for old Pending bookings that should be cancelled.',
            ],
            [
                'Check-in says the room is not ready',
                'The room is Cleaning or under Maintenance. Ask housekeeping to mark it clean, or assign another room.',
            ],
            [
                'Check-out is refused',
                'There is still a balance. Record the payment, then check out.',
            ],
            [
                'I cannot see a module in the menu',
                'Your role does not include it. Ask the administrator to change your role.',
            ],
            [
                '"Only 5 bottle of … in stock"',
                'You tried to issue more than is on hand. Record the delivery first, or issue a smaller amount.',
            ],
            [
                'I was signed out suddenly',
                'Your account may have been deactivated, or your session expired. Sign in again or contact the administrator.',
            ],
            [
                'The virtual tour is blank',
                'The tour needs a modern browser with WebGL (Chrome, Edge, Firefox or Safari). Refresh the page or try another browser.',
            ],
        ],
        [4, 7],
    ),
    h2('Appendix: status colours'),
    table(
        ['Status', 'Meaning'],
        [
            ['Available (green)', 'Room is clean and ready to sell'],
            ['Occupied (blue)', 'A guest is checked in'],
            ['Cleaning (amber)', 'Guest has left; housekeeping needed'],
            ['Maintenance (red)', 'Room is out of order for repairs'],
            [
                'Out of Service (grey)',
                'Room is not in use (renovation, storage)',
            ],
            [
                'Pending (amber)',
                'Online booking waiting for a room to be assigned',
            ],
            ['Confirmed (blue)', 'Booking confirmed, guest not yet arrived'],
            [
                'Checked In (green) / Checked Out (grey)',
                'Guest is in house / stay finished',
            ],
            [
                'Open, In Progress, On Hold, Resolved',
                'Stages of a maintenance work order',
            ],
            ['Low, Medium, High, Urgent', 'Work order priority'],
        ],
        [4, 6],
    ),
];

// ---------- document ----------
const doc = new Document({
    creator: 'UNEP Department of Hospitality & Tourism Management',
    title: 'UNEP Hotel Management System — User Guide',
    description: 'User guide for all roles of the UNEP Hotel Management System',
    styles: {
        default: { document: { run: { font: FONT, size: 22 } } },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 36, bold: true, color: GREEN, font: FONT },
                paragraph: {
                    spacing: { before: 120, after: 240 },
                    outlineLevel: 0,
                },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 28, bold: true, color: GREEN, font: FONT },
                paragraph: {
                    spacing: { before: 320, after: 140 },
                    outlineLevel: 1,
                    keepNext: true,
                },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 24, bold: true, color: GOLD, font: FONT },
                paragraph: {
                    spacing: { before: 240, after: 100 },
                    outlineLevel: 2,
                    keepNext: true,
                },
            },
        ],
    },
    numbering: {
        config: [
            {
                reference: 'bullets',
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.BULLET,
                        text: '•',
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: { indent: { left: 720, hanging: 360 } },
                        },
                    },
                ],
            },
            {
                reference: 'steps',
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.DECIMAL,
                        text: '%1.',
                        alignment: AlignmentType.LEFT,
                        style: {
                            paragraph: { indent: { left: 720, hanging: 360 } },
                        },
                    },
                ],
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        bottom: 1440,
                        left: 1440,
                        right: 1440,
                    },
                },
                titlePage: true,
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            border: {
                                bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 6,
                                    color: GOLD,
                                    space: 4,
                                },
                            },
                            children: [
                                text(
                                    'UNEP Hotel Management System — User Guide',
                                    { size: 18, color: GREY },
                                ),
                            ],
                        }),
                    ],
                }),
                first: new Header({
                    children: [new Paragraph({ children: [] })],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                text('Page ', { size: 18, color: GREY }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    size: 18,
                                    color: GREY,
                                    font: FONT,
                                }),
                            ],
                        }),
                    ],
                }),
                first: new Footer({
                    children: [new Paragraph({ children: [] })],
                }),
            },
            children: [
                ...cover,
                ...contents,
                ...intro,
                ...gettingStarted,
                ...publicSite,
                ...frontDesk,
                ...maintenance,
                ...inventory,
                ...hr,
                ...admin,
                ...rules,
                ...troubleshooting,
            ],
        },
    ],
});

Packer.toBuffer(doc)
    .then((buffer) => {
        fs.writeFileSync(OUTPUT, buffer);
        console.log(
            `Wrote ${OUTPUT} (${Math.round(buffer.length / 1024)} KB, ${figureNumber} figures)`,
        );
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
