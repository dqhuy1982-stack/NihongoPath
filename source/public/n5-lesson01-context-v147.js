/* HORIZON N5 L01 v1.48 · Original six-situation curriculum; existing IDs and progress retained. */
window.NPN5Lesson01Scenes=Object.freeze({
  "version": 2,
  "scenes": [
    {
      "id": "meeting",
      "title": "Gặp nhau lần đầu",
      "jpTitle": "はじめまして",
      "situation": "Bạn đến buổi học tiếng Nhật đầu tiên, gặp người hướng dẫn và giới thiệu về mình.",
      "goal": "Giới thiệu tên, quốc tịch và chào một cách tự nhiên.",
      "grammar": [
        "wa",
        "san"
      ],
      "vocab": [
        "watashi",
        "san",
        "jin",
        "hajimemashite",
        "yoroshiku"
      ],
      "dialogue": [
        {
          "who": "Aoi",
          "jp": "はじめまして。あおいです。",
          "vi": "Rất vui được gặp. Tôi là Aoi."
        },
        {
          "who": "Linh",
          "jp": "はじめまして。わたしは リンです。ベトナムじんです。",
          "vi": "Rất vui được gặp. Tôi là Linh, người Việt Nam."
        },
        {
          "who": "Aoi",
          "jp": "リンさん、どうぞ よろしくおねがいします。",
          "vi": "Linh, rất mong được giúp đỡ."
        },
        {
          "who": "Linh",
          "jp": "こちらこそ、よろしくおねがいします。",
          "vi": "Chính tôi cũng rất mong được giúp đỡ."
        }
      ],
      "tip": "Khi người đối diện đã biết bạn đang nói về ai, không nhất thiết câu nào cũng dùng わたしは. さん được dùng sau tên người khác, không dùng với tên mình.",
      "challenge": {
        "title": "Bạn gặp một người lần đầu. Câu mở đầu nào phù hợp?",
        "options": [
          "はじめまして。リンです。",
          "おやすみなさい。リンです。",
          "いいえ、リンじゃありません。"
        ],
        "correct": 0,
        "why": "はじめまして được dùng khi mới gặp. おやすみなさい là lời chúc ngủ ngon; câu phủ định không phải lời chào."
      },
      "compose": {
        "prompt": "Hãy viết 1–2 câu giới thiệu tên và quốc tịch của chính bạn.",
        "hint": "Gợi ý: はじめまして / わたしは / ～じんです",
        "sample": "はじめまして。わたしは リンです。ベトナムじんです。どうぞ よろしくおねがいします。"
      },
      "place": "Trung tâm tiếng Nhật Haruka",
      "time": "Buổi sáng · ngày đầu nhập học",
      "relationship": "Aoi là nhân viên tiếp đón; Linh là học viên mới.",
      "purpose": "Chào hỏi và nói tên, quốc tịch.",
      "hint": "Quan sát tư thế cúi chào. Ai mở lời trước?",
      "location": "school",
      "replace": {
        "prompt": "Điền đúng quốc tịch cho Linh",
        "stem": "リンさんは（　）です。",
        "options": [
          "ベトナムじん",
          "にほんじん",
          "いしゃ"
        ],
        "answer": 0,
        "why": "Linh đến từ Việt Nam nên là ベトナムじん."
      },
      "variation": {
        "label": "Thử đổi ngữ cảnh",
        "prompt": "Nếu bạn ở trung tâm tiếng nhật haruka, hãy tự nói câu tương tự nhưng đổi tên hoặc nghề nghiệp bằng dữ kiện của bạn.",
        "tip": "Thử thay thông tin theo đúng mẫu; không cần thuộc nguyên câu mẫu."
      }
    },
    {
      "id": "colleague",
      "title": "Giới thiệu đồng nghiệp",
      "jpTitle": "こちらは ホアさんです",
      "situation": "Trong ngày làm việc đầu tiên, bạn giới thiệu người mới cho đồng nghiệp.",
      "goal": "Giới thiệu người khác, nghề nghiệp và nơi làm việc.",
      "grammar": [
        "wa",
        "no",
        "san"
      ],
      "vocab": [
        "kochira",
        "kaishain",
        "shain",
        "engineer",
        "san"
      ],
      "dialogue": [
        {
          "who": "Mai",
          "jp": "こちらは ホアさんです。",
          "vi": "Đây là chị Hoa."
        },
        {
          "who": "Yuki",
          "jp": "ホアさんは エンジニアですか。",
          "vi": "Hoa là kỹ sư phải không?"
        },
        {
          "who": "Mai",
          "jp": "はい。さくらホテルの エンジニアです。",
          "vi": "Vâng. Chị ấy là kỹ sư của khách sạn Sakura."
        },
        {
          "who": "Yuki",
          "jp": "ホアさん、どうぞ よろしくおねがいします。",
          "vi": "Chị Hoa, rất mong được làm việc cùng."
        }
      ],
      "tip": "こちらは là cách giới thiệu người đang ở gần. の liên kết tên tổ chức với nghề/vai trò, chẳng hạn さくらホテルの エンジニア.",
      "challenge": {
        "title": "Muốn giới thiệu chị Hoa với người khác, bạn chọn câu nào?",
        "options": [
          "わたしは ホアさんです。",
          "こちらは ホアさんです。",
          "ホアさんも です。"
        ],
        "correct": 1,
        "why": "こちらは ～さんです dùng để giới thiệu người khác. Không tự nhận mình là người đang được giới thiệu."
      },
      "compose": {
        "prompt": "Hãy giới thiệu một người bạn hoặc đồng nghiệp, có thể dùng tên giả.",
        "hint": "こちらは ～さんです。～の ～です。",
        "sample": "こちらは アンさんです。さくらホテルの かいしゃいんです。"
      },
      "place": "Văn phòng khách sạn Sakura",
      "time": "Buổi sáng · buổi giới thiệu nhân viên",
      "relationship": "Mai đưa Hoa gặp Yuki, đồng nghiệp cùng công ty.",
      "purpose": "Giới thiệu người khác, nói nghề và nơi làm việc.",
      "hint": "Ai là người đang giới thiệu? Ai là người mới?",
      "location": "office",
      "replace": {
        "prompt": "Chọn mẫu nói về người thuộc nơi làm việc",
        "stem": "ホアさんは さくらホテル（　）エンジニアです。",
        "options": [
          "も",
          "の",
          "ですか"
        ],
        "answer": 1,
        "why": "の nối tên công ty với nghề nghiệp."
      },
      "variation": {
        "label": "Thử đổi ngữ cảnh",
        "prompt": "Nếu bạn ở văn phòng khách sạn sakura, hãy tự nói câu tương tự nhưng đổi tên hoặc nghề nghiệp bằng dữ kiện của bạn.",
        "tip": "Thử thay thông tin theo đúng mẫu; không cần thuộc nguyên câu mẫu."
      }
    },
    {
      "id": "correcting",
      "title": "Sửa thông tin bị nhầm",
      "jpTitle": "いいえ、ちがいます",
      "situation": "Người đối diện hiểu nhầm nghề nghiệp của một người. Bạn cần trả lời rõ nhưng vẫn lịch sự.",
      "goal": "Đặt câu hỏi, trả lời có/không và đưa thông tin chính xác.",
      "grammar": [
        "question",
        "negative"
      ],
      "vocab": [
        "iie",
        "hai",
        "isha",
        "kenkyuusha",
        "sensei",
        "donata"
      ],
      "dialogue": [
        {
          "who": "Ken",
          "jp": "たなかさんは いしゃですか。",
          "vi": "Anh/chị Tanaka là bác sĩ phải không?"
        },
        {
          "who": "Hana",
          "jp": "いいえ、いしゃじゃありません。",
          "vi": "Không, không phải bác sĩ."
        },
        {
          "who": "Hana",
          "jp": "けんきゅうしゃです。",
          "vi": "Anh/chị ấy là nhà nghiên cứu."
        },
        {
          "who": "Ken",
          "jp": "そうですか。ありがとうございます。",
          "vi": "Ra vậy. Cảm ơn nhé."
        }
      ],
      "tip": "Khi phủ định thông tin, nên cho biết câu trả lời đúng sau đó. か giúp đặt câu hỏi mà không phải đảo thứ tự từ như tiếng Anh.",
      "challenge": {
        "title": "Ai đó hỏi: 『たなかさんは いしゃですか。』 nhưng Tanaka không phải bác sĩ. Bạn đáp thế nào?",
        "options": [
          "はい、いしゃです。",
          "いいえ、いしゃじゃありません。",
          "たなかさんも いしゃです。"
        ],
        "correct": 1,
        "why": "いいえ + じゃありません phủ định đúng thông tin. Sau đó nên nói nghề nghiệp thực tế nếu bạn biết."
      },
      "compose": {
        "prompt": "Hãy viết một câu phủ định nghề nghiệp, rồi bổ sung nghề đúng.",
        "hint": "いいえ、～じゃありません。～です。",
        "sample": "いいえ、せんせいじゃありません。エンジニアです。"
      },
      "place": "Khu vực sinh hoạt chung tại trường",
      "time": "Giờ nghỉ giữa lớp",
      "relationship": "Ken và Hana cùng học tiếng Nhật, đang nói về Tanaka.",
      "purpose": "Hỏi và chỉnh thông tin sai về nghề nghiệp.",
      "hint": "Khi trả lời không, bạn cần nói nghề đúng.",
      "location": "class",
      "replace": {
        "prompt": "Điền phần phủ định lịch sự",
        "stem": "いしゃ（　）。",
        "options": [
          "じゃありません",
          "です",
          "も"
        ],
        "answer": 0,
        "why": "じゃありません phủ định danh từ trong câu lịch sự."
      },
      "variation": {
        "label": "Thử đổi ngữ cảnh",
        "prompt": "Nếu bạn ở khu vực sinh hoạt chung tại trường, hãy tự nói câu tương tự nhưng đổi tên hoặc nghề nghiệp bằng dữ kiện của bạn.",
        "tip": "Thử thay thông tin theo đúng mẫu; không cần thuộc nguyên câu mẫu."
      }
    },
    {
      "id": "classmates",
      "title": "Có chung đặc điểm",
      "jpTitle": "ミナさんも がくせいです",
      "situation": "Hai học viên đang nói về trường học và muốn xác nhận người thứ ba có cùng đặc điểm hay không.",
      "goal": "Sử dụng も để diễn đạt “cũng”; の để nói người thuộc trường hoặc tổ chức.",
      "grammar": [
        "mo",
        "no",
        "question"
      ],
      "vocab": [
        "gakusei",
        "daigaku",
        "san",
        "hai",
        "iie"
      ],
      "dialogue": [
        {
          "who": "Linh",
          "jp": "わたしは みなとだいがくの がくせいです。",
          "vi": "Tôi là sinh viên Đại học Minato."
        },
        {
          "who": "Aoi",
          "jp": "ミナさんも がくせいですか。",
          "vi": "Mina cũng là sinh viên phải không?"
        },
        {
          "who": "Linh",
          "jp": "はい、ミナさんも がくせいです。",
          "vi": "Vâng, Mina cũng là sinh viên."
        },
        {
          "who": "Aoi",
          "jp": "ミナさんも みなとだいがくの がくせいですか。",
          "vi": "Mina cũng học Đại học Minato phải không?"
        }
      ],
      "tip": "も thay cho は trong ý nghĩa “cũng”. Hãy phân biệt “cũng là sinh viên” và “cũng học cùng trường”: vế sau cần thêm thông tin nơi học.",
      "challenge": {
        "title": "Đã biết Linh là sinh viên. Muốn nói Mina “cũng là sinh viên”, điền trợ từ nào?",
        "options": [
          "ミナさん はも がくせいです。",
          "ミナさん の がくせいです。",
          "ミナさん も がくせいです。"
        ],
        "correct": 2,
        "why": "も đứng ở vị trí trợ từ chủ đề để diễn đạt “cũng”; không dùng はも."
      },
      "compose": {
        "prompt": "Viết hai câu về hai người có cùng nghề nghiệp hoặc cùng trường.",
        "hint": "Aさんは ～です。Bさんも ～です。",
        "sample": "リンさんは がくせいです。ミナさんも がくせいです。"
      },
      "place": "Hành lang Đại học Minato",
      "time": "Sau giờ học",
      "relationship": "Aoi hỏi Linh về bạn cùng lớp Mina.",
      "purpose": "Nói về hai người có cùng đặc điểm.",
      "hint": "Cả hai đều là sinh viên, nhưng có chắc cùng trường?",
      "location": "campus",
      "replace": {
        "prompt": "Mina cũng là sinh viên",
        "stem": "ミナさん（　）がくせいです。",
        "options": [
          "は",
          "も",
          "の"
        ],
        "answer": 1,
        "why": "も dùng để diễn đạt ý 'cũng'."
      },
      "variation": {
        "label": "Thử đổi ngữ cảnh",
        "prompt": "Nếu bạn ở hành lang đại học minato, hãy tự nói câu tương tự nhưng đổi tên hoặc nghề nghiệp bằng dữ kiện của bạn.",
        "tip": "Thử thay thông tin theo đúng mẫu; không cần thuộc nguyên câu mẫu."
      }
    },
    {
      "id": "namecheck",
      "title": "Hỏi và xác nhận tên",
      "jpTitle": "おなまえは？",
      "situation": "Aoi đón thêm học viên mới là Mina và hỏi tên để xác nhận danh sách đăng ký.",
      "goal": "Hỏi tên lịch sự và xác nhận đúng người.",
      "place": "Quầy tiếp đón Haruka",
      "time": "Buổi sáng · trước giờ học",
      "relationship": "Aoi là nhân viên tiếp đón; Mina là học viên.",
      "purpose": "Hỏi tên mà không tạo cảm giác bất lịch sự.",
      "hint": "Lắng nghe câu おなまえは và cách gọi tên kèm さん.",
      "location": "reception",
      "grammar": [
        "san",
        "question"
      ],
      "vocab": [
        "shitsurei",
        "onamae",
        "san",
        "hai"
      ],
      "dialogue": [
        {
          "who": "Aoi",
          "jp": "しつれいですが、おなまえは？",
          "vi": "Xin phép hỏi, tên bạn là gì?"
        },
        {
          "who": "Mina",
          "jp": "ミナです。",
          "vi": "Tôi tên là Mina."
        },
        {
          "who": "Aoi",
          "jp": "ミナさんですね。",
          "vi": "Vậy là chị Mina phải không ạ?"
        },
        {
          "who": "Mina",
          "jp": "はい、そうです。よろしくおねがいします。",
          "vi": "Vâng, đúng rồi. Rất mong được giúp đỡ."
        }
      ],
      "tip": "Hỏi tên bằng おなまえは？ lịch sự hơn dùng あなたは だれですか. Gọi Mina là ミナさん, không dùng さん khi tự nói tên.",
      "challenge": {
        "title": "Bạn chưa biết tên người mới. Nên hỏi thế nào?",
        "options": [
          "あなたは だれですか。",
          "しつれいですが、おなまえは？",
          "ミナさんも がくせいです。"
        ],
        "correct": 1,
        "why": "しつれいですが、おなまえは？ là lời mở đầu nhẹ nhàng và lịch sự."
      },
      "compose": {
        "prompt": "Viết câu hỏi tên người mới và một câu xác nhận khi đã nghe tên.",
        "hint": "しつれいですが / おなまえは？ / ～さんですね。",
        "sample": "しつれいですが、おなまえは？　ミナさんですね。"
      },
      "replace": {
        "prompt": "Gọi tên Mina một cách lịch sự",
        "stem": "（　）、よろしくおねがいします。",
        "options": [
          "ミナさん",
          "ミナじん",
          "わたしさん"
        ],
        "answer": 0,
        "why": "Thêm さん sau tên người khác."
      },
      "variation": {
        "label": "Đổi vai đón tiếp",
        "prompt": "Bạn đóng vai người tiếp đón, hỏi tên và gọi lại tên người mới.",
        "tip": "Nói chậm, dùng ～さん và chờ người kia xác nhận."
      }
    },
    {
      "id": "identity",
      "title": "Hỏi quốc tịch và nghề nghiệp",
      "jpTitle": "ベトナムじんですか",
      "situation": "Trong ngày giới thiệu học viên, Yuki muốn tìm hiểu Linh đến từ đâu và đang làm gì.",
      "goal": "Hỏi, trả lời về quốc tịch và vai trò.",
      "place": "Phòng sinh hoạt của trung tâm",
      "time": "Buổi chiều · sau buổi chào mừng",
      "relationship": "Yuki là khách mời hỗ trợ; Linh là học viên mới.",
      "purpose": "Trao đổi quốc tịch và vai trò một cách lịch sự.",
      "hint": "Chú ý câu hỏi có か và câu trả lời bắt đầu bằng はい.",
      "location": "lounge",
      "grammar": [
        "wa",
        "question",
        "no"
      ],
      "vocab": [
        "jin",
        "gakusei",
        "kaishain",
        "hai",
        "iie"
      ],
      "dialogue": [
        {
          "who": "Yuki",
          "jp": "リンさんは ベトナムじんですか。",
          "vi": "Chị Linh là người Việt Nam phải không?"
        },
        {
          "who": "Linh",
          "jp": "はい、ベトナムじんです。",
          "vi": "Vâng, tôi là người Việt Nam."
        },
        {
          "who": "Yuki",
          "jp": "みなとだいがくの がくせいですか。",
          "vi": "Chị là sinh viên Đại học Minato phải không?"
        },
        {
          "who": "Linh",
          "jp": "はい、そうです。",
          "vi": "Vâng, đúng vậy."
        }
      ],
      "tip": "Thêm か để biến câu trần thuật thành câu hỏi lịch sự. Khi biết người đang được hỏi, có thể bỏ chủ đề thay vì nhắc ～さん liên tục.",
      "challenge": {
        "title": "Yuki muốn hỏi Linh có phải là sinh viên không. Câu nào đúng?",
        "options": [
          "リンさんは がくせいですか。",
          "リンさんの がくせいです。",
          "リンさんも ですか がくせい。"
        ],
        "correct": 0,
        "why": "Câu hỏi danh từ dùng N1 は N2 ですか."
      },
      "compose": {
        "prompt": "Hỏi một người về quốc tịch và nghề nghiệp; tự viết câu trả lời.",
        "hint": "～じんですか。/ はい、そうです。/ いいえ、～じゃありません。",
        "sample": "リンさんは ベトナムじんですか。はい、そうです。"
      },
      "replace": {
        "prompt": "Điền cấu trúc hỏi",
        "stem": "リンさんは がくせいです（　）。",
        "options": [
          "の",
          "か",
          "も"
        ],
        "answer": 1,
        "why": "Thêm か để đặt câu hỏi."
      },
      "variation": {
        "label": "Đổi thông tin",
        "prompt": "Thay Việt Nam bằng Nhật Bản và học sinh bằng nhân viên công ty; trả lời sao cho nhất quán.",
        "tip": "Chỉ thay thông tin, giữ trật tự mẫu câu."
      }
    }
  ],
  "practiceSceneById": {
    "p01": "classmates",
    "p02": "colleague",
    "p03": "identity",
    "p04": "meeting",
    "p05": "meeting",
    "p06": "correcting",
    "p07": "correcting",
    "p08": "classmates",
    "p09": "classmates",
    "p10": "classmates",
    "p11": "classmates",
    "p12": "correcting",
    "p13": "meeting",
    "p14": "correcting",
    "p15": "classmates",
    "p16": "namecheck"
  },
  "editionNote": "Bộ nội dung HORIZON tự biên soạn theo mục tiêu Bài 01; không dùng lời thoại hay audio từ giáo trình."
});
