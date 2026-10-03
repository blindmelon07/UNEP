<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Institution Details
    |--------------------------------------------------------------------------
    |
    | Shown on the public booking site, the staff portal and guest-facing
    | messages. The hotel name itself comes from APP_NAME.
    |
    */

    'school' => env('HOTEL_SCHOOL', 'University of Northeastern Philippines'),

    'department' => env('HOTEL_DEPARTMENT', 'Department of Hospitality & Tourism Management'),

    'address' => env('HOTEL_ADDRESS', 'Iriga City, Camarines Sur, Philippines'),

    'phone' => env('HOTEL_PHONE', '(054) 456-0294'),

    'email' => env('HOTEL_EMAIL', 'info@unep.edu.ph'),

    'website' => env('HOTEL_WEBSITE', 'https://www.unep.edu.ph'),

    'motto' => ['Excellence', 'Innovation', 'Service', 'Sustainability'],

];
