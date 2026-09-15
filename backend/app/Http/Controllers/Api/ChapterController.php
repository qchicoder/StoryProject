<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Chapter;
use App\Models\ChapterUnlock;
use App\Models\CoinWallet;
use App\Models\CoinTransaction;
use App\Models\Comment;
use App\Models\ReadingProgress;
use App\Models\ReadingHistory;

class ChapterController extends Controller
{
    public function show(Request $request, $id)
    {
        if (!is_numeric($id)) {
            $chapter = Chapter::with(['story.author', 'textContent', 'comicImages'])
                ->where('slug', $id)
                ->firstOrFail();
        } else {
            $chapter = Chapter::with(['story.author', 'textContent', 'comicImages'])
                ->findOrFail($id);
        }

        return $this->renderChapterResponse($request, $chapter);
    }

    public function showBySlug(Request $request, $storySlug, $chapterSlug)
    {
        $story = \App\Models\Story::where('slug', $storySlug)->firstOrFail();

        $chapterNum = null;
        if (preg_match('/chuong-(\d+)/i', $chapterSlug, $m)) {
            $chapterNum = (int)$m[1];
        } elseif (is_numeric($chapterSlug)) {
            $chapterNum = (int)$chapterSlug;
        }

        $chapter = Chapter::with(['story.author', 'textContent', 'comicImages'])
            ->where('story_id', $story->id)
            ->where(function($q) use ($chapterSlug, $chapterNum) {
                $q->where('slug', $chapterSlug);
                if ($chapterNum !== null) {
                    $q->orWhere('chapter_number', $chapterNum);
                }
            })
            ->firstOrFail();

        return $this->renderChapterResponse($request, $chapter);
    }

    private function renderChapterResponse(Request $request, Chapter $chapter)
    {
        $chapter->increment('view_count');

        $user = $request->user() ?? auth('sanctum')->user();
        $isUnlocked = true;

        if ($chapter->is_paid) {
            if (!$user) {
                $isUnlocked = false;
            } else {
                $hasUnlocked = ChapterUnlock::where('user_id', $user->id)
                    ->where('chapter_id', $chapter->id)
                    ->exists();

                if (!$hasUnlocked && $user->role !== 'ADMIN') {
                    $isUnlocked = false;
                }
            }
        }

        // Save reading progress & history if user is logged in
        if ($user) {
            ReadingProgress::updateOrCreate(
                ['user_id' => $user->id, 'story_id' => $chapter->story_id],
                ['last_chapter_id' => $chapter->id, 'last_read_at' => now()]
            );

            ReadingHistory::create([
                'user_id' => $user->id,
                'story_id' => $chapter->story_id,
                'chapter_id' => $chapter->id,
                'read_at' => now()
            ]);
        }

        // Prev & Next chapter navigation (only select id, chapter_number, slug for maximum speed)
        $prevChapter = Chapter::select('id', 'chapter_number', 'slug')
            ->where('story_id', $chapter->story_id)
            ->where('chapter_number', '<', $chapter->chapter_number)
            ->orderBy('chapter_number', 'desc')
            ->first();

        $nextChapter = Chapter::select('id', 'chapter_number', 'slug')
            ->where('story_id', $chapter->story_id)
            ->where('chapter_number', '>', $chapter->chapter_number)
            ->orderBy('chapter_number', 'asc')
            ->first();

        $responseData = [
            'id' => $chapter->id,
            'story_id' => $chapter->story_id,
            'story_title' => $chapter->story->title,
            'story_slug' => $chapter->story->slug,
            'content_type' => $chapter->story->content_type,
            'chapter_number' => $chapter->chapter_number,
            'title' => $chapter->title,
            'is_paid' => $chapter->is_paid,
            'coin_price' => $chapter->coin_price,
            'is_unlocked' => $isUnlocked,
            'prev_chapter' => $prevChapter ? ['id' => $prevChapter->id, 'chapter_number' => $prevChapter->chapter_number, 'slug' => $prevChapter->slug] : null,
            'next_chapter' => $nextChapter ? ['id' => $nextChapter->id, 'chapter_number' => $nextChapter->chapter_number, 'slug' => $nextChapter->slug] : null,
        ];

        if ($isUnlocked) {
            if ($chapter->story->content_type === 'NOVEL') {
                $responseData['content'] = $chapter->textContent ? $chapter->textContent->content : '';
            } else {
                $responseData['comic_images'] = $chapter->comicImages;
            }
        } else {
            $responseData['content_preview'] = "Nội dung chương này được khóa bản quyền (Giá: {$chapter->coin_price} xu). Vui lòng mở khóa để xem tiếp.";
        }

        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }

    public function unlock(Request $request, $id)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để mở khóa chương.'], 401);
        }

        $chapter = Chapter::with(['textContent', 'comicImages', 'story'])->findOrFail($id);

        if (!$chapter->is_paid) {
            return response()->json(['success' => true, 'message' => 'Chương này hoàn toàn miễn phí.']);
        }

        // Check if already unlocked
        $alreadyUnlocked = ChapterUnlock::where('user_id', $user->id)
            ->where('chapter_id', $chapter->id)
            ->exists();

        if ($alreadyUnlocked) {
            return response()->json(['success' => true, 'message' => 'Bạn đã mở khóa chương này trước đó.']);
        }

        DB::beginTransaction();
        try {
            $wallet = CoinWallet::where('user_id', $user->id)->lockForUpdate()->first();

            if (!$wallet || $wallet->balance < $chapter->coin_price) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Số dư xu không đủ để mở khóa chương. Vui lòng nạp thêm xu!',
                    'required_coins' => $chapter->coin_price,
                    'current_balance' => $wallet ? $wallet->balance : 0
                ], 400);
            }

            // Deduct coins
            $wallet->balance -= $chapter->coin_price;
            $wallet->save();

            // Record transaction
            CoinTransaction::create([
                'wallet_id' => $wallet->id,
                'amount' => -$chapter->coin_price,
                'type' => 'SPEND',
                'description' => "Mở khóa {$chapter->story->title} - {$chapter->title}",
                'reference_id' => "CHAPTER_{$chapter->id}",
            ]);

            // Create unlock record
            ChapterUnlock::create([
                'user_id' => $user->id,
                'chapter_id' => $chapter->id,
                'coins_spent' => $chapter->coin_price,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Mở khóa chương thành công!',
                'data' => [
                    'remaining_balance' => $wallet->balance,
                    'chapter' => [
                        'id' => $chapter->id,
                        'content' => $chapter->story->content_type === 'NOVEL' ? ($chapter->textContent ? $chapter->textContent->content : '') : null,
                        'comic_images' => $chapter->story->content_type === 'COMIC' ? $chapter->comicImages : null
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống khi xử lý giao dịch: ' . $e->getMessage()], 500);
        }
    }

    public function comments($id)
    {
        $comments = Comment::with(['user', 'replies.user'])
            ->where('chapter_id', $id)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $comments
        ]);
    }

    public function addComment(Request $request, $id)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $chapter = Chapter::findOrFail($id);

        $comment = Comment::create([
            'user_id' => $request->user()->id,
            'story_id' => $chapter->story_id,
            'chapter_id' => $chapter->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bình luận thành công',
            'data' => $comment->load('user')
        ]);
    }
}
