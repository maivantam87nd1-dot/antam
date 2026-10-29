import {
  MeditationTrack,
  BuddhistScripture,
  AmbientSound,
  MindfulnessSpace,
  MindfulnessJourney,
  SoundMixPreset
} from '../types';

export const LOTUS_DAWN = '/assets/images/lotus_pond_dawn_1793159474945.jpg';
export const BAMBOO_TEMPLE = '/assets/images/zen_bamboo_temple_1793159475967.jpg';
export const MOONLIT_SANCTUARY = '/assets/images/moonlit_sanctuary_1793159476039.jpg';
export const ZEN_STREAM = '/assets/images/zen_stream_garden_1793159476565.jpg';

export const MEDITATION_TRACKS: MeditationTrack[] = [
  {
    id: 'med-1',
    title: 'Thiền cho người mới bắt đầu',
    subtitle: 'Làm quen với tư thế và hơi thở tự nhiên',
    category: 'beginner',
    categoryName: 'Người mới bắt đầu',
    description: 'Hướng dẫn nền tảng giúp bạn ngồi yên, nhận diện hơi thở vào - ra, và đưa tâm trở về với thân một cách nhẹ nhàng không gượng ép.',
    durations: [3, 5, 10, 15],
    instructor: 'Thầy Minh Tuệ',
    source: 'Truyền thống Thiền Nguyên Thủy & Trúc Lâm',
    image: LOTUS_DAWN,
    audioTone: 'singing_bowl',
    instructions: [
      'Ngồi thẳng lưng, thả lỏng hai vai và khép nhẹ mi mắt.',
      'Hít vào một hơi thật sâu, cảm nhận lồng ngực mở rộng.',
      'Thở ra từ tốn, buông bỏ mọi căng thẳng trên cơ thể.',
      'Đưa sự chú ý về điểm chạm của hơi thở nơi cánh mũi.',
      'Nếu tâm có xao động, chỉ mỉm cười và nhẹ nhàng quay lại hơi thở.'
    ]
  },
  {
    id: 'med-2',
    title: 'Thiền đón bình minh an lành',
    subtitle: 'Nạp năng lượng tích cực cho ngày mới',
    category: 'morning',
    categoryName: 'Buổi sáng',
    description: 'Khởi đầu ngày mới với tâm thế rộng mở, đón nhận ánh sáng ấm áp và nuôi dưỡng niềm vui sống.',
    durations: [5, 10, 15, 20],
    instructor: 'Sư cô Chân Không',
    source: 'Chánh niệm Làng Mai',
    image: LOTUS_DAWN,
    audioTone: 'stream',
    instructions: [
      'Cảm nhận tia nắng sớm và không khí trong lành quanh bạn.',
      'Thở vào, tôi biết một ngày mới đang bắt đầu.',
      'Thở ra, tôi mỉm cười với mọi điều lành phía trước.',
      'Đặt tay lên trái tim, gửi lời tri ân vì mình vẫn đang thở.'
    ]
  },
  {
    id: 'med-3',
    title: 'Thiền buông xả trước khi ngủ',
    subtitle: 'Chìm vào giấc ngủ sâu thanh thản',
    category: 'sleep',
    categoryName: 'Trước khi ngủ',
    description: 'Thả lỏng toàn bộ cơ thể, giải phóng mọi áp lực của ngày dài để bước vào giấc ngủ an lành, không mộng mị.',
    durations: [10, 15, 20, 30],
    instructor: 'Thiền sư Tuệ Tĩnh',
    source: 'Thư giãn Y học Cổ truyền & Chánh niệm',
    image: MOONLIT_SANCTUARY,
    audioTone: 'theta',
    instructions: [
      'Nằm thoải mái trên giường, thả lỏng từ đỉnh đầu đến ngón chân.',
      'Thở vào thật êm, thở ra thật chậm và dài.',
      'Hình dung mọi ưu tư trong ngày trôi đi như bọt sóng.',
      'Cho phép tâm trí bạn nghỉ ngơi hoàn toàn trong tĩnh lặng.'
    ]
  },
  {
    id: 'med-4',
    title: 'Thiền quét cơ thể Body Scan',
    subtitle: 'Thư giãn sâu từng tế bào',
    category: 'relaxation',
    categoryName: 'Thư giãn sâu',
    description: 'Dẫn dắt tâm thức đi qua từng bộ phận cơ thể để nhận diện, vỗ về và làm tan biến những điểm căng cơ mệt mỏi.',
    durations: [10, 15, 20],
    instructor: 'Minh Tâm',
    source: 'MBSR - Giảm căng thẳng dựa trên Chánh niệm',
    image: ZEN_STREAM,
    audioTone: 'singing_bowl',
    instructions: [
      'Chú ý đến đôi chân, thả lỏng bàn chân và các ngón chân.',
      'Chuyển sự chú ý lên vùng bụng, lưng dưới và vai gáy.',
      'Thở vào sự êm dịu, thở ra giải tỏa sức căng.',
      'Cảm nhận toàn thân nhẹ bẫng và hòa vào không gian.'
    ]
  },
  {
    id: 'med-5',
    title: 'Thiền quan sát hơi thở Anapanasati',
    subtitle: 'Trở về với cội nguồn bình an',
    category: 'breath_focus',
    categoryName: 'Hơi thở',
    description: 'Kỹ thuật thiền định kinh điển quan sát sự sinh diệt tự nhiên của từng hơi thở vào và hơi thở ra.',
    durations: [5, 10, 15, 20, 30],
    instructor: 'HT. Thích Thanh Từ',
    source: 'Kinh Quán Niệm Hơi Thở (Anapanasati Sutta)',
    image: BAMBOO_TEMPLE,
    audioTone: 'bamboo',
    instructions: [
      'Thở vào dài, biết rõ thở vào dài.',
      'Thở ra dài, biết rõ thở ra dài.',
      'Thở vào ngắn, biết rõ thở vào ngắn.',
      'Thở ra ngắn, biết rõ thở ra ngắn.',
      'Cảm giác toàn thân, tôi thở vào. An tịnh thân hành, tôi thở ra.'
    ]
  },
  {
    id: 'med-6',
    title: 'Thiền nuôi dưỡng lòng biết ơn',
    subtitle: 'Mở rộng trái tim yêu thương',
    category: 'gratitude',
    categoryName: 'Biết ơn',
    description: 'Nhận diện những phước lành giản dị hiện hữu quanh ta: một hơi thở trong lành, một bữa ăn ngon, và tình thân ấm áp.',
    durations: [5, 10, 15],
    instructor: 'Thầy Pháp Niệm',
    source: 'Chánh niệm ứng dụng',
    image: LOTUS_DAWN,
    audioTone: 'stream',
    instructions: [
      'Nghĩ về 3 điều nhỏ bé khiến bạn cảm thấy trân trọng hôm nay.',
      'Gửi lòng biết ơn đến cơ thể đã luôn nỗ lực vì bạn.',
      'Gửi năng lượng ấm áp đến những người đã giúp đỡ bạn.'
    ]
  },
  {
    id: 'med-7',
    title: 'Thiền tâm từ bi Metta',
    subtitle: 'Nguyện cầu an vui cho muôn loài',
    category: 'loving_kindness',
    categoryName: 'Tâm từ bi',
    description: 'Phương pháp rải tâm từ đến chính mình, người thân thương, người trung lập và cả những người từng làm ta tổn thương.',
    durations: [10, 15, 20],
    instructor: 'HT. Thích Trí Siêu',
    source: 'Kinh Từ Bi (Metta Sutta)',
    image: BAMBOO_TEMPLE,
    audioTone: 'singing_bowl',
    isPremium: true,
    instructions: [
      'Nguyện cho con được bình an, mạnh khỏe và thoát khỏi khổ đau.',
      'Nguyện cho người thân thương được an lành và hạnh phúc.',
      'Nguyện cho khắp mười phương chúng sinh đều được an lạc.'
    ]
  },
  {
    id: 'med-8',
    title: 'Thiền buông bỏ muộn phiền',
    subtitle: 'Xả bỏ dính mắc và lo âu',
    category: 'letting_go',
    categoryName: 'Buông bỏ',
    description: 'Học cách không bám víu vào quá khứ hay lo âu về tương lai, sống trọn vẹn trong giây phút hiện tại nhiệm màu.',
    durations: [5, 10, 15, 20],
    instructor: 'Sư Minh Tuệ',
    source: 'Thiền Tứ Niệm Xứ',
    image: MOONLIT_SANCTUARY,
    audioTone: 'theta',
    isPremium: true,
    instructions: [
      'Nhận diện cảm xúc đang có mặt mà không phán xét.',
      'Hiểu rằng mọi sự việc đều vô thường và sẽ trôi qua.',
      'Thở ra, buông rơi những gánh nặng không thuộc về hiện tại.'
    ]
  },
  {
    id: 'med-9',
    title: 'Thiền tập trung cao độ',
    subtitle: 'Thanh lọc tâm trí trước khi làm việc',
    category: 'focus',
    categoryName: 'Tập trung',
    description: 'Thiền định ngắn giúp gom tâm tán loạn, thiết lập trạng thái tỉnh táo và sáng suốt cho công việc hoặc học tập.',
    durations: [3, 5, 10],
    instructor: 'Minh Tâm',
    source: 'Chánh niệm hiện đại',
    image: ZEN_STREAM,
    audioTone: 'singing_bowl',
    instructions: [
      'Ngồi vững chãi như một ngọn núi.',
      'Tập trung điểm nhìn hoặc cảm giác hơi thở.',
      'Mỗi khi ý nghĩ phóng đi, kéo nhẹ tâm về lại điểm tựa.'
    ]
  },
  {
    id: 'med-10',
    title: 'Thiền tịnh chỉ không lời (Chuông Thiền)',
    subtitle: 'Khoảng lặng thuần khiết giữa tiếng chuông ngân',
    category: 'silent',
    categoryName: 'Tịnh chỉ',
    description: 'Không gian tĩnh lặng trọn vẹn, chỉ có tiếng chuông xoay Tây Tạng định kỳ nhắc nhở bạn an trú trong chánh niệm.',
    durations: [5, 10, 15, 20, 30],
    instructor: 'Tiếng Chuông An Tâm',
    source: 'Truyền thống Thiền Định Cổ truyền',
    image: BAMBOO_TEMPLE,
    audioTone: 'singing_bowl',
    instructions: [
      'Lắng nghe tiếng chuông ngân vang đến khi âm thanh dứt hẳn.',
      'An trú trong sự tĩnh lặng thuần khiết.',
      'Để tâm tự nhiên như mặt nước phẳng lặng.'
    ]
  }
];

