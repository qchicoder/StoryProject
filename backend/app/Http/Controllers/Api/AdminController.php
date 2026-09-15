<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Story;
use App\Models\Chapter;
use App\Models\ChapterContent;
use App\Models\ComicImage;
use App\Models\User;
use App\Models\Payment;
use App\Models\Advertisement;

class AdminController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'ADMIN') {
            abort(403, 'Bạn không có quyền truy cập trang quản trị.');
        }
    }

    public function stats(Request $request)
    {
        $this->checkAdmin($request);

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => User::count(),
                'total_stories' => Story::count(),
                'total_chapters' => Chapter::count(),
                'total_revenue' => Payment::where('status', 'SUCCESS')->sum('money_amount'),
                'latest_payments' => Payment::with('user')->orderBy('created_at', 'desc')->take(5)->get(),
            ]
        ]);
    }

    public function stories(Request $request)
    {
        $this->checkAdmin($request);

        $stories = Story::with(['author', 'category'])->withCount('chapters')->paginate(15);
        return response()->json(['success' => true, 'data' => $stories]);
    }

    public function storeStory(Request $request)
    {
        $this->checkAdmin($request);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'nullable|string',
            'cover_url' => 'nullable|string',
            'content_type' => 'required|in:NOVEL,COMIC',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . rand(1000, 9999);

        $story = Story::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tạo tác phẩm mới thành công!',
            'data' => $story
        ], 201);
    }

    public function storeChapter(Request $request, $storyId)
    {
        $this->checkAdmin($request);

        $story = Story::findOrFail($storyId);

        $validated = $request->validate([
            'chapter_number' => 'required|integer',
            'title' => 'required|string|max:255',
            'is_paid' => 'boolean',
            'coin_price' => 'nullable|integer',
            'content' => 'nullable|string', // For Novel
            'images' => 'nullable|array',   // For Comic
        ]);

        $chapter = Chapter::create([
            'story_id' => $story->id,
            'chapter_number' => $validated['chapter_number'],
            'title' => $validated['title'],
            'slug' => 'chuong-' . $validated['chapter_number'],
            'is_paid' => $validated['is_paid'] ?? false,
            'coin_price' => $validated['coin_price'] ?? 0,
            'status' => 'PUBLISHED',
        ]);

        if ($story->content_type === 'NOVEL') {
            ChapterContent::create([
                'chapter_id' => $chapter->id,
                'content' => $validated['content'] ?? '<p>Nội dung đang được cập nhật...</p>',
            ]);
        } else if ($story->content_type === 'COMIC' && isset($validated['images'])) {
            foreach ($validated['images'] as $idx => $imgUrl) {
                ComicImage::create([
                    'chapter_id' => $chapter->id,
                    'image_url' => $imgUrl,
                    'order_index' => $idx + 1,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Thêm chương mới thành công!',
            'data' => $chapter
        ], 201);
    }

    public function ads(Request $request)
    {
        $this->checkAdmin($request);
        $ads = Advertisement::all();
        return response()->json(['success' => true, 'data' => $ads]);
    }
}
