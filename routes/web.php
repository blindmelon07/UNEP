<?php

use App\Http\Controllers\Admin\CheckInController;
use App\Http\Controllers\Admin\CheckOutController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\GuestController;
use App\Http\Controllers\Admin\InventoryCategoryController;
use App\Http\Controllers\Admin\InventoryItemController;
use App\Http\Controllers\Admin\MaintenancePartController;
use App\Http\Controllers\Admin\MaintenanceRequestController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ReservationCancellationController;
use App\Http\Controllers\Admin\ReservationChargeController;
use App\Http\Controllers\Admin\ReservationController;
use App\Http\Controllers\Admin\ReservationRoomController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\RoomStatusController;
use App\Http\Controllers\Admin\RoomTypeController;
use App\Http\Controllers\Admin\ShiftController;
use App\Http\Controllers\Admin\StockMovementController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::controller(BookingController::class)->prefix('book')->name('booking.')->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/confirmation/{reservation:code}', 'show')->name('show');
    Route::get('/{roomType:slug}', 'create')->name('create');
    Route::post('/{roomType:slug}', 'store')->middleware('throttle:10,1')->name('store');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'active'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');

    Route::middleware('module:reservations,maintenance')->group(function () {
        Route::get('rooms', [RoomController::class, 'index'])->name('rooms.index');
        Route::patch('rooms/{room}/status', [RoomStatusController::class, 'update'])->name('rooms.status.update');
    });

    Route::middleware('module:reservations')->group(function () {
        Route::resource('room-types', RoomTypeController::class)->except('show');
        Route::resource('rooms', RoomController::class)->except(['index', 'show']);
        Route::resource('guests', GuestController::class);
        Route::resource('reservations', ReservationController::class)->except('destroy');
        Route::put('reservations/{reservation}/room', [ReservationRoomController::class, 'update'])->name('reservations.room.update');
        Route::post('reservations/{reservation}/check-in', [CheckInController::class, 'store'])->name('reservations.check-in.store');
        Route::post('reservations/{reservation}/check-out', [CheckOutController::class, 'store'])->name('reservations.check-out.store');
        Route::post('reservations/{reservation}/cancellation', [ReservationCancellationController::class, 'store'])->name('reservations.cancellation.store');
        Route::resource('reservations.payments', PaymentController::class)->only(['store', 'destroy'])->shallow();
        Route::resource('reservations.charges', ReservationChargeController::class)->only(['store', 'destroy'])->shallow();
    });

    Route::middleware('module:inventory')->group(function () {
        Route::resource('inventory-categories', InventoryCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('inventory-items', InventoryItemController::class);
        Route::post('inventory-items/{inventory_item}/movements', [StockMovementController::class, 'store'])->name('inventory-items.movements.store');
    });

    Route::middleware('module:maintenance')->group(function () {
        Route::resource('maintenance-requests', MaintenanceRequestController::class);
        Route::post('maintenance-requests/{maintenance_request}/parts', [MaintenancePartController::class, 'store'])->name('maintenance-requests.parts.store');
    });

    Route::middleware('module:employees')->group(function () {
        Route::resource('departments', DepartmentController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('employees', EmployeeController::class);
        Route::resource('shifts', ShiftController::class)->only(['index', 'store', 'destroy']);
    });

    Route::middleware('module:users')->group(function () {
        Route::resource('users', UserController::class)->except('show');
    });
});
