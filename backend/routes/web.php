<?php

use App\Http\Controllers\EventOgController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/og-meta/{slug}', [EventOgController::class, 'show']);
