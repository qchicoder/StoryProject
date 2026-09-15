<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Author;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Story;
use App\Models\Chapter;
use App\Models\ChapterContent;
use App\Models\ComicImage;
use App\Models\CoinWallet;
use App\Models\CoinTransaction;
use App\Models\Advertisement;
use App\Models\Comment;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users & Admin
        $admin = User::create([
            'name' => 'Quản Trị Viên (Admin)',
            'email' => 'admin@truyenvui.vn',
            'password' => Hash::make('password'),
            'role' => 'ADMIN',
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        ]);

        $user = User::create([
            'name' => 'Độc Giả Văn Đàn',
            'email' => 'user@truyenvui.vn',
            'password' => Hash::make('password'),
            'role' => 'USER',
            'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        ]);

        // Wallet for user with initial 50 coins
        $wallet = CoinWallet::create([
            'user_id' => $user->id,
            'balance' => 50,
        ]);

        CoinTransaction::create([
            'wallet_id' => $wallet->id,
            'amount' => 50,
            'type' => 'PURCHASE',
            'description' => 'Nạp Xu Tân Thủ - Gói Khởi Đầu',
            'reference_id' => 'INIT_BONUS_001',
        ]);

        // 2. Authors
        $author1 = Author::create([
            'name' => 'Hoàng Nam',
            'slug' => 'hoang-nam',
            'bio' => 'Tác giả dã sử & tiểu thuyết lịch sử đại việt đương đại.',
            'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        ]);

        $author2 = Author::create([
            'name' => 'Đông Phong',
            'slug' => 'dong-phong',
            'bio' => 'Họa sĩ webtoon comic thần thoại cổ trang.',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        ]);

        // 3. Categories
        $cat1 = Category::create(['name' => 'Dã Sử & Cổ Trang', 'slug' => 'da-su-co-trang', 'description' => 'Tiểu thuyết lịch sử, dã sử hào hùng']);
        $cat2 = Category::create(['name' => 'Truyện Tranh Webtoon', 'slug' => 'truyen-tranh-webtoon', 'description' => 'Comic nét vẽ đương đại']);
        $cat3 = Category::create(['name' => 'Tiên Hiệp', 'slug' => 'tien-hiep', 'description' => 'Tu tiên, võ học huyền thoại']);
        $cat4 = Category::create(['name' => 'Huyền Huyễn', 'slug' => 'huyen-huan', 'description' => 'Thế giới huyền bí phép thuật']);

        // 4. Tags
        $tag1 = Tag::create(['name' => 'Bản Quyền', 'slug' => 'ban-quyen']);
        $tag2 = Tag::create(['name' => 'Việt Nam', 'slug' => 'viet-nam']);
        $tag3 = Tag::create(['name' => 'Hot', 'slug' => 'hot']);

        // 5. Story 1: Gió Lộng Trời Nam (Novel)
        $novel = Story::create([
            'title' => 'Gió Lộng Trời Nam',
            'slug' => 'gio-long-troi-nam',
            'summary' => 'Bối cảnh Đại Việt thế kỷ 13 trước cơn bão xâm lược phương Bắc. Câu chuyện về những trang nam nhi khoác áo vải, cầm kiếm giữ bờ cõi sông núi.',
            'cover_url' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            'content_type' => 'NOVEL',
            'status' => 'PUBLISHED',
            'view_count' => 12500,
            'author_id' => $author1->id,
            'category_id' => $cat1->id,
            'is_featured' => true,
        ]);
        $novel->tags()->attach([$tag1->id, $tag2->id, $tag3->id]);

        // Novel Chapters
        $ch1 = Chapter::create([
            'story_id' => $novel->id,
            'chapter_number' => 1,
            'title' => 'Chương 1: Tiếng Trống Đêm Trằn Trọc',
            'slug' => 'chuong-1-tieng-trong-dem-tran-troc',
            'is_paid' => false,
            'coin_price' => 0,
            'view_count' => 5400,
            'status' => 'PUBLISHED',
        ]);
        ChapterContent::create([
            'chapter_id' => $ch1->id,
            'content' => "<p>Gió chướng thổi qua bờ sông Hồng, cuốn theo hơi lạnh ẩm ướt của đêm mùa thu. Trần Quốc Chấn đứng trên vọng lâu cảng Luy Lâu, đôi mắt đăm đăm nhìn về phía dải mây đen kịt xám xịt phương Bắc.</p><p>Tay ông siết chặt chuôi kiếm cổ nạm bạc. Đã ba đêm nay, tiếng trống canh từ đồn trạm xa xa dường như dồn dập hơn mọi khi. Tin tức từ biên giới truyền về từng giờ: đại quân địch đang rầm rộ hội quân bên kia dòng sông lớn.</p><p>\"Tiểu chủ, trà đã nguội rồi,\" giọng nói trầm đục của người gia nhân già vang lên sau lưng. Người ấy đặt chiếc tách gốm men ngọc lên bệ đá.</p><p>Trần Quốc Chấn quay lại, mỉm cười nhẹ nhưng ánh mắt không giấu nổi vẻ ưu tư: \"Lão Đồn, trà nguội có thể hâm lại, nhưng vận nước một khi đã trôi qua thì làm sao giữ lấy? Đêm nay hớn hở, ngày mai có thể chiến trường đao binh rực trời.\"</p><p>Lời nói chưa dứt, một trinh sát cưỡi ngựa chiến vượt đêm phi nước đại vào cổng thành, tiếng vó ngựa dồn dập vang động cả cõi lòng...</p>",
        ]);

        $ch2 = Chapter::create([
            'story_id' => $novel->id,
            'chapter_number' => 2,
            'title' => 'Chương 2: Bóng Cờ Bên Sông Hồng',
            'slug' => 'chuong-2-bong-co-ben-song-hong',
            'is_paid' => false,
            'coin_price' => 0,
            'view_count' => 4100,
            'status' => 'PUBLISHED',
        ]);
        ChapterContent::create([
            'chapter_id' => $ch2->id,
            'content' => "<p>Sương mù sáng sớm che phủ khắp mặt sông Hồng. Hàng trăm chiến thuyền ngực rồng ngực phượng rẽ nước tiến vào bến Vạn Kiếp, cờ xí tung bay đỏ rợp cả một khoảng trời.</p><p>Trên soái hạm, Hưng Đạo Đại Vương sừng sững uy nghiêm. Ánh mắt Người lướt qua hàng vạn binh sĩ áo vải sẵn sàng hy sinh vì giang sơn sơn hà.</p><p>\"Chúng ta đứng đây, không chỉ cho hôm nay, mà cho vạn đời sau!\" Tiếng hô vang vọng khắp mặt sông, cuốn theo sĩ khí ngút trời của toàn quân...</p>",
        ]);

        $ch3 = Chapter::create([
            'story_id' => $novel->id,
            'chapter_number' => 3,
            'title' => 'Chương 3: Kỳ Môn Độc Trận (Chương Bản Quyền)',
            'slug' => 'chuong-3-ky-mon-doc-tran',
            'is_paid' => true,
            'coin_price' => 5,
            'view_count' => 2900,
            'status' => 'PUBLISHED',
        ]);
        ChapterContent::create([
            'chapter_id' => $ch3->id,
            'content' => "<p>Đây là chương bản quyền cao cấp. Trận đồ Kỳ Môn Độn Giáp bố trí tại thung lũng Bạch Đằng đã sẵn sàng. Trần Quốc Chấn trực tiếp chỉ huy đội cảm tử gài hàng ngàn cọc gỗ bọc sắt chìm sâu dưới lòng sông...</p><p>Thủy triều đang rút nhanh, trận chiến sinh tử sắp sửa bùng nổ!</p>",
        ]);

        // 5b. Story 2: Tuyết Sơn Hùng Sư (Novel Featured 2)
        $novel2 = Story::create([
            'title' => 'Tuyết Sơn Hùng Sư',
            'slug' => 'tuyet-son-hung-su',
            'summary' => 'Cuộc chinh phạt viễn đông của ngàn kỵ binh bão tuyết. Câu chuyện về tình huynh đệ, lòng trung trinh và sứ mệnh bảo vệ vương triều trước thảm họa diệt vong.',
            'cover_url' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
            'content_type' => 'NOVEL',
            'status' => 'PUBLISHED',
            'view_count' => 24800,
            'author_id' => $author1->id,
            'category_id' => $cat4->id,
            'is_featured' => true,
        ]);
        $novel2->tags()->attach([$tag1->id, $tag3->id]);

        $novel2Ch1 = Chapter::create([
            'story_id' => $novel2->id,
            'chapter_number' => 1,
            'title' => 'Chương 1: Bão Tuyết Biên Ranh',
            'slug' => 'chuong-1-bao-tuyet-bien-ranh',
            'is_paid' => false,
            'coin_price' => 0,
            'view_count' => 8200,
            'status' => 'PUBLISHED',
        ]);
        ChapterContent::create([
            'chapter_id' => $novel2Ch1->id,
            'content' => "<p>Bão tuyết phủ kín đỉnh Sơn La. Những chiến ngực bọc giáp nặng nề dậm chân trên lớp tuyết dày nửa thước. Tiếng tù và cất lên rùng rợn cả đỉnh núi trùng điệp...</p>",
        ]);

        // 5c. Story 3: Thần Tiên Kiếp: Vĩnh Hằng Chi Đế (Novel Featured 3)
        $novel3 = Story::create([
            'title' => 'Thần Tiên Kiếp: Vĩnh Hằng Chi Đế',
            'slug' => 'than-tien-kiep-vinh-hang-chi-de',
            'summary' => 'Mười vạn năm trước phong ấn ma tộc, mười vạn năm sau trùng sinh làm thiếu niên nghèo khó. Tay cầm Thần Kiếm phá vỡ trùng trùng xiềng xích vương triều.',
            'cover_url' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
            'content_type' => 'NOVEL',
            'status' => 'PUBLISHED',
            'view_count' => 31200,
            'author_id' => $author1->id,
            'category_id' => $cat3->id,
            'is_featured' => true,
        ]);
        $novel3->tags()->attach([$tag1->id, $tag2->id, $tag3->id]);

        $novel3Ch1 = Chapter::create([
            'story_id' => $novel3->id,
            'chapter_number' => 1,
            'title' => 'Chương 1: Trùng Sinh Thất Thần',
            'slug' => 'chuong-1-trung-sinh-that-than',
            'is_paid' => false,
            'coin_price' => 0,
            'view_count' => 11400,
            'status' => 'PUBLISHED',
        ]);
        ChapterContent::create([
            'chapter_id' => $novel3Ch1->id,
            'content' => "<p>Ánh sấm sét màu vàng kim rạch đôi bầu trời Vô Song Giới. Tiêu Phong mở mắt, cảm nhận từng dòng linh khí chảy cuồn cuộn trong huyết quản sau mười vạn năm trầm luân...</p>",
        ]);

        // 6. Story 2: Kỳ Nữ Bến Vạn Kiếp (Comic)
        $comic = Story::create([
            'title' => 'Kỳ Nữ Bến Vạn Kiếp',
            'slug' => 'ky-nu-ben-van-kiep',
            'summary' => 'Truyện tranh Webtoon giả tưởng lịch sử Việt Nam. Hành trình của nữ sát thủ mang trong mình linh khí đại ngàn.',
            'cover_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            'content_type' => 'COMIC',
            'status' => 'PUBLISHED',
            'view_count' => 18900,
            'author_id' => $author2->id,
            'category_id' => $cat2->id,
            'is_featured' => true,
        ]);
        $comic->tags()->attach([$tag2->id, $tag3->id]);

        $comicCh1 = Chapter::create([
            'story_id' => $comic->id,
            'chapter_number' => 1,
            'title' => 'Chương 1: Gặp Gỡ Đêm Trăng',
            'slug' => 'chuong-1-gap-go-dem-trang',
            'is_paid' => false,
            'coin_price' => 0,
            'view_count' => 8900,
            'status' => 'PUBLISHED',
        ]);

        $comicImages = [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
        ];
        foreach ($comicImages as $idx => $img) {
            ComicImage::create([
                'chapter_id' => $comicCh1->id,
                'image_url' => $img,
                'order_index' => $idx + 1,
            ]);
        }

        $comicCh2 = Chapter::create([
            'story_id' => $comic->id,
            'chapter_number' => 2,
            'title' => 'Chương 2: Biến Cố Vạn Kiếp (Chương VIP)',
            'slug' => 'chuong-2-bien-co-van-kiep',
            'is_paid' => true,
            'coin_price' => 10,
            'view_count' => 4200,
            'status' => 'PUBLISHED',
        ]);
        foreach ($comicImages as $idx => $img) {
            ComicImage::create([
                'chapter_id' => $comicCh2->id,
                'image_url' => $img,
                'order_index' => $idx + 1,
            ]);
        }

        // 7. Comments
        Comment::create([
            'user_id' => $user->id,
            'story_id' => $novel->id,
            'chapter_id' => $ch1->id,
            'content' => 'Truyện viết hào hùng quá! Văn phong đầm chất sử Việt, mình thích nhất chi tiết miêu tả bến Luy Lâu.',
            'likes_count' => 12,
        ]);

        // 8. Advertisements
        Advertisement::create([
            'title' => 'Quảng Cáo Sách Nhã Nam',
            'placement' => 'CHAPTER_BOTTOM',
            'type' => 'IMAGE',
            'image_url' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
            'target_url' => 'https://nhanam.vn',
            'is_active' => true,
        ]);
    }
}
