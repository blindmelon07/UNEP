<?php

namespace App\Http\Requests\Admin;

use App\Enums\Role;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    /**
     * Get the validation rules; the password is optional when editing.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($this->route('user'))],
            'role' => ['required', Rule::enum(Role::class)],
            'is_active' => ['boolean'],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'confirmed', Password::defaults()],
        ];
    }
}
