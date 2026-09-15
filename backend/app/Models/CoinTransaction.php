<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoinTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['wallet_id', 'amount', 'type', 'description', 'reference_id'];

    public function wallet()
    {
        return $this->belongsTo(CoinWallet::class, 'wallet_id');
    }
}
