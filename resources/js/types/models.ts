export type Option = { value: string; label: string };

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export type RoomStatus =
    | 'available'
    | 'occupied'
    | 'cleaning'
    | 'maintenance'
    | 'out_of_service';

export type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'checked_in'
    | 'checked_out'
    | 'cancelled';

export type MaintenanceStatus =
    | 'open'
    | 'in_progress'
    | 'on_hold'
    | 'resolved'
    | 'cancelled';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';

export type EmployeeStatus = 'active' | 'on_leave' | 'terminated';

export type Role =
    | 'admin'
    | 'front_desk'
    | 'maintenance'
    | 'inventory'
    | 'human_resources';

export type Module =
    | 'reservations'
    | 'inventory'
    | 'maintenance'
    | 'employees'
    | 'users';

export type RoomType = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    base_rate: string;
    capacity: number;
    amenities: string[] | null;
    image_url: string | null;
    rooms_count?: number;
    available_rooms?: number;
};

export type Room = {
    id: number;
    room_type_id: number;
    number: string;
    floor: number;
    status: RoomStatus;
    notes: string | null;
    room_type?: Pick<RoomType, 'id' | 'name'>;
};

export type Guest = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    address: string | null;
    id_type: string | null;
    id_number: string | null;
    reservations_count?: number;
    created_at: string;
};

export type Payment = {
    id: number;
    amount: string;
    method: string;
    reference: string | null;
    paid_at: string;
    received_by: { id: number; name: string } | null;
};

export type ReservationCharge = {
    id: number;
    description: string;
    amount: string;
    created_at: string;
};

export type Reservation = {
    id: number;
    code: string;
    guest_id: number;
    room_type_id: number;
    room_id: number | null;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    status: ReservationStatus;
    source: string;
    nightly_rate: string;
    room_total: string;
    special_requests: string | null;
    checked_in_at: string | null;
    checked_out_at: string | null;
    guest?: Guest;
    room_type?: Pick<RoomType, 'id' | 'name'> & Partial<RoomType>;
    room?: Pick<Room, 'id' | 'number'> & Partial<Room>;
    payments?: Payment[];
    charges?: ReservationCharge[];
};

export type InventoryCategory = {
    id: number;
    name: string;
    items_count?: number;
};

export type InventoryItem = {
    id: number;
    inventory_category_id: number;
    sku: string;
    name: string;
    unit: string;
    quantity: number;
    reorder_level: number;
    unit_cost: string;
    location: string | null;
    category?: Pick<InventoryCategory, 'id' | 'name'>;
};

export type StockMovement = {
    id: number;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    balance_after: number;
    notes: string | null;
    created_at: string;
    user: { id: number; name: string } | null;
    maintenance_request: { id: number; title: string } | null;
    item?: Pick<InventoryItem, 'id' | 'name' | 'unit'>;
};

export type Employee = {
    id: number;
    user_id: number | null;
    department_id: number;
    employee_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    position: string;
    hire_date: string;
    monthly_salary: string | null;
    status: EmployeeStatus;
    department?: { id: number; name: string };
    user?: { id: number; name: string; email: string; role: Role } | null;
};

export type MaintenanceRequest = {
    id: number;
    room_id: number | null;
    location: string | null;
    title: string;
    description: string | null;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    blocks_room: boolean;
    assigned_to: number | null;
    resolution_notes: string | null;
    resolved_at: string | null;
    created_at: string;
    room?: (Pick<Room, 'id' | 'number'> & Partial<Room>) | null;
    reporter?: { id: number; name: string } | null;
    assignee?: Pick<
        Employee,
        'id' | 'first_name' | 'last_name' | 'full_name'
    > | null;
    parts_used?: StockMovement[];
};

export type Department = {
    id: number;
    name: string;
    employees_count?: number;
};

export type Shift = {
    id: number;
    employee_id: number;
    date: string;
    starts_at: string;
    ends_at: string;
    notes: string | null;
    employee?: Pick<
        Employee,
        'id' | 'first_name' | 'last_name' | 'full_name' | 'position'
    >;
};

export type StaffUser = {
    id: number;
    name: string;
    email: string;
    role: Role;
    is_active: boolean;
    created_at?: string;
};
