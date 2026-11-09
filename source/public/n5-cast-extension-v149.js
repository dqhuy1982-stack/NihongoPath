/* HORIZON v1.49 · Six additional fictional companion characters.
   Extends canonical NP_WORLD in memory; existing 24 IDs remain untouched. */
(function(){
'use strict';
if(typeof NP_WORLD==='undefined'||!Array.isArray(NP_WORLD.characters))return;
const additions=[
  {
    "id": "keiko",
    "name": "佐藤 けい子",
    "reading": "さとう けいこ",
    "short": "Keiko",
    "group": "work",
    "nationality": "Nhật Bản",
    "age": 31,
    "org": "hotel",
    "department": "Nhân sự",
    "job": "Nhân viên nhân sự",
    "bio": "Hỗ trợ nhân viên mới tại Nagi Riverside Hotel, hướng dẫn giới thiệu với đồng nghiệp.",
    "history": [
      [
        "Trước đây",
        "Có kinh nghiệm chuyên môn tại đơn vị khác."
      ],
      [
        "Hiện tại",
        "Hỗ trợ nhân viên mới tại Nagi Riverside Hotel, hướng dẫn giới thiệu với đồng nghiệp."
      ]
    ],
    "interests": [
      "Văn hóa Nhật",
      "Giao lưu"
    ],
    "voice": "Hội thoại rõ ràng, nhẹ nhàng và chú ý cách xưng hô.",
    "motivation": "Chào đón đồng nghiệp mới.",
    "topics": [
      "Giới thiệu",
      "Nghề nghiệp",
      "Hội thoại"
    ],
    "status": "fictional-draft",
    "version": 1
  },
  {
    "id": "yamada",
    "name": "山田 隆",
    "reading": "やまだ たかし",
    "short": "Takashi",
    "group": "work",
    "nationality": "Nhật Bản",
    "age": 42,
    "org": "hotel",
    "department": "Vận hành",
    "job": "Giám sát vận hành",
    "bio": "Kết nối nhân viên lễ tân, bếp và kỹ thuật trong các ca làm việc.",
    "history": [
      [
        "Trước đây",
        "Có kinh nghiệm chuyên môn tại đơn vị khác."
      ],
      [
        "Hiện tại",
        "Kết nối nhân viên lễ tân, bếp và kỹ thuật trong các ca làm việc."
      ]
    ],
    "interests": [
      "Văn hóa Nhật",
      "Giao lưu"
    ],
    "voice": "Nói chậm, cụ thể và xác nhận lại thông tin.",
    "motivation": "Giúp thành viên mới phối hợp thuận tiện.",
    "topics": [
      "Giới thiệu",
      "Nghề nghiệp",
      "Hội thoại"
    ],
    "status": "fictional-draft",
    "version": 1
  },
  {
    "id": "mike",
    "name": "マイク・ミラー",
    "reading": "マイク・ミラー",
    "short": "Mike",
    "group": "work",
    "nationality": "Hoa Kỳ",
    "age": 29,
    "org": "tech",
    "department": "Phát triển phần mềm",
    "job": "Kỹ sư phần mềm",
    "bio": "Kỹ sư mới tham gia đội Kaze Systems và đang học cách chào hỏi tại nơi làm việc Nhật.",
    "history": [
      [
        "Trước đây",
        "Có kinh nghiệm chuyên môn tại đơn vị khác."
      ],
      [
        "Hiện tại",
        "Kỹ sư mới tham gia đội Kaze Systems và đang học cách chào hỏi tại nơi làm việc Nhật."
      ]
    ],
    "interests": [
      "Văn hóa Nhật",
      "Giao lưu"
    ],
    "voice": "Thân thiện, hay hỏi lại từ chưa hiểu.",
    "motivation": "Tự tin giao tiếp với đồng nghiệp quốc tế.",
    "topics": [
      "Giới thiệu",
      "Nghề nghiệp",
      "Hội thoại"
    ],
    "status": "fictional-draft",
    "version": 1
  },
  {
    "id": "nakamura",
    "name": "中村 由美",
    "reading": "なかむら ゆみ",
    "short": "Yumi",
    "group": "life",
    "nationality": "Nhật Bản",
    "age": 26,
    "org": "community",
    "department": "Thư viện",
    "job": "Nhân viên thư viện",
    "bio": "Tổ chức góc đọc sách song ngữ, thường hướng dẫn học viên tìm tài liệu.",
    "history": [
      [
        "Trước đây",
        "Có kinh nghiệm chuyên môn tại đơn vị khác."
      ],
      [
        "Hiện tại",
        "Tổ chức góc đọc sách song ngữ, thường hướng dẫn học viên tìm tài liệu."
      ]
    ],
    "interests": [
      "Văn hóa Nhật",
      "Giao lưu"
    ],
    "voice": "Nói lịch sự, luôn đưa ví dụ để người mới hiểu.",
    "motivation": "Giúp nhiều người yêu thích đọc bằng tiếng Nhật.",
    "topics": [
      "Giới thiệu",
      "Nghề nghiệp",
      "Hội thoại"
    ],
    "status": "fictional-draft",
    "version": 1
  },
  {
    "id": "laila",
    "name": "ライラ・ハミド",
    "reading": "ライラ・ハミド",
    "short": "Laila",
    "group": "work",
    "nationality": "Malaysia",
    "age": 32,
    "org": "hotel",
    "department": "Dịch vụ khách hàng",
    "job": "Quản lý trải nghiệm khách",
    "bio": "Phối hợp đội lễ tân để phục vụ du khách nhiều quốc tịch và ngôn ngữ.",
    "history": [
      [
        "Trước đây",
        "Có kinh nghiệm chuyên môn tại đơn vị khác."
      ],
      [
        "Hiện tại",
        "Phối hợp đội lễ tân để phục vụ du khách nhiều quốc tịch và ngôn ngữ."
      ]
    ],
    "interests": [
      "Văn hóa Nhật",
      "Giao lưu"
    ],
    "voice": "Chu đáo, tôn trọng khác biệt văn hóa và thích hỏi mục đích trước.",
    "motivation": "Giao tiếp hiệu quả với khách quốc tế.",
    "topics": [
      "Giới thiệu",
      "Nghề nghiệp",
      "Hội thoại"
    ],
    "status": "fictional-draft",
    "version": 1
  },
  {
    "id": "omar",
    "name": "オマル・ハッサン",
    "reading": "オマル・ハッサン",
    "short": "Omar",
    "group": "life",
    "nationality": "Ai Cập",
    "age": 37,
    "org": "design",
    "department": "Thiết kế không gian",
    "job": "Kiến trúc sư",
    "bio": "Thiết kế những không gian học tập nhỏ, tiện dụng và tham gia hoạt động cộng đồng.",
    "history": [
      [
        "Trước đây",
        "Có kinh nghiệm chuyên môn tại đơn vị khác."
      ],
      [
        "Hiện tại",
        "Thiết kế những không gian học tập nhỏ, tiện dụng và tham gia hoạt động cộng đồng."
      ]
    ],
    "interests": [
      "Văn hóa Nhật",
      "Giao lưu"
    ],
    "voice": "Giải thích bằng hình ảnh, bình tĩnh khi trao đổi phương án.",
    "motivation": "Tạo không gian thuận tiện cho mọi người.",
    "topics": [
      "Giới thiệu",
      "Nghề nghiệp",
      "Hội thoại"
    ],
    "status": "fictional-draft",
    "version": 1
  }
];
const known=new Set(NP_WORLD.characters.map(c=>c.id));
for(const character of additions){
 if(!known.has(character.id)){NP_WORLD.characters.push(character);known.add(character.id);}
}
})();