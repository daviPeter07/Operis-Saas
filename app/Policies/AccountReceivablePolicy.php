<?php

namespace App\Policies;

use App\Models\AccountReceivable;
use App\Models\User;

class AccountReceivablePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AccountReceivable $accountReceivable): bool
    {
        return $user->current_company_id === $accountReceivable->company_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, AccountReceivable $accountReceivable): bool
    {
        return $user->current_company_id === $accountReceivable->company_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, AccountReceivable $accountReceivable): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, AccountReceivable $accountReceivable): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, AccountReceivable $accountReceivable): bool
    {
        return false;
    }
}
