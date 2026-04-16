<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\FileUploaded;
use App\Listeners\LogUploadToMongo;
use App\Events\Auth\UserRegistered;
use App\Events\Auth\UserLoggedIn;
use App\Events\Auth\PasswordResetRequested;

// Listeners
use App\Listeners\SendWelcomeEmail;
use App\Listeners\LogUserLogin;
use App\Listeners\SendResetPasswordNotification;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        FileUploaded::class => [
            LogUploadToMongo::class,
        ],
        UserRegistered::class => [
            SendWelcomeEmail::class,
        ],

        UserLoggedIn::class => [
            LogUserLogin::class,
        ],

        PasswordResetRequested::class => [
            SendResetPasswordNotification::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        parent::boot();
    }
}
