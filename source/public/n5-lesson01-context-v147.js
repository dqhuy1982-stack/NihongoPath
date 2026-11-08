/* HORIZON N5 L01 v1.47 — Original linked learning situations. No copied dialogue or publisher audio. */
window.NPN5Lesson01Scenes=Object.freeze({
  "version": 1,
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
      }
    }
  ],
  "practiceSceneById": {
    "p01": "classmates",
    "p02": "colleague",
    "p03": "correcting",
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
    "p16": "meeting"
  }
});
