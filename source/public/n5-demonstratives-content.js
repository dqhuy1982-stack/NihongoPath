/* N5 lesson: demonstratives and speaker/listener relative positions. */
window.NP_N5_DEMONSTRATIVES_CONTENT={
  "id": "n5-demonstratives",
  "version": 1,
  "title": "N5 · これ・それ・あれ",
  "level": "N5",
  "status": "authored-sample",
  "scope": "Bài đọc và kiểm tra từ chỉ định đồ vật. Không có đánh giá phát âm, từ vựng hay hội thoại tự do.",
  "sourceNote": "Nội dung minh họa sơ cấp tự biên soạn, nhấn mạnh khoảng cách đối với người nói/nghe.",
  "locale": "vi",
  "explanationLocale": "vi",
  "headline": [
    "Đây, đó hay kia?",
    "Nói đúng khoảng cách."
  ],
  "lead": "Phân biệt これ, それ và あれ theo vị trí đồ vật đối với người nói và người nghe.",
  "readings": {},
  "cast": [
    {
      "id": "mai",
      "name": "Mai",
      "role": "Người học tiếng Nhật",
      "jp": "マイ"
    },
    {
      "id": "aoi",
      "name": "Aoi",
      "role": "Người hướng dẫn",
      "jp": "あおい"
    }
  ],
  "story": [
    {
      "speaker": "mai",
      "text": "これは本です。",
      "meaning": "Mai đang cầm sách: Đây là quyển sách."
    },
    {
      "speaker": "aoi",
      "text": "それは本ですか。",
      "meaning": "Aoi hỏi về quyển sách ở gần Mai: Đó là sách phải không?"
    },
    {
      "speaker": "mai",
      "text": "はい、本です。",
      "meaning": "Mai xác nhận: Vâng, là sách."
    }
  ],
  "concepts": [
    {
      "id": "point-kore",
      "name": "これ · Cái này",
      "questionId": "q-kore",
      "reading": "Đồ vật ở gần người nói."
    },
    {
      "id": "point-sore",
      "name": "それ · Cái đó",
      "questionId": "q-sore",
      "reading": "Đồ vật ở gần người nghe."
    },
    {
      "id": "point-are",
      "name": "あれ · Cái kia",
      "questionId": "q-are",
      "reading": "Đồ vật ở xa cả hai người."
    }
  ],
  "cards": {
    "kore": {
      "title": "これ · Cái này",
      "example": "これは本です。",
      "meaning": "Đây là quyển sách.",
      "pattern": "これ は [đồ vật] です。",
      "points": [
        "Đồ vật ở gần người nói.",
        "Chỉ định phụ thuộc vào vị trí so với người nói/người nghe, không chỉ khoảng cách tuyệt đối."
      ],
      "pitfall": "Đừng dịch cả ba thành 'đây'. Chú ý điểm nhìn của hai người trong tình huống."
    },
    "sore": {
      "title": "それ · Cái đó",
      "example": "それはペンです。",
      "meaning": "Đó là cây bút.",
      "pattern": "それ は [đồ vật] です。",
      "points": [
        "Đồ vật ở gần người nghe.",
        "Chỉ định phụ thuộc vào vị trí so với người nói/người nghe, không chỉ khoảng cách tuyệt đối."
      ],
      "pitfall": "Đừng dịch cả ba thành 'đây'. Chú ý điểm nhìn của hai người trong tình huống."
    },
    "are": {
      "title": "あれ · Cái kia",
      "example": "あれはかばんです。",
      "meaning": "Kia là chiếc cặp.",
      "pattern": "あれ は [đồ vật] です。",
      "points": [
        "Đồ vật ở xa cả hai người.",
        "Chỉ định phụ thuộc vào vị trí so với người nói/người nghe, không chỉ khoảng cách tuyệt đối."
      ],
      "pitfall": "Đừng dịch cả ba thành 'đây'. Chú ý điểm nhìn của hai người trong tình huống."
    }
  },
  "questions": [
    {
      "id": "q-kore",
      "version": 1,
      "conceptId": "point-kore",
      "type": "choice",
      "prompt": "Trong tình huống này, chọn từ phù hợp: Người nói cầm cuốn sách.",
      "stimulus": "___ は何ですか。",
      "options": [
        {
          "id": "kore",
          "text": "これ",
          "why": "これ đúng vì đồ vật ở gần người nói."
        },
        {
          "id": "sore",
          "text": "それ",
          "why": "それ dùng cho đồ vật ở gần người nghe. Tình huống này không phù hợp."
        },
        {
          "id": "are",
          "text": "あれ",
          "why": "あれ dùng cho đồ vật ở xa cả hai người. Tình huống này không phù hợp."
        }
      ],
      "answer": "kore",
      "hint": "So sánh vị trí vật với người nói và người nghe.",
      "explanation": "これ (Cái này): Đồ vật ở gần người nói."
    },
    {
      "id": "q-sore",
      "version": 1,
      "conceptId": "point-sore",
      "type": "choice",
      "prompt": "Trong tình huống này, chọn từ phù hợp: Cây bút ở ngay bên người nghe, xa người nói.",
      "stimulus": "___ は何ですか。",
      "options": [
        {
          "id": "kore",
          "text": "これ",
          "why": "これ dùng cho đồ vật ở gần người nói. Tình huống này không phù hợp."
        },
        {
          "id": "sore",
          "text": "それ",
          "why": "それ đúng vì đồ vật ở gần người nghe."
        },
        {
          "id": "are",
          "text": "あれ",
          "why": "あれ dùng cho đồ vật ở xa cả hai người. Tình huống này không phù hợp."
        }
      ],
      "answer": "sore",
      "hint": "So sánh vị trí vật với người nói và người nghe.",
      "explanation": "それ (Cái đó): Đồ vật ở gần người nghe."
    },
    {
      "id": "q-are",
      "version": 1,
      "conceptId": "point-are",
      "type": "choice",
      "prompt": "Trong tình huống này, chọn từ phù hợp: Chiếc cặp ở xa cả người nói và người nghe.",
      "stimulus": "___ は何ですか。",
      "options": [
        {
          "id": "kore",
          "text": "これ",
          "why": "これ dùng cho đồ vật ở gần người nói. Tình huống này không phù hợp."
        },
        {
          "id": "sore",
          "text": "それ",
          "why": "それ dùng cho đồ vật ở gần người nghe. Tình huống này không phù hợp."
        },
        {
          "id": "are",
          "text": "あれ",
          "why": "あれ đúng vì đồ vật ở xa cả hai người."
        }
      ],
      "answer": "are",
      "hint": "So sánh vị trí vật với người nói và người nghe.",
      "explanation": "あれ (Cái kia): Đồ vật ở xa cả hai người."
    }
  ],
  "units": {
    "learn-kore": {
      "type": "learn",
      "cardId": "kore",
      "label": "Làm quen これ",
      "seconds": 50
    },
    "ask-kore": {
      "type": "question",
      "questionId": "q-kore",
      "label": "Chọn đúng これ",
      "seconds": 45
    },
    "learn-sore": {
      "type": "learn",
      "cardId": "sore",
      "label": "Làm quen それ",
      "seconds": 50
    },
    "ask-sore": {
      "type": "question",
      "questionId": "q-sore",
      "label": "Chọn đúng それ",
      "seconds": 45
    },
    "learn-are": {
      "type": "learn",
      "cardId": "are",
      "label": "Làm quen あれ",
      "seconds": 50
    },
    "ask-are": {
      "type": "question",
      "questionId": "q-are",
      "label": "Chọn đúng あれ",
      "seconds": 45
    },
    "story": {
      "type": "story",
      "label": "Hội thoại quanh đồ vật",
      "seconds": 60
    }
  },
  "plans": {
    "3": [
      "learn-kore",
      "learn-sore",
      "ask-kore"
    ],
    "5": [
      "learn-kore",
      "learn-sore",
      "learn-are",
      "ask-kore",
      "ask-sore",
      "ask-are"
    ],
    "15": [
      "story",
      "learn-kore",
      "learn-sore",
      "learn-are",
      "ask-kore",
      "ask-sore",
      "ask-are"
    ]
  }
};
