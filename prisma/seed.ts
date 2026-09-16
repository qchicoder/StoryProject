import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  console.log('🌱 Starting full database seed for TRUYENVUI...');

  // Clean old records
  await prisma.commentReport.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.readingProgress.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.chapterUnlock.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.coinTransaction.deleteMany();
  await prisma.coinWallet.deleteMany();
  await prisma.comicImage.deleteMany();
  await prisma.chapterContent.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.storyTag.deleteMany();
  await prisma.story.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();
  await prisma.advertisement.deleteMany();

  const hashedPassword = await bcrypt.hash('password', 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      name: 'Quản Trị Viên (Admin)',
      email: 'admin@truyenvui.vn',
      password: hashedPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      wallet: {
        create: {
          balance: 9999,
          transactions: {
            create: {
              amount: 9999,
              type: 'ADMIN_ADJUST',
              description: 'Khởi tạo số dư Admin',
              referenceId: 'ADMIN_INIT',
            },
          },
        },
      },
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: 'Độc Giả Văn Đàn',
      email: 'user@truyenvui.vn',
      password: hashedPassword,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      wallet: {
        create: {
          balance: 50,
          transactions: {
            create: {
              amount: 50,
              type: 'PURCHASE',
              description: 'Nạp Xu Tân Thủ - Gói Khởi Đầu',
              referenceId: 'INIT_BONUS_001',
            },
          },
        },
      },
    },
  });

  // 2. 15 Categories
  const categoriesData = [
    { name: 'Dã Sử & Cổ Trang', slug: 'da-su-co-trang', description: 'Tiểu thuyết dã sử, cổ trang hào hùng nước Việt' },
    { name: 'Truyện Tranh Webtoon', slug: 'truyen-tranh-webtoon', description: 'Comic nét vẽ hiện đại, webtoon rực rỡ' },
    { name: 'Tiên Hiệp', slug: 'tien-hiep', description: 'Tu tiên vấn đạo, phi thăng trường sinh' },
    { name: 'Huyền Huyễn', slug: 'huyen-huan', description: 'Thế giới ma pháp, thần thoại cổ đại' },
    { name: 'Đô Thị', slug: 'do-thi', description: 'Cuộc sống hiện đại, dị năng đô thị, thần y' },
    { name: 'Ngôn Tình', slug: 'ngon-tinh', description: 'Tình yêu lãng mạn, ngọt ngào, trắc trở' },
    { name: 'Chuyển Sinh', slug: 'chuyen-sinh', description: 'Tái sinh thế giới mới, mang theo hệ thống' },
    { name: 'Xuyên Không', slug: 'xuyen-khong', description: 'Vượt thời gian trở về quá khứ hoặc tương lai' },
    { name: 'Manhua', slug: 'manhua', description: 'Truyện tranh Trung Hoa huyền ảo' },
    { name: 'Manhwa', slug: 'manhwa', description: 'Truyện tranh Hàn Quốc kịch tính' },
    { name: 'Hành Động (Action)', slug: 'action', description: 'Võ thuật, va chạm rực lửa, mạo hiểm' },
    { name: 'Phiêu Lưu (Adventure)', slug: 'adventure', description: 'Hành trình khám phá vùng đất bí ẩn' },
    { name: 'Võ Thuật (Martial Arts)', slug: 'martial-arts', description: 'Giang hồ kiếm hiệp, xưng bá võ lâm' },
    { name: 'Hài Hước (Comedy)', slug: 'comedy', description: 'Giải trí, dí dỏm, tiếng cười sảng khoái' },
    { name: 'Trinh Thám', slug: 'mystery', description: 'Phá án kịch tính, suy luận bí ẩn' },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const created = await prisma.category.create({ data: c });
    categories.push(created);
  }

  // 3. 10 Authors
  const authorsData = [
    { name: 'Hoàng Nam', slug: 'hoang-nam', bio: 'Chuyên gia tiểu thuyết dã sử kinh điển' },
    { name: 'Đông Phong', slug: 'dong-phong', bio: 'Họa sĩ minh họa Webtoon & Comic' },
    { name: 'Mộc Trà', slug: 'moc-tra', bio: 'Tác giả ngôn tình & đô thị tình cảm' },
    { name: 'Vũ Thanh', slug: 'vu-thanh', bio: 'Đại thần sáng tác Tiên Hiệp & Võ Thuật' },
    { name: 'Nam Phong', slug: 'nam-phong', bio: 'Nhà văn phiêu lưu & giả tưởng cổ đại' },
    { name: 'Tuyết Nhi', slug: 'tuyet-nhi', bio: 'Tác giả trinh thám kịch tính' },
    { name: 'Nhật Minh', slug: 'nhat-minh', bio: 'Sáng tác truyện chuyển sinh hệ thống' },
    { name: 'Lam Hải', slug: 'lam-hai', bio: 'Họa sĩ Manhua & Manhwa độc quyền' },
    { name: 'Bích Vân', slug: 'bich-van', bio: 'Tiểu thuyết gia xuyên không & nữ cường' },
    { name: 'Quốc Bảo', slug: 'quoc-bao', bio: 'Tác giả hành động kịch tính' },
  ];

  const authors = [];
  for (const a of authorsData) {
    const created = await prisma.author.create({
      data: {
        name: a.name,
        slug: a.slug,
        bio: a.bio,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
    });
    authors.push(created);
  }

  // 4. Tags
  const tagHot = await prisma.tag.create({ data: { name: 'Hot', slug: 'hot' } });
  const tagFull = await prisma.tag.create({ data: { name: 'Full', slug: 'full' } });
  const tagBanQuyen = await prisma.tag.create({ data: { name: 'Bản Quyền', slug: 'ban-quyen' } });
  const tagTop = await prisma.tag.create({ data: { name: 'Top View', slug: 'top-view' } });

  const covers = [
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

  const titlesByGenre: Record<string, string[]> = {
    'da-su-co-trang': [
      'Bạch Đằng Trầm Kiếm', 'Đại Việt Long Khí', 'Tập Trận Vạn Kiếp', 'Thiên Hạ Đại Định',
      'Nam Quốc Sơn Hà', 'Vạn Xuân Thần Khí', 'Tây Sơn Nguyện Cảnh', 'Cổ Thành U Uẩn',
      'Triều Đóa Trúc Lâm', 'Sương Phủ Hoàng Thành', 'Hoàng Hoa Sứ Tiết', 'Hùng Thiết Gia Định'
    ],
    'truyen-tranh-webtoon': [
      'Nữ Sát Thủ Thành Đông', 'Vũ Điệu Ánh Sáng', 'Đại Chiến Linh Giới Webtoon', 'Ký Ức Hồng Sương',
      'Họa Sĩ Thời Không', 'Biên Niên Sử Ngũ Hành', 'Chiến Sĩ Ngân Hà', 'Truyền Thuyết Long Tộc',
      'Hồn Linh Phố Cổ', 'Phù Thủy Ánh Trăng', 'Bóng Đêm Thập Tự', 'Thiên Thần Mất Cánh'
    ],
    'tien-hiep': [
      'Vô Song Thiên Tôn', 'Đại Đạo Độc Hành', 'Bất Tử Cửu Trọng Thiên', 'Vĩnh Hằng Kiếm Đế',
      'Kiếm Phá Thần Châu', 'Chuyển Sinh Thành Tiên Đế', 'Linh Khí Khôi Phục', 'Hồng Hoang Đại Kiếp',
      'Tôn Thượng', 'Cửu Thiên Huyền Thoại', 'Bất Hủ Pháp Vương', 'Thiên Đạo Luân Hồi'
    ],
    'huyen-huan': [
      'Thần Thoại Phục Tinh', 'Vô Thượng Thần Hoàng', 'Thiên Ma Trùng Sinh', 'Huyết Mạch Thần Long',
      'Bát Hoang Vũ Trụ', 'Vạn Giới Đại Chiến', 'Thần Điện U Tối', 'Hạt Nhân Tối Cao',
      'Cổ Huyết Cuồng Đao', 'Thánh Địa Tuyệt Vọng', 'Dị Giới Ma Đế', 'Ánh Sáng Khởi Nguyên'
    ],
    'do-thi': [
      'Thần Y Đô Thị', 'Đại Phú Hào Trùng Sinh', 'Hệ Thống Tiêu Tiền Đô Thị', 'Vua Trở Về Đô Thị',
      'Long Ẩn Phố Phường', 'Chiến Thần Đô Thị', 'Bác Sĩ Thiên Tài', 'Gia Tộc Hào Môn',
      'Đô Thị Siêu Cấp Vương', 'Quyền Lực Bóng Đêm', 'Cao Thủ Học Đường', 'Siêu Cấp Thần Đô'
    ],
    'ngon-tinh': [
      'Cổ Cồn Trắng Tình Yêu', 'Bản Hợp Đồng Trọn Đời', 'Tổng Tài Bá Đạo Sủng Thần', 'Nhật Ký Tình Yêu',
      'Anh Là Nắng Của Em', 'Hương Thảo Ngọt Ngào', 'Duyên Tình Năm Tháng', 'Thầm Yêu Mười Năm',
      'Nguyện Cùng Anh Ngắm Mưa', 'Lời Thề Đêm Đông', 'Mơ Về Phía Anh', 'Nụ Cười Tháng Tư'
    ],
    'chuyen-sinh': [
      'Chuyển Sinh Thành Rồng Huyền Thoại', 'Tái Sinh Làm Hoàng Tử', 'Mang Theo Hệ Thống Bá Chủ',
      'Chuyển Sinh Làm Triệu Hoán Sĩ', 'Tái Sinh Thành Ma Vương', 'Ma Vương Trở Lại Học Viện',
      'Chuyển Sinh Ở Thế Giới Dị Năng', 'Tái Sinh Thành Kiếm Sĩ Cực Hạn', 'Nhật Ký Chuyển Sinh',
      'Bắt Đầu Với Hệ Thống Vô Địch'
    ],
    'xuyen-khong': [
      'Xuyên Không Làm Nữ Vương', 'Xuyên Về Thời Lý Trấn Phân', 'Nữ Y Xuyên Không',
      'Xuyên Thành Vương Phi Sủng Ái', 'Xuyên Đến Thời Vương Triều Cổ', 'Bá Chủ Xuyên Không',
      'Xuyên Vào Tiểu Thuyết Làm Villian', 'Xuyên Đến Dị Giới Bán Hàng', 'Xuyên Không Về Đêm Mùa Hạ'
    ],
    'manhua': [
      'Báo Thù Nữ Hoàng Manhua', 'Vua Kiếm Manhua Trùng Sinh', 'Ta Là Chí Tôn Manhua',
      'Vạn Giới Thần Chủ', 'Vũ Động Càn Khôn Manhua', 'Thần Đạo Độc Tôn', 'Nhất Niệm Vĩnh Hằng'
    ],
    'manhwa': [
      'Thợ Săn Cấp SSS Manhwa', 'Chiến Binh Solo Manhwa', 'Hệ Thống Thợ Săn Tối Cường',
      'Trở Thành Độc Giả Duy Nhất', 'Học Viện Thần Thần Manhwa', 'Đội Trưởng Hồi Sinh', 'Tháp Thử Thách'
    ],
    'action': [
      'Đội Biệt Kích Rồng', 'Ranh Giới Sinh Tử', 'Vũ Sĩ Đêm Cuối', 'Chiến Chiến Sĩ Thép',
      'Sát Thủ Vùng Biên Thùy', 'Hành Trình Rực Lửa', 'Đột Kích Phố Ngầm', 'Quyền Vương Bất Bại'
    ],
    'adventure': [
      'Hành Trình Đến Đảo Giáp', 'Bí Mật Động Cổ Luy Lâu', 'Thám Hiểm Rừng Già Trường Sơn',
      'Kho Báu Hoàng Gia Mất Tích', 'Bản Đồ Cổ Đại Vô Giá', 'Vùng Đất Mất Tích', 'Chuyến Đi Cuối Cùng'
    ],
    'martial-arts': [
      'Kiếm Hiệp Giang Hồ', 'Võ Lâm Truyền Kỳ', 'Tây Sơn Quyền Pháp', 'Cổ Long Bát Trái',
      'Anh Hùng Tuyệt Kỹ', 'Bá Vương Quyền', 'Bạch Sơ Kiếm Phái', 'Tuyệt Đỉnh Giang Hồ'
    ],
    'comedy': [
      'Học Sinh Cá Biệt Vô Sỉ', 'Thần Tiên Cũng Phải Đi Làm', 'Thiên Tài Hài Hước',
      'Đại Gia Điên Rồ', 'Hệ Thống Tấu Hài', 'Sư Thầy Xuống Núi', 'Chị Đại Phố Cổ'
    ],
    'mystery': [
      'Bí Mật Hồ Tây 1954', 'Kẻ Giấu Mặt Phố Cổ', 'Thám Tử Tư Nam Hà', 'Án Mạng Đêm Sương Mù',
      'Dấu Vết Trong Mưa', 'Cuốn Sách Kỳ Môn', 'Bóng Ma Nhà Xương', 'Lời Giải Đêm Cuối'
    ],
  };

  const existingTitles = new Set<string>();
  let totalCreated = 0;

  for (let catIndex = 0; catIndex < categories.length; catIndex++) {
    const category = categories[catIndex];
    const catSlug = category.slug;
    const genreTitles = titlesByGenre[catSlug] || [
      `Chuyện Phố Cổ ${catIndex + 1}`,
      `Hành Trình Mới ${catIndex + 1}`,
      `Huyền Thoại Trở Lại ${catIndex + 1}`,
      `Bí Mật Năm Đó ${catIndex + 1}`,
    ];

    for (let itemIdx = 0; itemIdx < genreTitles.length; itemIdx++) {
      let rawTitle = genreTitles[itemIdx];
      let fullTitle = rawTitle;
      if (existingTitles.has(fullTitle)) {
        fullTitle = `${rawTitle} (${itemIdx + 1})`;
      }
      existingTitles.add(fullTitle);

      const slug = slugify(fullTitle);
      const isComic = ['truyen-tranh-webtoon', 'manhua', 'manhwa'].includes(catSlug) || totalCreated % 7 === 0;
      const contentType = isComic ? 'COMIC' : 'NOVEL';
      const author = authors[(totalCreated + itemIdx) % authors.length];
      const coverUrl = covers[totalCreated % covers.length];
      const viewCount = Math.floor(Math.random() * (95000 - 1500 + 1)) + 1500;
      const status = totalCreated % 3 === 0 ? 'COMPLETED' : 'PUBLISHED';

      const story = await prisma.story.create({
        data: {
          title: fullTitle,
          slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
          summary: `Tác phẩm ${fullTitle} thuộc thể loại ${category.name}. Một hành trình cuốn hút đầy cảm xúc với những tình tiết kịch tính, mở ra thế giới giả tưởng và cảm hứng phong phú cho độc giả Văn Đàn.`,
          coverUrl,
          contentType,
          status,
          viewCount,
          authorId: author.id,
          categoryId: category.id,
          isFeatured: viewCount > 40000,
          tags: {
            create: [
              { tagId: tagHot.id },
              { tagId: totalCreated % 2 === 0 ? tagBanQuyen.id : tagFull.id },
            ],
          },
        },
      });

      // 3 to 5 chapters per story
      const chapterCount = Math.floor(Math.random() * 3) + 3; // 3, 4, 5
      for (let ch = 1; ch <= chapterCount; ch++) {
        const isPaid = ch > 2;
        const coinPrice = isPaid ? 6 + (ch - 3) * 2 : 0; // Ch 3 = 6 xu, Ch 4 = 8 xu, Ch 5 = 10 xu
        const chTitle = `Chương ${ch}: ${isPaid ? 'Bí Mật Khai Mở (Chương VIP)' : 'Khởi Đầu Hành Trình'}`;
        const chSlug = `chuong-${ch}`;

        const chapter = await prisma.chapter.create({
          data: {
            storyId: story.id,
            chapterNumber: ch,
            title: chTitle,
            slug: chSlug,
            isPaid,
            coinPrice,
            viewCount: Math.floor(Math.random() * 2000) + 500,
            status: 'PUBLISHED',
          },
        });

        if (contentType === 'NOVEL') {
          await prisma.chapterContent.create({
            data: {
              chapterId: chapter.id,
              content: `<p>Đây là nội dung thử nghiệm của <strong>${chTitle}</strong> thuộc tác phẩm <em>${fullTitle}</em>.</p><p>Gió nhẹ thổi qua hàng cây, những trang sách nhẹ rào rạt như thì thầm về hồi ức xa xưa. Nhân vật chính đứng trước thử thách ngàn năm, trong tay cầm tín vật truyền thừa...</p><p>Hành trình dài rộng mở ra với bao điều kì diệu đón chờ độc giả thưởng ngoạn.</p>`,
            },
          });
        } else {
          const comicImages = [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
          ];
          for (let imgIdx = 0; imgIdx < comicImages.length; imgIdx++) {
            await prisma.comicImage.create({
              data: {
                chapterId: chapter.id,
                imageUrl: comicImages[imgIdx],
                orderIndex: imgIdx + 1,
              },
            });
          }
        }
      }

      totalCreated++;
      if (totalCreated >= 100) break;
    }
    if (totalCreated >= 100) break;
  }

  // 5. Sample Advertisements
  await prisma.advertisement.create({
    data: {
      title: 'Quảng Cáo Sách Nhã Nam',
      placement: 'CHAPTER_BOTTOM',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80',
      targetUrl: 'https://nhanam.vn',
      isActive: true,
    },
  });

  console.log(`✅ Seeded ${totalCreated} stories, 15 categories, 10 authors, Admin & User accounts!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
