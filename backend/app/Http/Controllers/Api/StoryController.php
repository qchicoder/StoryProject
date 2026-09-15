<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Story;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Follow;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Story::with(['author', 'category', 'tags'])
            ->where('status', 'PUBLISHED');

        if ($request->has('q') && !empty($request->q)) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('summary', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->has('category') && !empty($request->category)) {
            $categorySlug = $request->category;
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->has('type') && in_array(strtoupper($request->type), ['NOVEL', 'COMIC'])) {
            $query->where('content_type', strtoupper($request->type));
        }

        if ($request->has('featured') && $request->featured === 'true') {
            $query->where('is_featured', true);
        }

        $sort = $request->get('sort', 'latest');
        if ($sort === 'views') {
            $query->orderBy('view_count', 'desc');
        } else {
            $query->orderBy('updated_at', 'desc');
        }

        $stories = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $stories
        ]);
    }

    public function show(Request $request, $slug)
    {
        $story = Story::with(['author', 'category', 'tags', 'chapters'])
            ->where('slug', $slug)
            ->firstOrFail();

        $story->increment('view_count');

        $user = $request->user() ?? auth('sanctum')->user();
        $isFollowing = false;
        if ($user) {
            $isFollowing = Follow::where('user_id', $user->id)
                ->where('story_id', $story->id)
                ->exists();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'story' => $story,
                'is_following' => $isFollowing
            ]
        ]);
    }

    public function categories()
    {
        $categories = Category::withCount('stories')->get();
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    public function tags()
    {
        $tags = Tag::all();
        return response()->json([
            'success' => true,
            'data' => $tags
        ]);
    }
}