export const BUDDHIST_SCRIPTURES: BuddhistScripture[] = [
  {
    id: 'buddhist-1',
    title: 'Bát Nhã Ba La Mật Đa Tâm Kinh',
    sanskritTitle: 'Prajñāpāramitā Hṛdaya Sūtra',
    category: 'sutra',
    categoryLabel: 'Kinh điển Đại thừa',
    translator: 'HT. Thích Nhất Hạnh & HT. Thích Trí Quang dịch Việt',
    source: 'Đại Tạng Kinh Đại Chính Tân Tu',
    contentType: 'translation',
    description: 'Bản kinh cốt tủy của Phật giáo Đại thừa, chỉ rõ bản chất tính Không của vạn pháp và con đường vượt qua mọi khổ đau ách nạn.',
    image: BAMBOO_TEMPLE,
    audioTone: 'singing_bowl',
    contentVerses: [
      {
        sectionTitle: 'Phần I: Quán chiếu Tính Không',
        original: 'Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.',
        translation: 'Khi Bồ Tát Quán Tự Tại thực hành sâu sắc trí tuệ Bát Nhã, Ngài soi thấy năm uẩn đều là Không, liền vượt qua mọi khổ đau ách nạn.',
        explanation: 'Ngũ uẩn gồm: Sắc (thân thể), Thọ (cảm giác), Tưởng (tri giác), Hành (tâm hành), Thức (nhận thức). Thấy được tính duyên khởi của năm uẩn giúp tâm giải thoát khỏi bám víu.'
      },
      {
        sectionTitle: 'Phần II: Sắc tức thị Không',
        original: 'Xá Lợi Tử! Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc. Thọ, tưởng, hành, thức diệc phục như thị.',
        translation: 'Này Xá Lợi Phất! Sắc chẳng khác không, không chẳng khác sắc; sắc tức là không, không tức là sắc. Thọ, tưởng, hành, thức cũng đều như thế.',
        explanation: 'Vạn vật không có tự tánh cố định độc lập, mà luôn nương tựa vào nhau để biểu hiện.'
      },
      {
        sectionTitle: 'Phần III: Tâm không ngăn ngại',
        original: 'Dĩ vô sở đắc cố, Bồ Đề Tát Đỏa y Bát Nhã Ba La Mật Đa cố, tâm vô quái ngại; vô quái ngại cố, vô hữu khủng bố, viễn ly điên đảo mộng tưởng, cứu cánh Niết Bàn.',
        translation: 'Vì không có chỗ đắc, các bậc Bồ Tát nương theo trí tuệ Bát Nhã mà tâm không còn ngăn ngại; vì không ngăn ngại nên không sợ hãi, xa lìa mộng tưởng điên đảo, đạt đến Niết Bàn cứu cánh.'
      },
      {
        sectionTitle: 'Phần IV: Câu thần chú Bát Nhã',
        original: 'Yết đế, yết đế, ba la yết đế, ba la tăng yết đế, bồ đề tát bà ha.',
        translation: 'Vượt qua, vượt qua, cùng nhau vượt qua bờ giác ngộ, thành tựu viên mãn an vui.'
      }
    ]
  },
  {
    id: 'buddhist-2',
    title: 'Chú Đại Bi (84 Câu)',
    sanskritTitle: 'Mahā Karuṇā Dhāraṇī',
    category: 'mantra',
    categoryLabel: 'Chân ngôn Từ bi',
    translator: 'Ngài Bồ Đề Lưu Chi phiên âm, lưu truyền chư tự viện Việt Nam',
    source: 'Thiên Thủ Thiên Nhãn Quán Thế Âm Bồ Tát Quảng Đại Viên Mãn Vô Ngại Đại Bi Tâm Đà La Ni Kinh',
    contentType: 'original',
    description: 'Chân ngôn vi diệu cứu khổ ban vui của Bồ Tát Quán Thế Âm, mang lại sự che chở, bình an và thanh tịnh cho tâm hồn.',
    image: LOTUS_DAWN,
    audioTone: 'singing_bowl',
    contentVerses: [
      {
        sectionTitle: 'Đảnh lễ Tam Bảo & Bồ Tát Quán Âm',
        original: 'Nam mô Hắc Ra Đát Na Đa Ra Dạ Da. Nam mô A Rị Da, Bà Lô Kiết Đế Thước Bát Ra Da, Bồ Đề Tát Đỏa Bà Da, Ma Ha Tát Đỏa Bà Da, Ma Ha Ca Lô Ni Ca Da...',
        translation: 'Quy mạng mười phương Tam Bảo thanh tịnh. Con xin đảnh lễ Đức Quán Thế Âm Bồ Tát, Đấng đại từ đại bi vô biên, luôn lắng nghe tiếng kêu cứu của muôn loài.'
      },
      {
        sectionTitle: 'Phát nguyện Đại Bi Tâm',
        original: 'Án Tất Điện Đô, Mạn Đa Ra, Bạt Đà Dạ, Ta Bà Ha.',
        translation: 'Nguyện cho mọi tâm niệm thiện lành đều được viên mãn, nguyện cho hoa sen trí tuệ nở bừng trong lòng người trì tụng.'
      }
    ]
  },
  {
    id: 'buddhist-3',
    title: 'Kinh Phổ Môn (Phẩm Quán Thế Âm)',
    sanskritTitle: 'Saddharma Puṇḍarīka Sūtra - Samantamukha Parivarta',
    category: 'sutra',
    categoryLabel: 'Kinh điển Pháp Hoa',
    translator: 'Đại sư Cưu Ma La Thập dịch chữ Hán, HT. Thích Trí Tịnh dịch Việt',
    source: 'Kinh Diệu Pháp Liên Hoa',
    contentType: 'translation',
    description: 'Hạnh nguyện lắng nghe muôn vàn tiếng khổ đau của Đức Quán Thế Âm và phương pháp quán chiếu âm thanh cuộc đời để tìm về sự tĩnh lặng.',
    image: ZEN_STREAM,
    audioTone: 'stream',
    contentVerses: [
      {
        sectionTitle: 'Hạnh Lắng Nghe và Ứng Hiện',
        translation: 'Nếu có vô lượng trăm nghìn muôn ức chúng sinh chịu các khổ não, nghe danh hiệu Quán Thế Âm Bồ Tát, một lòng xưng niệm, Bồ Tát liền quán sát tiếng kêu đó mà độ cho được giải thoát.'
      },
      {
        sectionTitle: 'Diệu Âm Thanh Tịnh',
        translation: 'Diệu âm, Quán Thế Âm, Phạm âm, Hải triều âm, tiếng hơn các âm thanh thế gian, cho nên phải thường niệm, niệm niệm chớ sinh lòng nghi ngờ.'
      }
    ]
  },
  {
    id: 'buddhist-4',
    title: 'Lời Phật Dạy: Kinh Phước Đức (Mangala Sutta)',
    category: 'teachings',
    categoryLabel: 'Lời Phật dạy',
    translator: 'HT. Thích Minh Châu dịch từ Pāli',
    source: 'Tiểu Bộ Kinh (Khuddaka Nikaya)',
    contentType: 'translation',
    description: 'Mười bài kệ tóm lược con đường xây dựng cuộc sống an lạc, hạnh phúc chân thực ngay trong hiện tại.',
    image: BAMBOO_TEMPLE,
    audioTone: 'singing_bowl',
    contentVerses: [
      {
        sectionTitle: 'Tránh xa kẻ xấu, gần gũi bậc hiền',
        translation: 'Không thân cận kẻ ác, kết bạn cùng bậc hiền, cung kính bậc đáng kính, đó là điều phúc lành cao nhất.'
      },
      {
        sectionTitle: 'Tâm không lay động trước biến cố',
        translation: 'Tiếp xúc với việc đời, tâm không hề lay chuyển, không sầu não, không dính mắc, thanh thản và bình an, đó là phúc lành cao nhất.'
      }
    ]
  }
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Mưa Rơi Mái Ngói',
    icon: 'CloudRain',
    category: 'nature',
    type: 'rain',
    defaultVolume: 0.5
  },
  {
    id: 'stream',
    name: 'Suối Reo Rừng Trúc',
    icon: 'Waves',
    category: 'nature',
    type: 'stream',
    defaultVolume: 0.4
  },
  {
    id: 'singing_bowl',
    name: 'Chuông Xoay Tây Tạng',
    icon: 'Bell',
    category: 'meditation',
    type: 'singing_bowl',
    defaultVolume: 0.6
  },
  {
    id: 'theta_drone',
    name: 'Sóng Não Theta 432Hz',
    icon: 'Radio',
    category: 'binaural',
    type: 'theta_drone',
    defaultVolume: 0.35
  },
  {
    id: 'bamboo_wind',
    name: 'Gió Qua Rừng Trúc',
    icon: 'Wind',
    category: 'nature',
    type: 'bamboo_wind',
    defaultVolume: 0.4
  },
  {
    id: 'waves',
    name: 'Sóng Biển Bình Minh',
    icon: 'Waves',
    category: 'nature',
    type: 'waves',
    defaultVolume: 0.45
  },
  {
    id: 'birds',
    name: 'Tiếng Chim Sớm Mai',
    icon: 'Bird',
    category: 'nature',
    type: 'birds' as any,
    defaultVolume: 0.3
  },
  {
    id: 'temple_bell',
    name: 'Đại Hồng Chung 108Hz',
    icon: 'BellRing',
    category: 'meditation',
    type: 'singing_bowl' as any,
    defaultVolume: 0.55
  },
  {
    id: 'wind_chime',
    name: 'Chuông Gió Thạch Anh',
    icon: 'Sparkles',
    category: 'meditation',
    type: 'singing_bowl' as any,
    defaultVolume: 0.35
  }
];

