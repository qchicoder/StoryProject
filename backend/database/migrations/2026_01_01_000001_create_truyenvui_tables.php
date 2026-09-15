<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Authors
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('bio')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
        });

        // 2. Categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Tags
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // 4. Stories (Novel & Comic)
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary')->nullable();
            $table->string('cover_url')->nullable();
            $table->enum('content_type', ['NOVEL', 'COMIC'])->default('NOVEL');
            $table->enum('status', ['DRAFT', 'PUBLISHED', 'COMPLETED'])->default('PUBLISHED');
            $table->unsignedBigInteger('view_count')->default(0);
            $table->foreignId('author_id')->constrained('authors')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // 5. Story Tags Pivot
        Schema::create('story_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained('tags')->onDelete('cascade');
            $table->timestamps();
        });

        // 6. Chapters
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->integer('chapter_number');
            $table->string('title');
            $table->string('slug');
            $table->boolean('is_paid')->default(false);
            $table->integer('coin_price')->default(0);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->enum('status', ['DRAFT', 'PUBLISHED'])->default('PUBLISHED');
            $table->timestamps();

            $table->unique(['story_id', 'chapter_number']);
        });

        // 7. Novel Chapter Content
        Schema::create('chapter_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->longText('content');
            $table->timestamps();
        });

        // 8. Comic Chapter Images
        Schema::create('comic_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->string('image_url');
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });

        // 9. Reading Progress & History & Bookmarks & Follows
        Schema::create('reading_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->foreignId('last_chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->timestamp('last_read_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'story_id']);
        });

        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'story_id']);
        });

        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'story_id']);
        });

        Schema::create('reading_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->timestamp('read_at')->useCurrent();
            $table->timestamps();
        });

        // 10. Comments, Likes & Reports
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('story_id')->constrained('stories')->onDelete('cascade');
            $table->foreignId('chapter_id')->nullable()->constrained('chapters')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
            $table->text('content');
            $table->integer('likes_count')->default(0);
            $table->timestamps();
        });

        Schema::create('comment_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('comment_id')->constrained('comments')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['user_id', 'comment_id']);
        });

        Schema::create('comment_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('comment_id')->constrained('comments')->onDelete('cascade');
            $table->string('reason');
            $table->enum('status', ['PENDING', 'RESOLVED', 'DISMISSED'])->default('PENDING');
            $table->timestamps();
        });

        // 11. Coin Wallets & Financial Engine
        Schema::create('coin_wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->integer('balance')->default(0);
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('coin_wallets')->onDelete('cascade');
            $table->integer('amount'); // Positive for deposit, negative for spend
            $table->enum('type', ['PURCHASE', 'SPEND', 'REFUND', 'ADMIN_ADJUST']);
            $table->string('description');
            $table->string('reference_id')->nullable(); // Order ID or Chapter ID
            $table->timestamps();
        });

        Schema::create('chapter_unlocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('chapter_id')->constrained('chapters')->onDelete('cascade');
            $table->integer('coins_spent');
            $table->timestamps();

            $table->unique(['user_id', 'chapter_id']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('payment_method'); // MOMO, VIETQR, BANK_TRANSFER
            $table->integer('coins_amount');
            $table->decimal('money_amount', 12, 2);
            $table->string('transaction_code')->unique();
            $table->enum('status', ['PENDING', 'SUCCESS', 'FAILED'])->default('PENDING');
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        // 12. Advertisements
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('placement', ['HEADER', 'CHAPTER_BOTTOM', 'SIDEBAR'])->default('CHAPTER_BOTTOM');
            $table->enum('type', ['IMAGE', 'ADSENSE', 'AFFILIATE'])->default('IMAGE');
            $table->string('image_url')->nullable();
            $table->string('target_url')->nullable();
            $table->text('script_code')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('chapter_unlocks');
        Schema::dropIfExists('coin_transactions');
        Schema::dropIfExists('coin_wallets');
        Schema::dropIfExists('comment_reports');
        Schema::dropIfExists('comment_likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('reading_histories');
        Schema::dropIfExists('follows');
        Schema::dropIfExists('bookmarks');
        Schema::dropIfExists('reading_progress');
        Schema::dropIfExists('comic_images');
        Schema::dropIfExists('chapter_contents');
        Schema::dropIfExists('chapters');
        Schema::dropIfExists('story_tag');
        Schema::dropIfExists('stories');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('authors');
    }
};
