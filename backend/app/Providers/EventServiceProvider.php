<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

use App\Events\Auth\PasswordResetRequested;
use App\Events\Auth\UserRegistered;
use App\Events\Auth\UserLoggedIn;
use App\Events\FileUploaded;

use App\Listeners\SendResetPasswordNotification;
use App\Listeners\SendWelcomeEmail;
use App\Listeners\LogUserLogin;
use App\Listeners\LogUploadToMongo;
use App\Events\OrderPaid;
use App\Listeners\SendOrderConfirmationEmail;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [

        // Existing Events
        FileUploaded::class => [
            LogUploadToMongo::class,
        ],

        UserRegistered::class => [
            SendWelcomeEmail::class,
        ],

        UserLoggedIn::class => [
            LogUserLogin::class,
        ],

        // New Order Paid Event
        OrderPaid::class => [
            SendOrderConfirmationEmail::class,
        ],

        // PasswordResetRequested is handled manually below
    ];


    public function boot(): void
    {
        parent::boot();


        // Remove any existing registrations for this event
        Event::forget(PasswordResetRequested::class);

        // Register exactly once
        Event::listen(
            PasswordResetRequested::class,
            SendResetPasswordNotification::class
        );
    }

    /**
     * Explicitly disable discovery
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
