<?php

namespace App\Http\Middleware;

use App\Models\CompanyUser;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCurrentCompanyMember
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user?->current_company_id) {
            return response()->json([
                'message' => 'User has no selected company.',
            ], Response::HTTP_FORBIDDEN);
        }

        $isMember = CompanyUser::query()
            ->where('company_id', $user->current_company_id)
            ->where('user_id', $user->id)
            ->exists();

        if (! $isMember) {
            return response()->json([
                'message' => 'User is not a member of the selected company.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
