<?php

namespace App\Http\Requests\Admin;

use App\Enums\MaintenancePriority;
use App\Enums\MaintenanceStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MaintenanceRequestRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['nullable', 'integer', 'exists:rooms,id', 'required_without:location'],
            'location' => ['nullable', 'string', 'max:150', 'required_without:room_id'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'priority' => ['required', Rule::enum(MaintenancePriority::class)],
            'status' => [Rule::requiredIf($this->isMethod('put') || $this->isMethod('patch')), Rule::enum(MaintenanceStatus::class)],
            'blocks_room' => ['boolean'],
            'assigned_to' => ['nullable', 'integer', 'exists:employees,id'],
            'resolution_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
