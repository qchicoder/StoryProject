<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\CoinWallet;
use App\Models\CoinTransaction;
use App\Models\Payment;

class WalletController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $wallet = CoinWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        $packages = [
            ['id' => 'pkg_10', 'coins' => 20, 'price' => 20000, 'label' => 'Gói Nhập Môn'],
            ['id' => 'pkg_50', 'coins' => 60, 'price' => 50000, 'label' => 'Gói Phổ Thông (+10 xu)'],
            ['id' => 'pkg_100', 'coins' => 130, 'price' => 100000, 'label' => 'Gói Cao Cấp (+30 xu)'],
            ['id' => 'pkg_200', 'coins' => 280, 'price' => 200000, 'label' => 'Gói Đại Gia (+80 xu)'],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $wallet->balance,
                'packages' => $packages,
            ]
        ]);
    }

    public function transactions(Request $request)
    {
        $user = $request->user();
        $wallet = CoinWallet::where('user_id', $user->id)->first();

        $transactions = $wallet ? $wallet->transactions()->paginate(15) : [];

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|string',
            'payment_method' => 'required|in:VIETQR,MOMO,BANK_TRANSFER,SCRATCH_CARD',
            'card_telco' => 'nullable|string',
            'card_code' => 'nullable|string',
            'card_seri' => 'nullable|string',
        ]);

        $user = $request->user();

        $packages = [
            'pkg_10' => ['coins' => 20, 'price' => 20000, 'label' => 'Gói Nhập Môn'],
            'pkg_50' => ['coins' => 60, 'price' => 50000, 'label' => 'Gói Phổ Thông (+10 xu)'],
            'pkg_100' => ['coins' => 130, 'price' => 100000, 'label' => 'Gói Cao Cấp (+30 xu)'],
            'pkg_200' => ['coins' => 280, 'price' => 200000, 'label' => 'Gói Đại Gia (+80 xu)'],
        ];

        if ($validated['package_id'] === 'custom') {
            $price = (int) $request->input('custom_amount', 10000);
            if ($price < 10000) {
                return response()->json(['success' => false, 'message' => 'Số tiền nạp tối thiểu là 10.000 VNĐ'], 400);
            }
            if ($price > 10000000) {
                return response()->json(['success' => false, 'message' => 'Số tiền nạp tối đa là 10.000.000 VNĐ trong một lần'], 400);
            }
            $baseCoins = (int) floor($price / 1000);
            if ($price >= 200000) {
                $coins = (int) floor($baseCoins * 1.4);
            } elseif ($price >= 100000) {
                $coins = (int) floor($baseCoins * 1.3);
            } elseif ($price >= 50000) {
                $coins = (int) floor($baseCoins * 1.2);
            } else {
                $coins = $baseCoins;
            }
            $pkg = ['coins' => $coins, 'price' => $price, 'label' => 'Gói Nạp Tùy Chỉnh'];
        } else {
            if (!isset($packages[$validated['package_id']])) {
                return response()->json(['success' => false, 'message' => 'Gói nạp không hợp lệ'], 400);
            }
            $pkg = $packages[$validated['package_id']];
            $coins = $pkg['coins'];
        }

        // Apply 30% fee reduction for scratch card payments
        if ($validated['payment_method'] === 'SCRATCH_CARD') {
            $coins = (int) floor($pkg['coins'] * 0.7);
        }

        $txnCode = 'VD_' . strtoupper(uniqid());

        $payment = Payment::create([
            'user_id' => $user->id,
            'payment_method' => $validated['payment_method'],
            'coins_amount' => $coins,
            'money_amount' => $pkg['price'],
            'transaction_code' => $txnCode,
            'status' => 'PENDING',
        ]);

        // Generate VietQR info for simulated instant payment
        $qrUrl = "https://img.vietqr.io/image/MB-123456789-compact2.png?amount={$pkg['price']}&addInfo={$txnCode}&accountName=VAN%20DAN%20MEDIA";

        return response()->json([
            'success' => true,
            'message' => $validated['payment_method'] === 'SCRATCH_CARD' 
                ? 'Đã gửi thẻ cào thành công. Đang xử lý gạch thẻ...' 
                : 'Khởi tạo đơn hàng nạp xu thành công',
            'data' => [
                'payment_id' => $payment->id,
                'transaction_code' => $txnCode,
                'amount' => $pkg['price'],
                'coins' => $coins,
                'qr_url' => $qrUrl,
            ]
        ]);
    }

    public function verifyPayment(Request $request, $id)
    {
        $user = $request->user();
        $payment = Payment::where('id', $id)->where('user_id', $user->id)->firstOrFail();

        if ($payment->status === 'SUCCESS') {
            return response()->json(['success' => true, 'message' => 'Giao dịch đã được cộng xu thành công']);
        }

        DB::beginTransaction();
        try {
            // Mark payment as success
            $payment->status = 'SUCCESS';
            $payment->save();

            // Credit wallet
            $wallet = CoinWallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
            $wallet->balance += $payment->coins_amount;
            $wallet->save();

            // Record ledger transaction
            CoinTransaction::create([
                'wallet_id' => $wallet->id,
                'amount' => $payment->coins_amount,
                'type' => 'PURCHASE',
                'description' => "Nạp xu qua {$payment->payment_method} (Mã: {$payment->transaction_code})",
                'reference_id' => $payment->transaction_code,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xác nhận thanh toán thành công! Đã cộng xu vào ví.',
                'data' => [
                    'new_balance' => $wallet->balance
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xử lý xác nhận thanh toán'], 500);
        }
    }
}
