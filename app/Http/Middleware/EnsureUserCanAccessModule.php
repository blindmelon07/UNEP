<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanAccessModule
{
    /**
     * Allow the request only when the user's role grants at least one of the given modules.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$modules): Response
    {
        $user = $request->user();

        abort_unless(
            $user !== null && collect($modules)->contains(fn (string $module): bool => $user->canAccessModule($module)),
            Response::HTTP_FORBIDDEN,
        );

        return $next($request);
    }
}
