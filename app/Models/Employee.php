<?php

namespace App\Models;

use App\Enums\EmployeeStatus;
use Database\Factories\EmployeeFactory;
use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property int $department_id
 * @property string $employee_number
 * @property string $first_name
 * @property string $last_name
 * @property string|null $email
 * @property string|null $phone
 * @property string $position
 * @property Carbon $hire_date
 * @property string|null $monthly_salary
 * @property EmployeeStatus $status
 * @property-read string $full_name
 */
#[Fillable([
    'user_id', 'department_id', 'employee_number', 'first_name', 'last_name', 'email', 'phone',
    'position', 'hire_date', 'monthly_salary', 'status',
])]
#[Appends(['full_name'])]
class Employee extends Model
{
    /** @use HasFactory<EmployeeFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hire_date' => 'date:Y-m-d',
            'monthly_salary' => 'decimal:2',
            'status' => EmployeeStatus::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return HasMany<Shift, $this>
     */
    public function shifts(): HasMany
    {
        return $this->hasMany(Shift::class);
    }

    /**
     * @return HasMany<MaintenanceRequest, $this>
     */
    public function assignedMaintenanceRequests(): HasMany
    {
        return $this->hasMany(MaintenanceRequest::class, 'assigned_to');
    }

    /**
     * Limit to employees currently on staff.
     *
     * @param  Builder<Employee>  $query
     */
    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('status', EmployeeStatus::Active);
    }

    /**
     * @return Attribute<non-falsy-string, never>
     */
    protected function fullName(): Attribute
    {
        return Attribute::get(fn (): string => "{$this->first_name} {$this->last_name}");
    }
}
