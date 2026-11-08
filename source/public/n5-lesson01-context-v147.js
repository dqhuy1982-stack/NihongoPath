/* HORIZON N5 L01 v1.48 · Six canonical-world scenes; preserves existing scene IDs. */
window.NPN5Lesson01Scenes=Object.freeze({
  "version": 3,
  "scenes": [
    {
      "id": "meeting",
      "title": "Gặp nhau lần đầu",
      "jpTitle": "はじめまして",
      "situation": "Tại Ichibu Language Studio, giáo viên Aoi chào đón Mai, học viên mới. Hai người giới thiệu tên và chào lần đầu.",
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
          "who": "aoi",
          "jp": "はじめまして。さとう あおいです。",
          "vi": "Rất vui được gặp. Tôi là Sato Aoi."
        },
        {
          "who": "mai",
          "jp": "はじめまして。わたしは マイです。ベトナムじんです。",
          "vi": "Rất vui được gặp. Tôi là Mai, người Việt Nam."
        },
        {
          "who": "aoi",
          "jp": "マイさん、どうぞ よろしくおねがいします。",
          "vi": "Mai, rất mong được giúp đỡ."
        },
        {
          "who": "mai",
          "jp": "こちらこそ、よろしくおねがいします。",
          "vi": "Tôi cũng rất mong được giúp đỡ."
        }
      ],
      "tip": "Khi người đối diện đã biết bạn đang nói về ai, không nhất thiết câu nào cũng dùng わたしは. さん được dùng sau tên người khác, không dùng với tên mình.",
      "challenge": {
        "title": "Bạn là Mai và gặp Aoi lần đầu. Câu mở đầu nào phù hợp?",
        "options": [
          "はじめまして。マイです。",
          "おやすみなさい。マイです。",
          "いいえ、マイじゃありません。"
        ],
        "correct": 0,
        "why": "はじめまして khi gặp lần đầu. Khi tự giới thiệu, không thêm さん sau tên mình."
      },
      "compose": {
        "prompt": "Tự giới thiệu tên và quốc tịch của bạn trong 1–2 câu.",
        "hint": "はじめまして / わたしは / ～じんです",
        "sample": "はじめまして。わたしは マイです。ベトナムじんです。どうぞ よろしくおねがいします。"
      },
      "place": "Ichibu Language Studio",
      "time": "Buổi sáng · buổi học đầu tiên",
      "relationship": "Aoi là giáo viên tiếng Nhật, Mai là du học sinh Việt Nam đang tham gia lớp.",
      "purpose": "Chào, nói tên, quốc tịch và đáp lời lịch sự.",
      "hint": "Quan sát ai mở lời và cách cúi chào khi gặp lần đầu.",
      "location": "school",
      "replace": {
        "prompt": "Điền quốc tịch của Mai",
        "stem": "マイさんは（　）です。",
        "options": [
          "ベトナムじん",
          "にほんじん",
          "いしゃ"
        ],
        "answer": 0,
        "why": "Mai là người Việt Nam nên nói ベトナムじん."
      },
      "variation": {
        "label": "Thử một biến thể",
        "prompt": "Đặt bản thân vào Ichibu Language Studio. Hãy thay tên, quốc tịch hoặc nơi làm việc bằng dữ kiện phù hợp.",
        "tip": "Giữ mẫu ngữ pháp, đổi thông tin nhưng đừng làm mâu thuẫn bối cảnh."
      }
    },
    {
      "id": "colleague",
      "title": "Giới thiệu đồng nghiệp",
      "jpTitle": "こちらは ホアさんです",
      "situation": "Tại Nagi Riverside Hotel, Misaki giới thiệu đồng nghiệp Linh với Kenta, người hỗ trợ công nghệ từ công ty Kaze Systems.",
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
          "who": "misaki",
          "jp": "こちらは リンさんです。",
          "vi": "Đây là chị Linh."
        },
        {
          "who": "kenta",
          "jp": "リンさんは ホテルの しゃいんですか。",
          "vi": "Chị Linh là nhân viên khách sạn phải không?"
        },
        {
          "who": "misaki",
          "jp": "はい。ホテルなぎの しゃいんです。",
          "vi": "Vâng. Chị ấy là nhân viên khách sạn Nagi."
        },
        {
          "who": "linh",
          "jp": "どうぞ よろしくおねがいします。",
          "vi": "Rất mong được giúp đỡ."
        }
      ],
      "tip": "こちらは là cách giới thiệu người đang ở gần. の liên kết tên tổ chức với nghề/vai trò, chẳng hạn さくらホテルの エンジニア.",
      "challenge": {
        "title": "Misaki muốn giới thiệu Linh với Kenta. Nói thế nào?",
        "options": [
          "わたしは リンさんです。",
          "こちらは リンさんです。",
          "リンさんも です。"
        ],
        "correct": 1,
        "why": "こちらは ～さんです dùng giới thiệu người khác; không tự nhận mình là Linh."
      },
      "compose": {
        "prompt": "Giới thiệu một đồng nghiệp bằng tên giả và cơ quan phù hợp.",
        "hint": "こちらは ～さんです。～の しゃいんです。",
        "sample": "こちらは リンさんです。ホテルなぎの しゃいんです。"
      },
      "place": "Nagi Riverside Hotel · ホテル凪",
      "time": "Buổi sáng · giới thiệu người phối hợp",
      "relationship": "Misaki làm lễ tân, Linh hỗ trợ khách tại khách sạn; Kenta làm IT Service Lead tại Kaze Systems.",
      "purpose": "Giới thiệu người khác và nêu cơ quan/nhiệm vụ.",
      "hint": "Phân biệt nhân viên khách sạn và người làm ở công ty đối tác.",
      "location": "office",
      "replace": {
        "prompt": "Nói Linh là nhân viên khách sạn Nagi",
        "stem": "リンさんは ホテルなぎ（　）しゃいんです。",
        "options": [
          "も",
          "の",
          "ですか"
        ],
        "answer": 1,
        "why": "の nối tên nơi làm việc với nghề nghiệp/vai trò."
      },
      "variation": {
        "label": "Thử một biến thể",
        "prompt": "Đặt bản thân vào Nagi Riverside Hotel · ホテル凪. Hãy thay tên, quốc tịch hoặc nơi làm việc bằng dữ kiện phù hợp.",
        "tip": "Giữ mẫu ngữ pháp, đổi thông tin nhưng đừng làm mâu thuẫn bối cảnh."
      }
    },
    {
      "id": "correcting",
      "title": "Sửa thông tin bị nhầm",
      "jpTitle": "いいえ、ちがいます",
      "situation": "Mai gặp Yuki ở Kissa Komorebi và hỏi về công việc của Kenta. Yuki sửa một thông tin bị hiểu nhầm.",
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
          "who": "mai",
          "jp": "ケンタさんは いしゃですか。",
          "vi": "Anh Kenta là bác sĩ phải không?"
        },
        {
          "who": "yuki",
          "jp": "いいえ、いしゃじゃありません。",
          "vi": "Không, anh ấy không phải bác sĩ."
        },
        {
          "who": "yuki",
          "jp": "カゼシステムズの かいしゃいんです。",
          "vi": "Anh ấy là nhân viên công ty Kaze Systems."
        },
        {
          "who": "mai",
          "jp": "そうですか。ありがとうございます。",
          "vi": "Ra vậy. Cảm ơn chị."
        }
      ],
      "tip": "Khi phủ định thông tin, nên cho biết câu trả lời đúng sau đó. か giúp đặt câu hỏi mà không phải đảo thứ tự từ như tiếng Anh.",
      "challenge": {
        "title": "Kenta không phải bác sĩ. Bạn trả lời ra sao?",
        "options": [
          "はい、いしゃです。",
          "いいえ、いしゃじゃありません。",
          "ケンタさんも いしゃです。"
        ],
        "correct": 1,
        "why": "いいえ + じゃありません phủ định; nên bổ sung thông tin đúng nếu biết."
      },
      "compose": {
        "prompt": "Viết một câu phủ định nghề nghiệp, rồi bổ sung nghề đúng.",
        "hint": "いいえ、～じゃありません。～です。",
        "sample": "いいえ、いしゃじゃありません。かいしゃいんです。"
      },
      "place": "Kissa Komorebi · 喫茶こもれび",
      "time": "Buổi chiều · giờ nghỉ",
      "relationship": "Mai là nhân viên làm thêm; Yuki là quản lý quán. Họ đang nói về Kenta của Kaze Systems.",
      "purpose": "Hỏi nghề nghiệp, phủ định và cung cấp thông tin đúng.",
      "hint": "Sau いいえ, hãy nghe xem người đó thực sự làm việc ở đâu.",
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
        "label": "Thử một biến thể",
        "prompt": "Đặt bản thân vào Kissa Komorebi · 喫茶こもれび. Hãy thay tên, quốc tịch hoặc nơi làm việc bằng dữ kiện phù hợp.",
        "tip": "Giữ mẫu ngữ pháp, đổi thông tin nhưng đừng làm mâu thuẫn bối cảnh."
      }
    },
    {
      "id": "classmates",
      "title": "Có chung đặc điểm",
      "jpTitle": "ミナさんも がくせいです",
      "situation": "Ở Đại học Mizuki, Minh và Riko trao đổi về Jiwoo, bạn tham gia nhóm giao lưu. Họ xác nhận điểm chung là sinh viên.",
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
          "who": "minh",
          "jp": "わたしは みずきだいがくの がくせいです。",
          "vi": "Tôi là sinh viên Đại học Mizuki."
        },
        {
          "who": "riko",
          "jp": "ジウさんも がくせいですか。",
          "vi": "Jiwoo cũng là sinh viên phải không?"
        },
        {
          "who": "minh",
          "jp": "はい、ジウさんも がくせいです。",
          "vi": "Vâng, Jiwoo cũng là sinh viên."
        },
        {
          "who": "riko",
          "jp": "ジウさんも みずきだいがくの がくせいですか。",
          "vi": "Jiwoo cũng là sinh viên Đại học Mizuki phải không?"
        }
      ],
      "tip": "も thay cho は trong ý nghĩa “cũng”. Hãy phân biệt “cũng là sinh viên” và “cũng học cùng trường”: vế sau cần thêm thông tin nơi học.",
      "challenge": {
        "title": "Đã biết Minh là sinh viên. Nói Jiwoo 'cũng là sinh viên' như thế nào?",
        "options": [
          "ジウさん はも がくせいです。",
          "ジウさん の がくせいです。",
          "ジウさん も がくせいです。"
        ],
        "correct": 2,
        "why": "も ở vị trí trợ từ chủ đề để diễn đạt 'cũng'; không có はも."
      },
      "compose": {
        "prompt": "Nói về hai bạn có cùng nghề nghiệp hoặc cùng trường.",
        "hint": "Aさんは ～です。Bさんも ～です。",
        "sample": "ミンさんは がくせいです。ジウさんも がくせいです。"
      },
      "place": "Mizuki University · みずき大学",
      "time": "Chiều · sau buổi giao lưu",
      "relationship": "Minh và Riko là sinh viên Mizuki; Jiwoo là sinh viên trao đổi trong cùng nhóm.",
      "purpose": "Dùng も để nói cùng đặc điểm, dùng の để nói trường.",
      "hint": "Cùng là sinh viên không tự động có nghĩa là học cùng ngành hoặc lớp.",
      "location": "campus",
      "replace": {
        "prompt": "Điền trợ từ để nói Jiwoo cũng là sinh viên",
        "stem": "ジウさん（　）がくせいです。",
        "options": [
          "は",
          "も",
          "の"
        ],
        "answer": 1,
        "why": "も diễn đạt cùng đặc điểm với người vừa nói."
      },
      "variation": {
        "label": "Thử một biến thể",
        "prompt": "Đặt bản thân vào Mizuki University · みずき大学. Hãy thay tên, quốc tịch hoặc nơi làm việc bằng dữ kiện phù hợp.",
        "tip": "Giữ mẫu ngữ pháp, đổi thông tin nhưng đừng làm mâu thuẫn bối cảnh."
      }
    },
    {
      "id": "namecheck",
      "title": "Hỏi và xác nhận tên",
      "jpTitle": "おなまえは？",
      "situation": "Aoi kiểm tra danh sách học viên ở Ichibu và hỏi tên Sophie để xác nhận trước buổi học.",
      "goal": "Hỏi tên lịch sự và xác nhận đúng người.",
      "place": "Ichibu Language Studio · いちぶ日本語教室",
      "time": "Sáng · trước giờ học",
      "relationship": "Aoi là giáo viên phụ trách lớp hội thoại; Sophie là biên tập viên đang học tiếng Nhật.",
      "purpose": "Hỏi tên lịch sự và nhắc lại tên cho đúng.",
      "hint": "Lắng nghe おなまえは và cách dùng ～さんですね.",
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
          "who": "aoi",
          "jp": "しつれいですが、おなまえは？",
          "vi": "Xin phép hỏi, tên chị là gì?"
        },
        {
          "who": "sophie",
          "jp": "ソフィーです。",
          "vi": "Tôi là Sophie."
        },
        {
          "who": "aoi",
          "jp": "ソフィーさんですね。",
          "vi": "Vậy là chị Sophie, đúng không ạ?"
        },
        {
          "who": "sophie",
          "jp": "はい、そうです。よろしくおねがいします。",
          "vi": "Vâng, đúng vậy. Rất mong được giúp đỡ."
        }
      ],
      "tip": "Hỏi tên bằng おなまえは？ lịch sự hơn dùng あなたは だれですか. Gọi Mina là ミナさん, không dùng さん khi tự nói tên.",
      "challenge": {
        "title": "Bạn chưa biết tên học viên mới. Nên hỏi thế nào?",
        "options": [
          "あなたは だれですか。",
          "しつれいですが、おなまえは？",
          "ソフィーさんも がくせいです。"
        ],
        "correct": 1,
        "why": "しつれいですが、おなまえは？ mở lời lịch sự."
      },
      "compose": {
        "prompt": "Hỏi tên một người mới, rồi xác nhận lại tên.",
        "hint": "しつれいですが / おなまえは / ～さんですね。",
        "sample": "しつれいですが、おなまえは？ ソフィーさんですね。"
      },
      "replace": {
        "prompt": "Cách gọi Sophie lịch sự",
        "stem": "（　）、よろしくおねがいします。",
        "options": [
          "ソフィーさん",
          "ソフィーじん",
          "わたしさん"
        ],
        "answer": 0,
        "why": "さん đặt sau tên người khác."
      },
      "variation": {
        "label": "Thử một biến thể",
        "prompt": "Đặt bản thân vào Ichibu Language Studio · いちぶ日本語教室. Hãy thay tên, quốc tịch hoặc nơi làm việc bằng dữ kiện phù hợp.",
        "tip": "Giữ mẫu ngữ pháp, đổi thông tin nhưng đừng làm mâu thuẫn bối cảnh."
      }
    },
    {
      "id": "identity",
      "title": "Hỏi quốc tịch và nghề nghiệp",
      "jpTitle": "ベトナムじんですか",
      "situation": "Tại Kissa Komorebi, Yuki hỏi Linh về quốc tịch và công việc trong một buổi giao lưu cộng đồng.",
      "goal": "Hỏi, trả lời về quốc tịch và vai trò.",
      "place": "Kissa Komorebi · 喫茶こもれび",
      "time": "Chiều · buổi giao lưu khu phố",
      "relationship": "Yuki là quản lý quán; Linh là nhân viên hỗ trợ khách tại Nagi Riverside Hotel.",
      "purpose": "Hỏi và trả lời về quốc tịch, nơi làm việc.",
      "hint": "Lắng nghe ですか trong câu hỏi và はい trong câu trả lời.",
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
          "who": "yuki",
          "jp": "リンさんは ベトナムじんですか。",
          "vi": "Chị Linh là người Việt Nam phải không?"
        },
        {
          "who": "linh",
          "jp": "はい、ベトナムじんです。",
          "vi": "Vâng, tôi là người Việt Nam."
        },
        {
          "who": "yuki",
          "jp": "ホテルの しゃいんですか。",
          "vi": "Chị làm ở khách sạn phải không?"
        },
        {
          "who": "linh",
          "jp": "はい、そうです。",
          "vi": "Vâng, đúng vậy."
        }
      ],
      "tip": "Thêm か để biến câu trần thuật thành câu hỏi lịch sự. Khi biết người đang được hỏi, có thể bỏ chủ đề thay vì nhắc ～さん liên tục.",
      "challenge": {
        "title": "Yuki hỏi Linh có làm ở khách sạn không. Câu nào đúng?",
        "options": [
          "リンさんは ホテルの しゃいんですか。",
          "リンさんの しゃいんです。",
          "リンさんも ですか ホテル。"
        ],
        "correct": 0,
        "why": "Câu hỏi danh từ kết thúc bằng ですか."
      },
      "compose": {
        "prompt": "Hỏi một người về quốc tịch và nơi làm việc, rồi trả lời.",
        "hint": "～じんですか。/ はい、そうです。/ いいえ、～じゃありません。",
        "sample": "リンさんは ベトナムじんですか。はい、そうです。"
      },
      "replace": {
        "prompt": "Hỏi Linh có phải nhân viên khách sạn",
        "stem": "リンさんは ホテルの しゃいんです（　）。",
        "options": [
          "の",
          "か",
          "も"
        ],
        "answer": 1,
        "why": "Thêm か để đặt câu hỏi."
      },
      "variation": {
        "label": "Thử một biến thể",
        "prompt": "Đặt bản thân vào Kissa Komorebi · 喫茶こもれび. Hãy thay tên, quốc tịch hoặc nơi làm việc bằng dữ kiện phù hợp.",
        "tip": "Giữ mẫu ngữ pháp, đổi thông tin nhưng đừng làm mâu thuẫn bối cảnh."
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
  "editionNote": "Nội dung HORIZON tự biên soạn theo mục tiêu ngữ pháp Bài 01; nhân vật và tổ chức kế thừa NP_WORLD (Minato-no-Machi)."
});
