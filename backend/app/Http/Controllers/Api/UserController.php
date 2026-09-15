<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Bookmark;
use App\Models\Follow;
use App\Models\ReadingHistory;
use App\Models\ReadingProgress;
use App\Models\Story;

class UserController extends Controller
{
    public function library(Request $request)
    {
        $user = $request->user();

        $follows = Follow::with(['story.author', 'story.category'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $readingProgress = ReadingProgress::with(['story.author', 'chapter'])
            ->where('user_id', $user->id)
            ->orderBy('last_read_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'follows' => $follows,
                'reading_progress' => $readingProgress,
            ]
        ]);
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $history = ReadingHistory::with(['story.author', 'chapter'])
            ->where('user_id', $user->id)
            ->orderBy('read_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $history
        ]);
    }

    public function toggleFollow(Request $request, $storyId)
    {
        $user = $request->user();
        $story = Story::findOrFail($storyId);

        $follow = Follow::where('user_id', $user->id)->where('story_id', $story->id)->first();

        if ($follow) {
            $follow->delete();
            return response()->json(['success' => true, 'is_following' => false, 'message' => 'Đã bỏ theo dõi truyện']);
        } else {
            Follow::create(['user_id' => $user->id, 'story_id' => $story->id]);
            return response()->json(['success' => true, 'is_following' => true, 'message' => 'Đã theo dõi truyện vào tủ sách']);
        }
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|string|max:500',
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (!empty($validated['avatar'])) {
            $user->avatar = $validated['avatar'];
        }

        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thông tin tài khoản thành công',
            'data' => $user->load('wallet')
        ]);
    }
}
