/* N5 · Time-appropriate greetings: authored sample, no audio assessment. */
window.NP_N5_GREETINGS_CONTENT={
  "id": "n5-greetings",
  "version": 1,
  "title": "N5 · Lời chào theo thời điểm",
  "level": "N5",
  "status": "authored-sample",
  "scope": "Bài đọc và nhận diện lời chào, chưa có chức năng nghe hay chấm phát âm.",
  "sourceNote": "Nội dung sơ cấp tự biên soạn để luyện phân biệt thời điểm dùng lời chào lịch sự.",
  "locale": "vi",
  "explanationLocale": "vi",
  "headline": [
    "Một lời chào đúng lúc.",
    "Bắt đầu cuộc gặp."
  ],
  "lead": "Phân biệt lời chào buổi sáng, ban ngày và buổi tối. Đọc ví dụ rồi tự chọn khi nào sử dụng.",
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
      "text": "おはようございます。",
      "meaning": "Mai chào khi gặp Aoi vào buổi sáng."
    },
    {
      "speaker": "aoi",
      "text": "おはようございます。",
      "meaning": "Aoi đáp lại lời chào buổi sáng."
    },
    {
      "speaker": "mai",
      "text": "こんにちは。",
      "meaning": "Một cuộc gặp khác vào ban ngày."
    }
  ],
  "concepts": [
    {
      "id": "greet-morning",
      "name": "おはようございます。 · Buổi sáng",
      "questionId": "q-morning",
      "reading": "Buổi sáng"
    },
    {
      "id": "greet-day",
      "name": "こんにちは。 · Ban ngày",
      "questionId": "q-day",
      "reading": "Ban ngày"
    },
    {
      "id": "greet-evening",
      "name": "こんばんは。 · Buổi tối",
      "questionId": "q-evening",
      "reading": "Buổi tối"
    }
  ],
  "cards": {
    "morning": {
      "title": "Buổi sáng · おはようございます。",
      "example": "おはようございます。",
      "meaning": "Chào buổi sáng.",
      "pattern": "おはようございます。",
      "points": [
        "Chào người khác vào buổi sáng.",
        "Đọc lời chào như một cụm. Ghi nhớ thời điểm trước khi ghi nhớ mặt chữ."
      ],
      "pitfall": "おはようございます mang sắc thái lịch sự; bài này chưa luyện cách dùng thân mật."
    },
    "day": {
      "title": "Ban ngày · こんにちは。",
      "example": "こんにちは。",
      "meaning": "Xin chào (ban ngày).",
      "pattern": "こんにちは。",
      "points": [
        "Chào người khác vào ban ngày.",
        "Đọc lời chào như một cụm. Ghi nhớ thời điểm trước khi ghi nhớ mặt chữ."
      ],
      "pitfall": "こんにちは dùng khi chào ban ngày; không đồng nghĩa với mọi lời chào trong ngày."
    },
    "evening": {
      "title": "Buổi tối · こんばんは。",
      "example": "こんばんは。",
      "meaning": "Chào buổi tối.",
      "pattern": "こんばんは。",
      "points": [
        "Chào người khác vào buổi tối.",
        "Đọc lời chào như một cụm. Ghi nhớ thời điểm trước khi ghi nhớ mặt chữ."
      ],
      "pitfall": "こんばんは là lời chào khi gặp buổi tối, không phải おやすみなさい (chúc ngủ ngon)."
    }
  },
  "questions": [
    {
      "id": "q-morning",
      "version": 1,
      "conceptId": "greet-morning",
      "type": "choice",
      "prompt": "Khi gặp người khác vào buổi sáng, bạn nên dùng lời chào nào?",
      "stimulus": "Buổi sáng · Bạn vừa gặp một người quen.",
      "options": [
        {
          "id": "morning",
          "text": "おはようございます。",
          "why": "おはようございます。 phù hợp với buổi sáng."
        },
        {
          "id": "day",
          "text": "こんにちは。",
          "why": "こんにちは。 thường dùng vào ban ngày, không phù hợp với tình huống này."
        },
        {
          "id": "evening",
          "text": "こんばんは。",
          "why": "こんばんは。 thường dùng vào buổi tối, không phù hợp với tình huống này."
        }
      ],
      "answer": "morning",
      "hint": "Dựa vào thời điểm trong tình huống, rồi nhớ lại câu chào đã học.",
      "explanation": "おはようございます。 — Chào buổi sáng. Lời chào được chọn theo ngữ cảnh thời gian."
    },
    {
      "id": "q-day",
      "version": 1,
      "conceptId": "greet-day",
      "type": "choice",
      "prompt": "Khi gặp người khác vào ban ngày, bạn nên dùng lời chào nào?",
      "stimulus": "Ban ngày · Bạn vừa gặp một người quen.",
      "options": [
        {
          "id": "morning",
          "text": "おはようございます。",
          "why": "おはようございます。 thường dùng vào buổi sáng, không phù hợp với tình huống này."
        },
        {
          "id": "day",
          "text": "こんにちは。",
          "why": "こんにちは。 phù hợp với ban ngày."
        },
        {
          "id": "evening",
          "text": "こんばんは。",
          "why": "こんばんは。 thường dùng vào buổi tối, không phù hợp với tình huống này."
        }
      ],
      "answer": "day",
      "hint": "Dựa vào thời điểm trong tình huống, rồi nhớ lại câu chào đã học.",
      "explanation": "こんにちは。 — Xin chào (ban ngày). Lời chào được chọn theo ngữ cảnh thời gian."
    },
    {
      "id": "q-evening",
      "version": 1,
      "conceptId": "greet-evening",
      "type": "choice",
      "prompt": "Khi gặp người khác vào buổi tối, bạn nên dùng lời chào nào?",
      "stimulus": "Buổi tối · Bạn vừa gặp một người quen.",
      "options": [
        {
          "id": "morning",
          "text": "おはようございます。",
          "why": "おはようございます。 thường dùng vào buổi sáng, không phù hợp với tình huống này."
        },
        {
          "id": "day",
          "text": "こんにちは。",
          "why": "こんにちは。 thường dùng vào ban ngày, không phù hợp với tình huống này."
        },
        {
          "id": "evening",
          "text": "こんばんは。",
          "why": "こんばんは。 phù hợp với buổi tối."
        }
      ],
      "answer": "evening",
      "hint": "Dựa vào thời điểm trong tình huống, rồi nhớ lại câu chào đã học.",
      "explanation": "こんばんは。 — Chào buổi tối. Lời chào được chọn theo ngữ cảnh thời gian."
    }
  ],
  "units": {
    "learn-morning": {
      "type": "learn",
      "label": "Làm quen Buổi sáng",
      "cardId": "morning",
      "seconds": 40
    },
    "ask-morning": {
      "type": "question",
      "label": "Thử nhớ Buổi sáng",
      "questionId": "q-morning",
      "seconds": 45
    },
    "learn-day": {
      "type": "learn",
      "label": "Làm quen Ban ngày",
      "cardId": "day",
      "seconds": 40
    },
    "ask-day": {
      "type": "question",
      "label": "Thử nhớ Ban ngày",
      "questionId": "q-day",
      "seconds": 45
    },
    "learn-evening": {
      "type": "learn",
      "label": "Làm quen Buổi tối",
      "cardId": "evening",
      "seconds": 40
    },
    "ask-evening": {
      "type": "question",
      "label": "Thử nhớ Buổi tối",
      "questionId": "q-evening",
      "seconds": 45
    }
  },
  "plans": {
    "3": [
      "learn-morning",
      "learn-day",
      "ask-morning"
    ],
    "5": [
      "learn-morning",
      "learn-day",
      "learn-evening",
      "ask-morning",
      "ask-day",
      "ask-evening"
    ],
    "15": [
      "learn-morning",
      "learn-day",
      "learn-evening",
      "ask-morning",
      "ask-day",
      "ask-evening"
    ]
  }
};