export const SOUND_MIX_PRESETS: SoundMixPreset[] = [
  {
    id: 'preset-sleep',
    name: 'Ngủ Ngon Giác Thanh',
    description: 'Mưa nhẹ kết hợp với sóng Theta 432Hz êm dịu dẫn lối giấc ngủ sâu.',
    volumes: { rain: 0.6, theta_drone: 0.4, stream: 0, singing_bowl: 0, bamboo_wind: 0, waves: 0, birds: 0 }
  },
  {
    id: 'preset-deep-meditation',
    name: 'Thiền Định Tĩnh Lặng',
    description: 'Chuông xoay ngân nga cùng tiếng suối nguồn thanh lọc thân tâm.',
    volumes: { singing_bowl: 0.7, stream: 0.4, rain: 0, theta_drone: 0.2, bamboo_wind: 0.2, waves: 0, birds: 0 }
  },
  {
    id: 'preset-zen-forest',
    name: 'Rừng Trúc An Nhiên',
    description: 'Suối mát róc rách, gió qua ngọn trúc và tiếng chim buổi sớm bình yên.',
    volumes: { stream: 0.5, bamboo_wind: 0.45, birds: 0.3, rain: 0, singing_bowl: 0.25, theta_drone: 0 }
  },
  {
    id: 'preset-ocean-peace',
    name: 'Sóng Biển Thiền Đường',
    description: 'Sóng vỗ êm đềm hòa quyện chuông gió trong veo đón bình minh.',
    volumes: { waves: 0.6, wind_chime: 0.4, singing_bowl: 0.3, theta_drone: 0.2, rain: 0 }
  },
  {
    id: 'preset-ancient-temple',
    name: 'Chùa Cổ Khói Sương',
    description: 'Đại hồng chung thong dong vọng xa, tiếng gió nhẹ xao xuyến cành tùng.',
    volumes: { temple_bell: 0.6, bamboo_wind: 0.4, singing_bowl: 0.35, stream: 0.2, rain: 0 }
  }
];

