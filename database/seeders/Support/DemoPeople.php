<?php

namespace Database\Seeders\Support;

use Illuminate\Support\Str;

/**
 * Realistic Filipino names and places for demo guests and staff.
 */
class DemoPeople
{
    /**
     * @var list<string>
     */
    public const array FIRST_NAMES = [
        'Juan', 'Maria', 'Jose', 'Ana', 'Mark', 'Kristine', 'John Paul', 'Mary Grace', 'Christian', 'Angelica',
        'Rodel', 'Jennifer', 'Paolo', 'Camille', 'Jerome', 'Patricia', 'Carlo', 'Nicole', 'Miguel', 'Joanna',
        'Rafael', 'Bea', 'Gabriel', 'Lovely', 'Jericho', 'Princess', 'Arnel', 'Rowena', 'Dante', 'Marites',
        'Ramon', 'Liza', 'Noel', 'Cherry', 'Ronaldo', 'Divina', 'Elmer', 'Jocelyn', 'Joven', 'Analyn',
    ];

    /**
     * @var list<string>
     */
    public const array LAST_NAMES = [
        'Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Bautista', 'Villanueva', 'Ramos', 'Aquino', 'Castillo',
        'Rivera', 'Flores', 'Torres', 'Gonzales', 'Navarro', 'Pascual', 'Salazar', 'Mercado', 'Domingo', 'Soriano',
        'Bicol', 'Imperial', 'Abante', 'Nacional', 'Bermudo', 'Volante', 'Sabater', 'Obias', 'Tria', 'Badiola',
    ];

    /**
     * @var list<string>
     */
    public const array CITIES = [
        'Iriga City, Camarines Sur', 'Naga City, Camarines Sur', 'Legazpi City, Albay', 'Ligao City, Albay',
        'Tabaco City, Albay', 'Daet, Camarines Norte', 'Sorsogon City, Sorsogon', 'Pili, Camarines Sur',
        'Nabua, Camarines Sur', 'Buhi, Camarines Sur', 'Quezon City, Metro Manila', 'Makati City, Metro Manila',
        'Lucena City, Quezon', 'Cebu City, Cebu', 'Davao City, Davao del Sur',
    ];

    /**
     * @var list<string>
     */
    public const array ID_TYPES = ['PhilSys National ID', "Driver's License", 'Passport', 'UMID', 'Postal ID'];

    /**
     * Pick a random first and last name.
     *
     * @return array{0: string, 1: string}
     */
    public static function name(): array
    {
        return [fake()->randomElement(self::FIRST_NAMES), fake()->randomElement(self::LAST_NAMES)];
    }

    /**
     * Build a believable personal email address for a name.
     */
    public static function email(string $firstName, string $lastName): string
    {
        $local = Str::of("{$firstName}.{$lastName}")->lower()->replace(' ', '')->ascii();

        return $local.fake()->unique()->numberBetween(1, 9999).'@'.fake()->randomElement(['gmail.com', 'yahoo.com', 'outlook.com']);
    }

    /**
     * Build a Philippine mobile number.
     */
    public static function mobile(): string
    {
        return fake()->numerify('09'.fake()->randomElement(['17', '18', '19', '20', '27', '28', '38', '50', '62', '77', '95', '99']).'#######');
    }
}
