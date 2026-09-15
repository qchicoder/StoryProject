<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Author;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Story;
use App\Models\Chapter;
use App\Models\ChapterContent;
use App\Models\ComicImage;

class Story100Seeder extends Seeder
{
    public function run(): void
    {
        // 1. All 15 Categories
        $categoriesData = [
            ['name' => 'Dã Sử & Cổ Trang', 'slug' => 'da-su-co-trang', 'description' => 'Tiểu thuyết dã sử, cổ trang hào hùng nước Việt'],
            ['name' => 'Truyện Tranh Webtoon', 'slug' => 'truyen-tranh-webtoon', 'description' => 'Comic nét vẽ hiện đại, webtoon rực rỡ'],
            ['name' => 'Tiên Hiệp', 'slug' => 'tien-hiep', 'description' => 'Tu tiên vấn đạo, phi thăng trường sinh'],
            ['name' => 'Huyền Huyễn', 'slug' => 'huyen-huan', 'description' => 'Thế giới ma pháp, thần thoại cổ đại'],
            ['name' => 'Đô Thị', 'slug' => 'do-thi', 'description' => 'Cuộc sống hiện đại, dị năng đô thị, thần y'],
            ['name' => 'Ngôn Tình', 'slug' => 'ngon-tinh', 'description' => 'Tình yêu lãng mạn, ngọt ngào, trắc trở'],
            ['name' => 'Chuyển Sinh', 'slug' => 'chuyen-sinh', 'description' => 'Tái sinh thế giới mới, mang theo hệ thống'],
            ['name' => 'Xuyên Không', 'slug' => 'xuyen-khong', 'description' => 'Vượt thời gian trở về quá khứ hoặc tương lai'],
            ['name' => 'Manhua', 'slug' => 'manhua', 'description' => 'Truyện tranh Trung Hoa huyền ảo'],
            ['name' => 'Manhwa', 'slug' => 'manhwa', 'description' => 'Truyện tranh Hàn Quốc kịch tính'],
            ['name' => 'Hành Động (Action)', 'slug' => 'action', 'description' => 'Võ thuật, va chạm rực lửa, mạo hiểm'],
            ['name' => 'Phiêu Lưu (Adventure)', 'slug' => 'adventure', 'description' => 'Hành trình khám phá vùng đất bí ẩn'],
            ['name' => 'Võ Thuật (Martial Arts)', 'slug' => 'martial-arts', 'description' => 'Giang hồ kiếm hiệp, xưng bá võ lâm'],
            ['name' => 'Hài Hước (Comedy)', 'slug' => 'comedy', 'description' => 'Giải trí, dí dỏm, tiếng cười sảng khoái'],
            ['name' => 'Trinh Thám', 'slug' => 'mystery', 'description' => 'Phá án kịch tính, suy luận bí ẩn'],
        ];

        $categories = [];
        foreach ($categoriesData as $c) {
            $categories[] = Category::firstOrCreate(['slug' => $c['slug']], $c);
        }

        // 2. Authors
        $authorsData = [
            ['name' => 'Hoàng Nam', 'slug' => 'hoang-nam', 'bio' => 'Chuyên gia tiểu thuyết dã sử kinh điển'],
            ['name' => 'Đông Phong', 'slug' => 'dong-phong', 'bio' => 'Họa sĩ minh họa Webtoon & Comic'],
            ['name' => 'Mộc Trà', 'slug' => 'moc-tra', 'bio' => 'Tác giả ngôn tình & đô thị tình cảm'],
            ['name' => 'Vũ Thanh', 'slug' => 'vu-thanh', 'bio' => 'Đại thần sáng tác Tiên Hiệp & Võ Thuật'],
            ['name' => 'Nam Phong', 'slug' => 'nam-phong', 'bio' => 'Nhà văn phiêu lưu & giả tưởng cổ đại'],
            ['name' => 'Tuyết Nhi', 'slug' => 'tuyet-nhi', 'bio' => 'Tác giả trinh thám kịch tính'],
            ['name' => 'Nhật Minh', 'slug' => 'nhat-minh', 'bio' => 'Sáng tác truyện chuyển sinh hệ thống'],
            ['name' => 'Lam Hải', 'slug' => 'lam-hai', 'bio' => 'Họa sĩ Manhua & Manhwa độc quyền'],
            ['name' => 'Bích Vân', 'slug' => 'bich-van', 'bio' => 'Tiểu thuyết gia xuyên không & nữ cường'],
            ['name' => 'Quốc Bảo', 'slug' => 'quoc-bao', 'bio' => 'Tác giả hành động kịch tính'],
        ];

        $authors = [];
        foreach ($authorsData as $a) {
            $authors[] = Author::firstOrCreate(['slug' => $a['slug']], [
                'name' => $a['name'],
                'bio' => $a['bio'],
                'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            ]);
        }

        // 3. Tags
        $tagHot = Tag::firstOrCreate(['slug' => 'hot'], ['name' => 'Hot']);
        $tagFull = Tag::firstOrCreate(['slug' => 'full'], ['name' => 'Full']);
        $tagBảnQuyền = Tag::firstOrCreate(['slug' => 'ban-quyen'], ['name' => 'Bản Quyền']);
        $tagTop = Tag::firstOrCreate(['slug' => 'top-view'], ['name' => 'Top View']);

        // Stock high-quality book cover images
        $covers = [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
        ];

        // Unique Title Generator Seeds by Genre
        $titlesByGenre = [
            'da-su-co-trang' => [
                'Bạch Đằng Trầm Kiếm', 'Đại Việt Long Khí', 'Tập Trận Vạn Kiếp', 'Thiên Hạ Đại Định', 
                'Nam Quốc Sơn Hà', 'Vạn Xuân Thần Khí', 'Tây Sơn Nguyện Cảnh', 'Cổ Thành U Uẩn', 
                'Triều Đóa Trúc Lâm', 'Sương Phủ Hoàng Thành', 'Hoàng Hoa Sứ Tiết', 'Hùng Thiết Gia Định'
            ],
            'truyen-tranh-webtoon' => [
                'Nữ Sát Thủ Thành Đông', 'Vũ Điệu Ánh Sáng', 'Đại Chiến Linh Giới Webtoon', 'Ký Ức Hồng Sương', 
                'Họa Sĩ Thời Không', 'Biên Niên Sử Ngũ Hành', 'Chiến Sĩ Ngân Hà', 'Truyền Thuyết Long Tộc',
                'Hồn Linh Phố Cổ', 'Phù Thủy Ánh Trăng', 'Bóng Đêm Thập Tự', 'Thiên Thần Mất Cánh'
            ],
            'tien-hiep' => [
                'Vô Song Thiên Tôn', 'Đại Đạo Độc Hành', 'Bất Tử Cửu Trọng Thiên', 'Vĩnh Hằng Kiếm Đế', 
                'Kiếm Phá Thần Châu', 'Chuyển Sinh Thành Tiên Đế', 'Linh Khí Khôi Phục', 'Hồng Hoang Đại Kiếp',
                'Tôn Thượng', 'Cửu Thiên Huyền Thoại', 'Bất Hủ Pháp Vương', 'Thiên Đạo Luân Hồi'
            ],
            'huyen-huan' => [
                'Thần Thoại Phục Tinh', 'Vô Thượng Thần Hoàng', 'Thiên Ma Trùng Sinh', 'Huyết Mạch Thần Long',
                'Bát Hoang Vũ Trụ', 'Vạn Giới Đại Chiến', 'Thần Điện U Tối', 'Hạt Nhân Tối Cao',
                'Cổ Huyết Cuồng Đao', 'Thánh Địa Tuyệt Vọng', 'Dị Giới Ma Đế', 'Ánh Sáng Khởi Nguyên'
            ],
            'do-thi' => [
                'Thần Y Đô Thị', 'Đại Phú Hào Trùng Sinh', 'Hệ Thống Tiêu Tiền Đô Thị', 'Vua Trở Về Đô Thị',
                'Long Ẩn Phố Phường', 'Chiến Thần Đô Thị', 'Bác Sĩ Thiên Tài', 'Gia Tộc Hào Môn',
                'Đô Thị Siêu Cấp Vương', 'Quyền Lực Bóng Đêm', 'Cao Thủ Học Đường', 'Siêu Cấp Thần Đô'
            ],
            'ngon-tinh' => [
                'Cổ Cồn Trắng Tình Yêu', 'Bản Hợp Đồng Trọn Đời', 'Tổng Tài Bá Đạo Sủng Thần', 'Nhật Ký Tình Yêu',
                'Anh Là Nắng Của Em', 'Hương Thảo Ngọt Ngào', 'Duyên Tình Năm Tháng', 'Thầm Yêu Mười Năm',
                'Nguyện Cùng Anh Ngắm Mưa', 'Lời Thề Đêm Đông', 'Mơ Về Phía Anh', 'Nụ Cười Tháng Tư'
            ],
            'chuyen-sinh' => [
                'Chuyển Sinh Thành Rồng Huyền Thoại', 'Tái Sinh Làm Hoàng Tử', 'Mang Theo Hệ Thống Bá Chủ',
                'Chuyển Sinh Làm Triệu Hoán Sĩ', 'Tái Sinh Thành Ma Vương', 'Ma Vương Trở Lại Học Viện',
                'Chuyển Sinh Ở Thế Giới Dị Năng', 'Tái Sinh Thành Kiếm Sĩ Cực Hạn', 'Nhật Ký Chuyển Sinh',
                'Bắt Đầu Với Hệ Thống Vô Địch'
            ],
            'xuyen-khong' => [
                'Xuyên Không Làm Nữ Vương', 'Xuyên Về Thời Lý Trấn Phân', 'Nữ Y Xuyên Không',
                'Xuyên Thành Vương Phi Sủng Ái', 'Xuyên Đến Thời Vương Triều Cổ', 'Bá Chủ Xuyên Không',
                'Xuyên Vào Tiểu Thuyết Làm Villian', 'Xuyên Đến Dị Giới Bán Hàng', 'Xuyên Không Về Đêm Mùa Hạ'
            ],
            'manhua' => [
                'Báo Thù Nữ Hoàng Manhua', 'Vua Kiếm Manhua Trùng Sinh', 'Ta Là Chí Tôn Manhua',
                'Vạn Giới Thần Chủ', 'Vũ Động Càn Khôn Manhua', 'Thần Đạo Độc Tôn', 'Nhất Niệm Vĩnh Hằng'
            ],
            'manhwa' => [
                'Thợ Săn Cấp SSS Manhwa', 'Chiến Binh Solo Manhwa', 'Hệ Thống Thợ Săn Tối Cường',
                'Trở Thành Độc Giả Duy Nhất', 'Học Viện Thần Thần Manhwa', 'Đội Trưởng Hồi Sinh', 'Tháp Thử Thách'
            ],
            'action' => [
                'Đội Biệt Kích Rồng', 'Ranh Giới Sinh Tử', 'Vũ Sĩ Đêm Cuối', 'Chiến Chiến Sĩ Thép',
                'Sát Thủ Vùng Biên Thùy', 'Hành Trình Rực Lửa', 'Đột Kích Phố Ngầm', 'Quyền Vương Bất Bại'
            ],
            'adventure' => [
                'Hành Trình Đến Đảo Giáp', 'Bí Mật Động Cổ Luy Lâu', 'Thám Hiểm Rừng Già Trường Sơn',
                'Kho Báu Hoàng Gia Mất Tích', 'Bản Đồ Cổ Đại Vô Giá', 'Vùng Đất Mất Tích', 'Chuyến Đi Cuối Cùng'
            ],
            'martial-arts' => [
                'Kiếm Hiệp Giang Hồ', 'Võ Lâm Truyền Kỳ', 'Tây Sơn Quyền Pháp', 'Cổ Long Bát Trái',
                'Anh Hùng Tuyệt Kỹ', 'Bá Vương Quyền', 'Bạch Sơ Kiếm Phái', 'Tuyệt Đỉnh Giang Hồ'
            ],
            'comedy' => [
                'Học Sinh Cá Biệt Vô Sỉ', 'Thần Tiên Cũng Phải Đi Làm', 'Thiên Tài Hài Hước',
                'Đại Gia Điên Rồ', 'Hệ Thống Tấu Hài', 'Sư Thầy Xuống Núi', 'Chị Đại Phố Cổ'
            ],
            'mystery' => [
                'Bí Mật Hồ Tây 1954', 'Kẻ Giấu Mặt Phố Cổ', 'Thám Tử Tư Nam Hà', 'Án Mạng Đêm Sương Mù',
                'Dấu Vết Trong Mưa', 'Cuốn Sách Kỳ Môn', 'Bóng Ma Nhà Xương', 'Lời Giải Đêm Cuối'
            ],
        ];

        $existingTitles = Story::pluck('title')->toArray();
        $totalCreated = 0;

        foreach ($categories as $catIndex => $category) {
            $catSlug = $category->slug;
            $genreTitles = $titlesByGenre[$catSlug] ?? [
                'Chuyện Phố Cổ ' . ($catIndex + 1),
                'Hành Trình Mới ' . ($catIndex + 1),
                'Huyền Thoại Trở Lại ' . ($catIndex + 1),
                'Bí Mật Năm Đó ' . ($catIndex + 1),
            ];

            foreach ($genreTitles as $itemIdx => $rawTitle) {
                $fullTitle = $rawTitle;
                if (in_array($fullTitle, $existingTitles)) {
                    $fullTitle = $rawTitle . ' (' . ($itemIdx + 1) . ')';
                }

                $existingTitles[] = $fullTitle;
                $slug = Str::slug($fullTitle);

                // Content type: Comic for Webtoon, Manhua, Manhwa; else Novel
                $isComic = in_array($catSlug, ['truyen-tranh-webtoon', 'manhua', 'manhwa']) || ($totalCreated % 7 === 0);
                $contentType = $isComic ? 'COMIC' : 'NOVEL';

                $author = $authors[($totalCreated + $itemIdx) % count($authors)];
                $coverUrl = $covers[$totalCreated % count($covers)];
                $viewCount = rand(1500, 95000);

                // Mix of ongoing (PUBLISHED - Đang ra) and finished (COMPLETED - Đã hoàn thành)
                $status = ($totalCreated % 3 === 0) ? 'COMPLETED' : 'PUBLISHED';

                $story = Story::create([
                    'title' => $fullTitle,
                    'slug' => $slug,
                    'summary' => "Tác phẩm {$fullTitle} thuộc thể loại {$category->name}. Một hành trình cuốn hút đầy cảm xúc với những tình tiết kịch tính, mở ra thế giới giả tưởng và cảm hứng phong phú cho độc giả Văn Đàn.",
                    'cover_url' => $coverUrl,
                    'content_type' => $contentType,
                    'status' => $status,
                    'view_count' => $viewCount,
                    'author_id' => $author->id,
                    'category_id' => $category->id,
                    'is_featured' => ($viewCount > 40000),
                ]);

                // Attach random tags
                $story->tags()->attach([
                    $tagHot->id,
                    ($totalCreated % 2 === 0 ? $tagBảnQuyền->id : $tagFull->id),
                ]);

                // Create 3-5 chapters per story
                $chapterCount = rand(3, 5);
                for ($ch = 1; $ch <= $chapterCount; $ch++) {
                    $isPaid = ($ch > 2);
                    $coinPrice = $isPaid ? (6 + ($ch - 3) * 2) : 0; // Chương 3: 6 Xu, Chương 4: 8 Xu, Chương 5: 10 Xu
                    $chTitle = "Chương {$ch}: " . ($isPaid ? 'Bí Mật Khai Mở (Chương VIP)' : 'Khởi Đầu Hành Trình');

                    $chapter = Chapter::create([
                        'story_id' => $story->id,
                        'chapter_number' => $ch,
                        'title' => $chTitle,
                        'slug' => "{$slug}-chuong-{$ch}",
                        'is_paid' => $isPaid,
                        'coin_price' => $coinPrice,
                        'view_count' => rand(500, (int)($viewCount / $ch)),
                        'status' => 'PUBLISHED',
                    ]);

                    if ($contentType === 'NOVEL') {
                        ChapterContent::create([
                            'chapter_id' => $chapter->id,
                            'content' => "<p>Đây là nội dung thử nghiệm của <strong>{$chTitle}</strong> thuộc tác phẩm <em>{$fullTitle}</em>.</p><p>Gió nhẹ thổi qua hàng cây, những trang sách nhẹ rào rạt như thì thầm về hồi ức xa xưa. Nhân vật chính đứng trước thử thách ngàn năm, trong tay cầm tín vật truyền thừa...</p><p>Hành trình dài rộng mở ra với bao điều kì diệu đón chờ độc giả thưởng ngoạn.</p>",
                        ]);
                    } else {
                        // Comic Images
                        $comicImages = [
                            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
                            'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
                            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
                        ];
                        foreach ($comicImages as $imgIdx => $imgUrl) {
                            ComicImage::create([
                                'chapter_id' => $chapter->id,
                                'image_url' => $imgUrl,
                                'order_index' => $imgIdx + 1,
                            ]);
                        }
                    }
                }

                $totalCreated++;
                if ($totalCreated >= 100) {
                    break 2;
                }
            }
        }

        echo "Seeded successfully {$totalCreated} stories across all 15 website categories!\n";
    }
}
