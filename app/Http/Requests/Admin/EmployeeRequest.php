<?php

namespace App\Http\Requests\Admin;

use App\Enums\EmployeeStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id', Rule::unique('employees')->ignore($this->route('employee'))],
            'employee_number' => ['required', 'string', 'max:30', Rule::unique('employees')->ignore($this->route('employee'))],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'position' => ['required', 'string', 'max:100'],
            'hire_date' => ['required', 'date'],
            'monthly_salary' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'status' => ['required', Rule::enum(EmployeeStatus::class)],
        ];
    }
}
