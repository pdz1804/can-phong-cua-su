/**
 * The cork board: one note per real day, in order. Every detail comes from Phú's notes.
 * Tone: sến, playful, anh–em. Hard days are left out on purpose.
 */
export interface Memory {
  id: string;
  date: string;
  title: string;
  body: string;
}

export const TIMELINE: Memory[] = [
  {
    id: 't0420',
    date: '20.04',
    title: 'Ngày vũ trụ gõ cửa',
    body: 'Hôm đó mẹ em đăng lại một bài báo, và anh lướt qua đúng lúc. Một tấm hình thôi mà anh ngồi ngắm lâu ơi là lâu, tim đập lệch nhịp như vừa uống nhầm ba ly cà phê. Lúc ấy anh đâu biết cô bé trong bài báo sau này sẽ là người anh nhắn chào buổi sáng mỗi ngày. Cảm ơn mẹ em đã bấm chia sẻ, cảm ơn số phận đã cho anh lướt trúng. Anh gọi đó là ngày vũ trụ gõ cửa.',
  },
  {
    id: 't0613',
    date: '13.06',
    title: 'Bó hoa đầu tiên',
    body: 'Anh phóng Exciter qua nhà em, một tay giữ bó hoa, trong túi là lá thư tay viết đi viết lại mấy lần, kèm một bé Hello Kitty mặc đầm hồng. Mừng em khép lại mười hai năm đèn sách. Rồi em bước ra trong chiếc đầm xanh, và anh quên sạch câu đã tập nói suốt buổi sáng. Hôm đó anh biết chắc một điều: anh tiêu rồi, tiêu một cách rất hạnh phúc.',
  },
  {
    id: 't0619',
    date: '19.06',
    title: 'Chính thức tìm hiểu',
    body: 'Từ hôm nay có một người được quyền nhắn em chúc ngủ ngon, được hỏi em ăn gì chưa, được lo em về nhà an toàn chưa. Anh nhận chức vụ này với tất cả sự nghiêm túc của một người đang cười toe toét. Không lương, không thưởng, chỉ cần em trả lời tin nhắn là anh vui cả ngày.',
  },
  {
    id: 't0623',
    date: '23.06',
    title: 'Bánh bơ và xe vỏ sò',
    body: 'Em tặng anh hộp bánh bơ với chiếc xe vỏ sò bé xíu xinh xỉu. Anh gửi lại em bánh Givral quà Vũng Tàu và một bó hoa hồng. Hai đứa trao quà mà như trao bảo vật quốc gia. Anh thấy mình lời to, vì ngoài bánh với xe vỏ sò, anh còn được thêm nụ cười của em kèm theo, miễn phí.',
  },
  {
    id: 't0626',
    date: '26.06',
    title: 'Sinh nhật ông bà ngoại',
    body: 'Hôm nay là sinh nhật ông bà ngoại em. Anh không có mặt, nhưng anh nghe em kể chuyện nhà, chuyện hồi nhỏ em là bé đầu tiên trong nhà nên ai cũng cưng, gọi dì gọi chú là mẹ là ba luôn. Anh thầm cảm ơn ông bà, vì nhờ ông bà mới có mẹ, nhờ mẹ mới có em.',
  },
  {
    id: 't0628',
    date: '28.06',
    title: 'Buổi hẹn đầu tiên',
    body: 'Cà phê mèo ở chung cư Tôn Thất Đạm, mấy bé mèo nhìn em còn mê hơn nhìn anh, anh ghen nhẹ. Rồi Fahasa Tân Định, rồi Dalat Hasfarm ngắm hoa, rồi chốt hạ bằng dĩa cơm tấm sà bì chưởng gần LHP. Một ngày mà tới giờ anh vẫn thuộc lòng từng chặng như thuộc bài thi, đọc ngược đọc xuôi đều được.',
  },
  {
    id: 't0704',
    date: '04.07',
    title: 'Sở thú và cuộn len',
    body: 'Sở thú, Highlands, bún đậu mắm tôm Hoàng Hoa Thám, rồi lượn đi mua len cho em, ghé Dalat Hasfarm thêm một lần nữa vì một lần là chưa đủ. Cuối ngày em dúi vào tay anh một chậu xương rồng nhỏ xíu. Anh ôm nó về như ôm cúp vô địch, cả đường về cứ cười một mình như người mới trúng số.',
  },
  {
    id: 't0707',
    date: '07.07',
    title: 'Ngày em bắt đầu thương anh',
    body: 'Trời mưa tầm tã, hai đứa ngồi ăn bánh tráng với gà rán, rồi anh che mưa đưa em về. Anh cứ tưởng chỉ là một buổi tối ướt sũng bình thường. Mãi sau này em mới thì thầm: hôm đó là ngày em bắt đầu thương anh. Từ đó anh chính thức kết nghĩa với những cơn mưa. Mưa ơi, cảm ơn mày nhiều nha.',
  },
  {
    id: 't0710',
    date: '10.07',
    title: 'Bốn ngày em ở Đà Lạt',
    body: 'Em đi Đà Lạt với bạn mấy hôm. Sài Gòn bỗng nóng hơn, đường bỗng dài hơn, điện thoại thì anh mở lên tắt xuống cả trăm lần chờ hình em gửi. Em về, mang theo quà cho anh, còn anh thì mang theo một trái tim nhớ em muốn xỉu.',
  },
  {
    id: 't0718',
    date: '18.07',
    title: 'Bé Stitch về nhà',
    body: 'Một chút quà nhỏ và bé Stitch xanh lè đáng yêu. Từ hôm đó em có thêm một vệ sĩ canh giấc mỗi tối. Stitch ơi, nhiệm vụ của mày là ôm công chúa của anh giùm anh, khi nào anh chưa ôm được thì mày ôm trước nha.',
  },
  {
    id: 't0719',
    date: '19.07',
    title: 'Photobooth lần đầu',
    body: 'Em mang từ Đà Lạt về cho anh một chiếc móc khóa và một cái phin cà phê. Rồi hai đứa lần đầu chui vào photobooth, anh cười cứng đơ như tượng sáp, em thì xinh như mọi khi. Sau đó dạo phố, cơm tấm Lý Thường Kiệt, sinh tố 606, và một anh chàng về nhà ngồi ngắm hình tới khuya không chịu ngủ.',
  },
  {
    id: 't0724',
    date: '24.07',
    title: 'Hoa cho mẹ anh',
    body: 'Em bất ngờ tặng hoa mừng sinh nhật mẹ anh, ngay gần nhà anh. Mẹ anh vui lắm. Còn anh thì đứng đó nghĩ: cô gái này không chỉ thương anh, mà còn thương luôn cả những người anh thương. Hôm đó anh biết mình không thể để vuột mất em được.',
  },
  {
    id: 't0725',
    date: '25.07',
    title: 'Ngày anh tỏ tình',
    body: 'Thiso Mall Sala, con gấu anh săn sale mãi mới được, phim Conan ở Galaxy, gà rán với kem. Anh dắt em đi dạo bờ hồ để câu giờ chờ hoa tới, tim đập như trống hội. Chụp hình trên đóa hoa khổng lồ, chụp bờ sông, rồi hoa Dalat Hasfarm tới. Anh nói thương em, và em gật đầu cho anh làm bạn trai đồng hành cùng em. Rồi trời mưa, hai đứa trú ở Trung Nguyên, và em là người chủ động dang hai tay ôm anh trước. Cái ôm đầu tiên, mở ra cả một chuỗi ngày gặp nhau là ôm. Fun fact: hôm đó em mặc đúng chiếc đầm xanh của ngày đầu tiên.',
  },
  {
    id: 't0731',
    date: '31.07',
    title: 'Áo mới của em',
    body: 'Em khoe anh chiếc áo mới, siêu đẹp. Anh nhìn hình mà khen không ngớt, nhưng nói thật nha, áo đẹp là nhờ người mặc. Em mặc gì cũng đẹp, mặc áo mưa cũng đẹp, mặc áo khoác của anh còn đẹp hơn.',
  },
  {
    id: 't0801',
    date: '01.08',
    title: 'Bạn gái của anh',
    body: 'Hoa tiệm Salem cho ngày quốc tế bạn gái. Hôm đó em gật đầu cho anh đăng hình, và anh đi khoe với cả thế giới: đây là bạn gái anh nha mọi người, đáng yêu nhất hệ mặt trời. Anh đã chờ ngày được nói câu đó lâu lắm rồi.',
  },
  {
    id: 't0802',
    date: '02.08',
    title: 'Pose cắn anh',
    body: 'Chè Ý Phương em thích mê, rồi dạo phố, rồi photobooth lần hai. Lần đầu em quàng tay anh, lần đầu em nháy mắt, và lần đầu em cắn anh trong khung hình. Ngồi quán cacao dừa dì Lan ngắm hình mà hai đứa cười muốn rớt ghế. Vết cắn đó anh xin giữ làm kỷ niệm.',
  },
  {
    id: 't0805',
    date: '05.08',
    title: 'Ổi chùa còn cuống',
    body: 'Nhà em cho anh ổi chùa còn nguyên cuống, em dặn kỹ: chỉ phủi kiến thôi, không được giết bé kiến nào hết. Dì em tặng thêm hũ bánh tráng siêu ngon. Anh tặng lại em gà rán thật để ăn và gà rán gấu bông để ôm. Và hôm đó, lần đầu anh được gặp ba em, hồi hộp mà vui ghê.',
  },
  {
    id: 't0808',
    date: '08.08',
    title: 'Hồ con rùa',
    body: 'Xem Thư tình gửi ngoại ở Galaxy Nguyễn Du, rồi ghé GS25 gần hồ con rùa. Anh chụp chưa ưng, em liền mang máy ảnh cho anh chụp lại. Và lần đầu tiên chụp hình xong anh được thơm em một cái. Rồi tiệm GS25 coffee có góc siêu đẹp, đi dạo hồ con rùa, ăn chè Kai Kai gần bờ kè Nhiêu Lộc. Một buổi tối anh muốn bấm nút lặp lại.',
  },
  {
    id: 't0811',
    date: '11.08',
    title: '19 giờ 30',
    body: 'Anh về nhà lúc 7 giờ, 7 giờ 15 chạy đi mua hoa, vừa chọn hoa vừa nhắn em mà tay run cầm cập. 7 giờ 30, hoa đang gói thì tin báo em đậu Sư phạm Tiểu học tới. 8 giờ 15 anh đứng trước mặt em với bó ly xinh nhất từ trước tới giờ và một lá thư tay. Cô giáo tương lai của anh giỏi quá trời, mấy bạn nhỏ sau này có phước lắm luôn.',
  },
  {
    id: 't0816',
    date: '16.08',
    title: 'Lamour Saigon',
    body: 'Hai đứa đi làm hoa ở Lamour Saigon đường Lê Văn Sỹ. Em chỉ anh cắt giấy, cắt giấy kiếng, cắm hoa, còn cầm máy cơ chỉ anh cách chụp. Đi mua nước Circle K, chạy xe dạo phố, mắc mưa nhỏ, ghé photobooth lần ba chụp cùng bó hoa tự tay làm, và hai đứa cùng thích nhất một tấm. Rồi em chủ động cho anh thơm má lần đầu. Tối đó tìm đường đi ăn Serotonin, ngon mà hơi nhiều. Anh no, mà no nhất là no hạnh phúc.',
  },
  {
    id: 't0819',
    date: '19.08',
    title: 'Đùi gà gấu bông',
    body: 'Hai đứa đi Lotteria săn đùi gà gấu bông, chị nhân viên khen em đáng yêu, anh đứng bên cạnh gật đầu lia lịa. Anh còn tập buộc tóc cho em mà chưa được. Ghi chú cho bản thân: học lại cách buộc tóc và cách tô son cho em, môn này anh quyết tâm qua.',
  },
  {
    id: 't0822',
    date: '22.08',
    title: 'Đi chơi sau buổi làm bù',
    body: 'Anh rước em sau buổi làm bù lễ thứ Bảy. Sala, GS25, đi bộ dạo mát, rồi ngồi Koi gần Vạn Hạnh Mall. Hai đứa nói chuyện quên cả giờ. Bài học rút ra: lần sau phải đưa em về sớm hơn để ba mẹ yên tâm. Anh nhớ rồi nha.',
  },
  {
    id: 't0823',
    date: '23.08',
    title: 'Bong bóng trước sảnh',
    body: "Em đi học ở Nhà Văn hóa Thanh niên, anh ngồi Highlands gần sở thú đợi. Tối hai đứa ăn McDonald's, em mua cho mẹ cái đồ gãi lưng, rồi hai đứa mua đồ thổi bong bóng nghịch ngay trước sảnh. Mấy đứa nhỏ chạy theo đập bong bóng, cười giòn tan. Về tới nhà còn thổi tiếp trước cửa. Nice day, đúng nghĩa đen.",
  },
  {
    id: 't0825',
    date: '25.08',
    title: 'Tròn một tháng',
    body: 'Anh đón em ở Vạn Hạnh Mall với bó calla lily. Ghé cacao dừa dì Lan, mở quà bí mật: em tặng anh áo thun có cổ thêu con ngựa siêu xinh, đựng trong hộp quà xanh có nơ. Em còn tự tay làm cho anh một hộp gương trái tim màu xanh biển kim tuyến, có hoa có vỏ ốc, bên trong là hình hai đứa. Thêm một lá thư nói em yêu anh, và một nụ hôn. Anh đọc thư mà trái tim tan chảy như kem gặp nắng.',
  },
  {
    id: 't0829',
    date: '29.08',
    title: 'Bánh mì cho mọi người',
    body: 'Em diện váy trắng mới có dây nịt bụng, xinh như thiên thần lạc xuống Sài Gòn. Bún đậu, mắc mưa trú ở chỗ dạy lái xe, rồi Dream Bread, góc nào cũng đẹp, anh chụp em xinh, em chụp anh cute. Đi bộ quanh Tao Đàn, qua hồ con rùa, uống nước ăn xúc xích phô mai ở GS25. Tối đó hai đứa mua mười một ổ bánh mì, mười hai chai nước, đi phát cho mọi người xung quanh. Anh thương cái tâm của em nhiều lắm.',
  },
  {
    id: 't0905',
    date: '05.09',
    title: 'Phố lồng đèn',
    body: 'Em về quê chơi lễ xong, hai đứa hẹn được nhau liền. Bún đậu quen thuộc, photobooth sáu khung lần đầu gần Vạn Hạnh Mall, dạo qua phố lồng đèn còn vắng, rồi công viên Lý Thái Tự. Em thấy một bé gái mặc váy xanh giống em, em cho bé kẹo, bé ngại không dám lấy, còn chạy đi xin mẹ. Hai đứa chụp hình với hai chú mèo con. Tối đó hai đứa nói chuyện thật lâu, hiểu nhau thêm một chút, thương nhau thêm một chút.',
  },
  {
    id: 't0906',
    date: '06.09',
    title: 'Hôn gió',
    body: 'Anh đưa em đi học, rồi ra Highlands làm một việc bí mật. Rước em xong, trùng hợp ghê: anh mua nước cho em, em cũng mua Gongcha cho anh. Chụp hình với gương lồi, ăn KFC, dạo phố đi bộ, chụp photobooth, nhà sách Phương Nam chơi trò đoán đồ ăn, hồ sen ngắm tòa nhà lên đèn. Em thơm má, thơm trán anh, rồi đặc biệt nhất: em hôn gió anh. Về tới nhà còn được gặp cả ba lẫn mẹ, được ba dặn đi đường cẩn thận. Anh vui tới mức muốn hét lên.',
  },
  {
    id: 't0912',
    date: '12.09',
    title: 'Yên cafe',
    body: 'Hỷ Ký mì gia trên Lê Văn Sỹ ngon xỉu, hai đứa tưởng ít nên gọi nào mì, há cảo, hoành thánh, sườn, phèo. Rồi Yên cafe, quán quen em hay dắt bạn tới, cả buổi chỉ có hai đứa. Em chỉ anh cách em trang điểm, hai đứa chơi đoán từ, rồi chụp đủ kiểu: áp mặt cửa sổ, chụp gương, quay trend. Mua quà sinh nhật cho Mộc ở nhà sách Tân Định, mua hồng Ecuador ở Dalat Hasfarm. Anh còn được gặp ba, mẹ và Mộc.',
  },
  {
    id: 't0913',
    date: '13.09',
    title: 'Ôm nhau dưới mưa',
    body: 'Áo mưa đỏ, áo mưa xanh, áo của em hơi dài kéo lê. Mưa lâm râm lành lạnh, em lại dang tay ôm anh, chắc cũng vài chục giây, mà anh ước dài thêm vài chục năm. Anh được hôn hai má và trán em, lãng mạn hơn cả phim. Rồi Nowzone ăn Dookki, em thích gà sốt chua, mì tương đen, chả cá tokbokki. Hai đứa đi phát bánh mì, em nảy ra ý mua thêm cho các cô. Cuối ngày đi xem cây, em đùa: giờ em mua anh cái cây, mốt anh mua em hai căn nhà nha. Anh ghi sổ rồi đó.',
  },
  {
    id: 't0919',
    date: '19.09',
    title: 'Sinh nhật Mộc',
    body: "Takashimaya ăn McDonald's, anh được ăn Big Mac, rồi photobooth gần Nguyễn Huệ, được ôm em, nắm tay em. Rồi ba mẹ rủ anh đi cùng mừng sinh nhật Mộc ở Haidilao. Lần đầu anh đi cùng cả nhà em, run như cầy sấy. Xem múa mặt nạ, múa mì, mẹ bảo em là phiên bản mini của mẹ, còn khen anh giống chú này chú kia. Chụp photobooth hai lần trong ngày, có cả bể cá. Tối em đăng story gia đình rồi tag anh. Hôm đó anh hạnh phúc muốn bay lên trời.",
  },
  {
    id: 't0920',
    date: '20.09',
    title: 'Phấn cho cô giáo',
    body: 'Em tặng anh cặp Bubu Dudu. Anh mua cho em với bé em hai lồng đèn nho nhỏ. Hai đứa ăn tokbokki khổng lồ to như ngọc rồng, rồi cơm tấm sà bì chưởng, ngồi nhớ lại lần đầu đi chơi. Rồi đi nhà sách mua đồ cho ngày đầu em đi dạy: phấn, cây cầm phấn, khăn, hộp đựng. Em than lạnh, anh khoác áo khoác cho em. A queen in a long jacket. Hôm đó em mặc đúng bộ đồ của ngày đầu tiên hai đứa đi ăn cơm tấm.',
  },
  {
    id: 't0922',
    date: '22.09',
    title: 'Hai bé gấu nhỏ',
    body: 'Anh mới nhận lương, muốn rủ em đi ăn để tặng em hai bé gấu bông nhỏ. Trời mưa quá anh đi xe tới, em ngồi Circle K gần trường đợi anh gần hai tiếng. Hai đứa đi ăn bún đậu, chụp hình gửi mẹ, rồi ngồi xe về, được ôm em, được thơm má em. Hai tiếng em chờ, anh nhớ hoài.',
  },
  {
    id: 't0926',
    date: '26.09',
    title: 'Ba bịch cá đầu tiên',
    body: 'Mùa tốt nghiệp UEH bán nhiều hoa, anh mua tặng em một bó cho vui. Cơm tấm sà bì chưởng, chụp hình Bubu Dudu, mà Dudu nấu ăn té gãy muỗng phải đi mua lại. Rồi hai đứa đi mua cá cho em: bảy màu và ốc. Ngồi Highlands ngắm cá, ngắm em, tâm sự đủ thứ.',
  },
  {
    id: 't0927',
    date: '27.09',
    title: 'Bó hoa đầu đời',
    body: 'Em mời anh Gongcha khoai môn trân châu đen, tặng bánh truffle dặn quay review. Trên đường đi, em thấy bó hoa tốt nghiệp màu xanh và mua tặng anh, bó hoa đầu tiên trong đời anh đó em biết không. Bó hoa rơi mất, em dắt anh qua tiệm Diễm Chi mua lại bó cẩm tú cầu xanh. Rồi tiệm cá Nguyễn Thông lựa bảy màu, molly, ốc. Đi dưới mưa lâm râm, em ôm anh, anh khoác áo cho em. Một ngày anh được làm hoàng tử.',
  },
  {
    id: 't1003',
    date: '03.10',
    title: 'Quốc tế bạn trai',
    body: 'Em thi MC, mặc đầm xanh đậm, nhìn vừa giống cô giáo vừa giống MC thật, thi giỏi lắm. Ăn ramen gần cầu Ba Son, không ngon lắm mà vui. Rồi bất ngờ: em nhớ hôm nay là quốc tế bạn trai, anh thì quên, quê xỉu. Em tặng bé gấu nâu mặc đồ ngủ ôm gấu nhỏ, một album đựng hình photobooth, và một lá thư tay siêu dài. Hóa ra bài tập về nhà “mang theo hình photobooth” là để làm vậy.',
  },
  {
    id: 't1004',
    date: '04.10',
    title: 'Chứng chỉ MC',
    body: 'Anh đưa em đi lấy chứng chỉ MC. Trời mưa nhẹ, em sốt nhẹ, hai đứa ghé Tân Định mua thuốc với kẹo ngậm, rồi mua hồng Ecuador ngay kế bên. Em mặc đầm trắng siêu đáng yêu. Chụp Photoism, lần đầu suýt hôn nhau trong khung hình. Ăn vặt Xuân Thy bên Thành Thái, hứa sẽ quay lại. Em mau khỏe nha, cô MC của anh.',
  },
];