export const MICRO_PRACTICES = [
  {
    id: 'micro-meeting',
    title: 'Hạ Nhiệt Trước Cuộc Họp',
    subtitle: '60 giây hạ nhịp tim, xoa dịu hồi hộp và thả lỏng cơ vai',
    durationSeconds: 60,
    context: 'pre_meeting',
    guidanceText: 'Hãy buông hai tay xuống đùi, thả lỏng quai hàm. Thở vào sâu trong 4 nhịp, giữ 2 nhịp, thở ra nhẹ nhàng trong 6 nhịp. Mọi sự chuẩn bị đã xong, bạn hoàn toàn làm chủ chính mình.',
    instructionSteps: [
      'Ngồi thẳng lưng, hai vai xuôi thả lỏng tự nhiên.',
      'Hít vào 4 giây: Cảm nhận lồng ngực mở rộng.',
      'Thở ra dài 6 giây: Xua tan cảm giác hồi hộp.',
      'Mỉm cười nhẹ với chính mình trước khi bước vào phòng họp.'
    ],
    audioTone: 'singing_bowl' as const
  },
  {
    id: 'micro-conflict',
    title: 'Dừng Lại Khi Có Bực Bội',
    subtitle: '90 giây ôm ấp cơn giận sau khi nhận email hoặc xung đột',
    durationSeconds: 90,
    context: 'after_conflict',
    guidanceText: 'Đừng vội trả lời tin nhắn hay phản ứng lúc này. Khi giận dữ, lời nói ra thường mang theo độc tố. Hãy dừng lại, thở sâu và nhận diện: "Tôi đang chăm sóc cơn giận của tôi".',
    instructionSteps: [
      'Rời tay khỏi bàn phím hoặc đặt điện thoại xuống.',
      'Quan sát cảm giác nóng rát ở lồng ngực hoặc dạ dày.',
      'Thở vào: "Tôi biết cơn giận đang có mặt".',
      'Thở ra: "Tôi mỉm cười ôm ấp cơn giận bằng tâm từ bi".'
    ],
    audioTone: 'stream' as const
  },
  {
    id: 'micro-screen',
    title: 'Thư Giãn Mắt & Cổ Gáy',
    subtitle: '60 giây quy tắc 20-20-20 phục hồi sau khi nhìn màn hình liên tục',
    durationSeconds: 60,
    context: 'screen_fatigue',
    guidanceText: 'Đôi mắt của bạn đã làm việc chăm chỉ suốt nhiều giờ. Hãy nhắm mắt lại hoặc phóng tầm mắt ra xa ngoài cửa sổ, xoa hai lòng bàn tay ấm áp rồi áp nhẹ lên hốc mắt.',
    instructionSteps: [
      'Xoa hai lòng bàn tay vào nhau thật nhanh cho ấm lên.',
      'Áp nhẹ lòng bàn tay lên mắt, cảm nhận hơi ấm lan tỏa.',
      'Hít sâu vào, thở ra chầm chậm 3 lần.',
      'Mở mắt ra nhìn vào khoảng xanh xa xăm để mắt điều tiết.'
    ],
    audioTone: 'bamboo_wind' as const
  },
  {
    id: 'micro-lunch',
    title: 'Quét Thân Yên Bình Giờ Nghỉ Trưa',
    subtitle: '2 phút tái tạo năng lượng nguyên khí giữa ngày làm việc',
    durationSeconds: 120,
    context: 'lunch_break',
    guidanceText: 'Gác lại mọi deadline và bảng tính. Đây là 2 phút quý giá dành riêng cho việc nuôi dưỡng thân thể bạn. Từ đỉnh đầu xuống gót chân, hãy gửi lời cảm ơn đến cơ thể kiên cường này.',
    instructionSteps: [
      'Tựa lưng thoải mái vào ghế, nhắm hờ đôi mắt.',
      'Thở vào gửi năng lượng thư giãn lên đỉnh đầu và vầng trán.',
      'Thở ra buông lỏng hai cánh tay, cột sống và vùng bụng.',
      'Cảm nhận sự sống đang âm thầm vận hành mầu nhiệm.'
    ],
    audioTone: 'singing_bowl' as const
  },
  {
    id: 'micro-workend',
    title: 'Khép Lại Ngày Làm Việc',
    subtitle: '90 giây rũ bỏ lo toan công việc trước khi trở về với gia đình',
    durationSeconds: 90,
    context: 'work_end',
    guidanceText: 'Ngày làm việc hôm nay đã hoàn tất. Những gì làm được đã làm tốt nhất có thể, những gì chưa xong hãy để ngày mai. Đừng mang gánh nặng công sở về mái ấm thân yêu.',
    instructionSteps: [
      'Đóng các tab công việc và dọn gọn bàn làm việc.',
      'Hít một hơi thật sâu, thở ra thở phào nhẹ nhõm.',
      'Tâm sự thầm: "Hôm nay tôi đã nỗ lực hết mình".',
      'Mang trái tim tươi vui và bình an trở về nhà.'
    ],
    audioTone: 'temple_bell' as const
  },
  {
    id: 'micro-smile',
    title: 'Dừng Lại & Mỉm Cười Hiện Tại',
    subtitle: '30 giây chạm vào sự sống đang có mặt nhiệm mầu',
    durationSeconds: 30,
    context: 'pause_smile',
    guidanceText: '"Thở vào tâm tĩnh lặng, thở ra miệng mỉm cười. An trú trong hiện tại, giờ phút đẹp tuyệt vời." Chỉ cần 30 giây để nhận ra bạn vẫn đang sống và có thể an vui.',
    instructionSteps: [
      'Dừng mọi suy nghĩ mông lung về quá khứ hoặc tương lai.',
      'Mỉm hàm tiếu - nở một nụ cười nhẹ trên môi.',
      'Cảm nhận luồng không khí mát lành đi qua hai cánh mũi.',
      'Hạnh phúc giản đơn là được thở trong giây phút này.'
    ],
    audioTone: 'singing_bowl' as const
  }
];

export const MINDFULNESS_SPACES: MindfulnessSpace[] = [
  {
    id: 'space-lotus',
    name: 'Dawn Lotus Sanctuary',
    vietnameseName: 'Hồ Sen Bình Minh',
    description: 'Không gian tĩnh lặng ngắm sen hé nở trong làn sương sớm ấm áp, hương sen thanh khiết vương nhẹ trong gió.',
    image: LOTUS_DAWN,
    ambientTone: 'stream'
  },
  {
    id: 'space-temple',
    name: 'Bamboo Forest Monastery',
    vietnameseName: 'Chùa Trúc Lâm Sương Khói',
    description: 'Ngôi chùa cổ kính ẩn mình giữa bạt ngàn tre xanh, tiếng chuông đồng thong dong vọng xa giữa mây ngàn.',
    image: BAMBOO_TEMPLE,
    ambientTone: 'singing_bowl'
  },
  {
    id: 'space-moonlit',
    name: 'Moonlit Lake Pavilion',
    vietnameseName: 'Thiền Đường Trăng Thanh',
    description: 'Bến nước soi bóng trăng tròn sáng tỏ, ngọn nến lung linh sưởi ấm tâm hồn sau những ngày dài mỏi mệt.',
    image: MOONLIT_SANCTUARY,
    ambientTone: 'rain'
  },
  {
    id: 'space-stream',
    name: 'Zen Rock & Stream Garden',
    vietnameseName: 'Vườn Sỏi Suối Nước',
    description: 'Tiếng suối nguồn róc rách qua ống trúc mộc mạc, gột rửa những trĩu nặng của cuộc sống hối hả thường nhật.',
    image: ZEN_STREAM,
    ambientTone: 'stream'
  }
];

export const MINDFULNESS_JOURNEYS: MindfulnessJourney[] = [
  {
    id: 'journey-7days',
    title: '7 Ngày Bắt Đầu Thiền Chánh Niệm',
    subtitle: 'Nền tảng vững chắc cho người mới bắt đầu',
    durationDays: 7,
    description: 'Mỗi ngày 5-10 phút để hình thành thói quen ngồi yên, quan sát hơi thở và tái tạo năng lượng bình an.',
    image: LOTUS_DAWN,
    steps: [
      { day: 1, title: 'Ngày 1: Chạm vào Hơi Thở', description: 'Học cách nhận biết luồng khí ra vào tự nhiên.', meditationId: 'med-1', reflectionPrompt: 'Cảm giác của bạn khi lần đầu dừng lại lắng nghe hơi thở là gì?' },
      { day: 2, title: 'Ngày 2: Thả Lỏng Cơ Thể', description: 'Buông xả sự căng cứng trên từng nhóm cơ.', meditationId: 'med-4', reflectionPrompt: 'Nơi nào trên cơ thể bạn thường lưu giữ sự căng thẳng nhiều nhất?' },
      { day: 3, title: 'Ngày 3: Nhận Biết Cảm Xúc', description: 'Mỉm cười với mọi cảm xúc mà không đánh giá.', meditationId: 'med-5', reflectionPrompt: 'Hôm nay có cảm xúc nào ghé thăm bạn thường xuyên nhất?' },
      { day: 4, title: 'Ngày 4: Nuôi Dưỡng Biết Ơn', description: 'Trân quý những điều bình dị xung quanh.', meditationId: 'med-6', reflectionPrompt: 'Kể tên 3 điều nhỏ làm bạn mỉm cười trong ngày.' },
      { day: 5, title: 'Ngày 5: Buông Xả Lo Âu', description: 'Để những suy nghĩ qua đi như áng mây trôi.', meditationId: 'med-8', reflectionPrompt: 'Điều gì bạn sẵn sàng buông bỏ để nhẹ lòng hơn?' },
      { day: 6, title: 'Ngày 6: Mở Rộng Yêu Thương', description: 'Gửi lời nguyện cầu an lành đến mọi người.', meditationId: 'med-7', reflectionPrompt: 'Bạn muốn gửi sự bình an đến ai đầu tiên?' },
      { day: 7, title: 'Ngày 7: Sống Trong Tỉnh Thức', description: 'Mang chánh niệm vào từng hành động thường ngày.', meditationId: 'med-2', reflectionPrompt: 'Hành trình 7 ngày đã thay đổi nhịp sống của bạn như thế nào?' }
    ]
  },
  {
    id: 'journey-21days',
    title: '21 Ngày Nuôi Dưỡng Bình An Nội Tại',
    subtitle: 'Chuyển hóa cảm xúc và làm chủ tâm trí',
    durationDays: 21,
    description: 'Chương trình chuyên sâu giúp xây dựng nội lực tinh thần vững chãi trước những biến chuyển của cuộc đời.',
    image: BAMBOO_TEMPLE,
    steps: [
      { day: 1, title: 'Thiết Lập Không Gian An Lạc', description: 'Tạo dựng một góc nhỏ bình yên trong tâm hồn.', meditationId: 'med-1', reflectionPrompt: 'Không gian an yên của bạn trông như thế nào?' },
      { day: 2, title: 'Lắng Nghe Cơ Thể Lên Tiếng', description: 'Nhận diện tín hiệu mỏi mệt để kịp thời chăm sóc.', meditationId: 'med-4', reflectionPrompt: 'Cơ thể bạn đang nhắn nhủ điều gì hôm nay?' },
      { day: 3, title: 'Hơi Thở Là Neo Bình Yên', description: 'Mỗi khi bất an, chỉ cần quay về hơi thở.', meditationId: 'med-5', reflectionPrompt: 'Khoảnh khắc nào bạn cảm thấy hơi thở cứu bạn khỏi giận dữ?' }
    ]
  }
];

export const DAILY_QUOTES = [
  {
    text: "Hạnh phúc không nằm ở chỗ có tất cả những gì ta muốn, mà ở chỗ biết trân trọng những gì ta đang có.",
    author: "Lời Phật dạy"
  },
  {
    text: "Tâm bình thế giới bình. Tâm an vạn sự an.",
    author: "Thiền ngữ"
  },
  {
    text: "Hãy an trú trong hiện tại. Quá khứ đã qua, tương lai thì chưa đến, chỉ có giây phút này là có thật.",
    author: "Kinh Nhất Dạ Hiền Giả"
  },
  {
    text: "Hơi thở vào là sự sống. Hơi thở ra là sự buông bỏ bình an.",
    author: "An Tâm"
  }
];
