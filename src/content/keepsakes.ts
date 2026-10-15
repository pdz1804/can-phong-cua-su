/**
 * Letters for the keepsakes placed around the room. The id is the key the world uses
 * (see src/world/keepsakes.ts); a unit test checks every placed keepsake has a letter.
 */
export interface Letter {
  date: string;
  title: string;
  body: string;
}

export const KEEPSAKES: Record<string, Letter> = {
  lily: {
    date: '11.08',
    title: 'Bó ly xinh nhất',
    body: 'Hoa ly kép, trắng tâm vàng, loài hoa em thương nhất, cùng với hồng và tulip. Tối em đậu Sư phạm, anh ôm bó ly này chạy tới. Mai này em mở tiệm hoa, anh xin đăng ký làm khách quen đầu tiên: ngày nào cũng ghé, mua một bó, rồi tặng lại cho chính bà chủ tiệm. Lỗ vốn cũng được, miễn bà chủ cười.',
  },
  cactus: {
    date: '04.07',
    title: 'Chậu xương rồng',
    body: 'Món quà đầu tiên em tặng anh, sau một ngày đi sở thú, ăn bún đậu, mua len. Anh tưới đúng lịch, mỗi sáng còn chào nó một câu. Nó vẫn xanh như ngày đầu. Xương rồng có gai mà còn được anh thương vậy, huống chi là em, người không có gai mà toàn mật ngọt.',
  },
  bear: {
    date: '25.07',
    title: 'Con gấu săn sale',
    body: 'Anh canh sale ở Sala mãi mới được em gấu này, để kịp tặng em đúng ngày anh nói thương em. Gấu ơi, mày là nhân chứng của ngày quan trọng nhất đời anh: hoa tới, em gật đầu, trời mưa, em dang tay ôm anh. Nhớ giữ bí mật cho anh, mà thôi, kể hết cũng được.',
  },
  phin: {
    date: '19.07',
    title: 'Phin và móc khóa',
    body: 'Quà em mang về từ chuyến Đà Lạt với bạn. Em uống được trà mà không uống được cà phê, vậy mà vẫn đứng lựa cho anh một cái phin thật xinh, thêm một chiếc móc khóa. Mỗi sáng pha cà phê là mỗi sáng anh nhớ em, giọt cà phê nhỏ chậm như cách anh thương em, từ từ mà đậm.',
  },
  tank: {
    date: '27.09',
    title: 'Cá bảy màu, molly và ốc',
    body: 'Hai đứa đi bộ tới lui ở tiệm cá Nguyễn Thông, em lựa từng bé một, mặt nghiêm túc như cô giáo chấm bài. Bảy màu, molly, thêm mấy bé ốc. Cuối ngày em có ba bịch cá, còn anh có thêm một kỷ niệm đáng yêu để kể hoài. Mấy bé cá ơi, bơi cho đẹp để cô chủ vui nha.',
  },
  album: {
    date: '03.10',
    title: 'Album photobooth',
    body: 'Em giao bài tập về nhà: nhớ mang theo hình photobooth. Anh ngơ ngác không hiểu, cho tới khi mở quà ra là một cuốn album để cất hết những tấm hình của hai đứa: lần đầu cứng đơ, lần hai em cắn anh, lần ba cùng bó hoa, sáu khung, bể cá. Từ giờ album này phải dày lên mỗi tuần, anh hứa.',
  },
  heartBox: {
    date: '25.08',
    title: 'Hộp gương trái tim',
    body: 'Màu xanh biển, lấp lánh kim tuyến, có hoa và vỏ ốc, bên trong là hình hai đứa. Em ngồi tự tay làm cho anh mừng tròn một tháng. Anh cất nó ở chỗ đẹp nhất trong phòng, như cất trái tim của em: nâng niu, lau bụi mỗi ngày, ai đụng vào là anh giận.',
  },
  hydrangea: {
    date: '27.09',
    title: 'Cẩm tú cầu xanh',
    body: 'Bó hoa tốt nghiệp màu xanh em mua tặng anh bị rơi mất trên đường, anh tiếc muốn khóc. Vậy mà em dắt anh tới tiệm Diễm Chi ở Hồ Thị Kỷ, mua lại cho anh bó cẩm tú cầu xanh. Một ngày anh được tặng hai bó hoa, ngày đầu tiên trong đời có người tặng hoa cho anh. Người đó là em.',
  },
  kitty: {
    date: '13.06',
    title: 'Bé Hello Kitty',
    body: 'Bé Kitty mặc đầm hồng đi cùng bó hoa đầu tiên và lá thư tay. Em mê Hello Kitty, nên anh chọn bé làm đại sứ thiện chí cho anh trong ngày ra mắt. Bé làm tốt nhiệm vụ lắm, vì sau đó cô chủ của bé đã cho anh một cơ hội.',
  },
  stitch: {
    date: '18.07',
    title: 'Bé Stitch',
    body: 'Stitch canh giấc cho em mỗi tối. Nếu tối nào em ngủ không ngon, cứ ôm Stitch thật chặt, coi như anh đang ở đó. Stitch ơi, mày được ôm em nhiều hơn anh đó, nên làm việc cho đàng hoàng nha.',
  },
  bubu: {
    date: '20.09',
    title: 'Bubu và Dudu',
    body: 'Em tặng anh cặp Bubu Dudu. Hôm sau Dudu nấu ăn bị té gãy muỗng, hai đứa phải lật đật đi mua lại, rồi còn chụp cả series hình cho hai bé. Bubu Dudu là phiên bản bông của hai đứa mình: một đứa lăng xăng, một đứa cưng chiều, ngày nào cũng dính nhau.',
  },
  pajamaBear: {
    date: '03.10',
    title: 'Gấu nâu mặc đồ ngủ',
    body: 'Bé gấu mặc đồ ngủ, ôm thêm một bé gấu nhỏ mặc quần. Em giấu trong cặp làm anh không biết gì hết. Quà ngày quốc tế bạn trai mà anh còn quên mất, em thì nhớ. Anh thua em toàn tập, thua mà vui.',
  },
  chickenPlush: {
    date: '05.08',
    title: 'Gà rán gấu bông',
    body: "Gà rán thật để ăn, gà rán gấu bông để ôm. Em mê gà rán tới mức anh phải tặng cả hai phiên bản. KFC thì gà viên, khoai tây, kem vani, gà truyền thống; McDonald's thì McWings hơn nugget; Lotteria thì vì đùi gà gấu bông. Anh thuộc hết rồi đó.",
  },
  camera: {
    date: '16.08',
    title: 'Máy ảnh cơ',
    body: 'Em cầm máy cơ chỉ anh cách chụp, và anh chụp được tấm ảnh anh ưng nhất cho em. Sau đó còn ngồi GS25 xuất hình từ máy ra coi cả tối. Anh không giỏi chụp hình đâu em, chỉ là người trong ảnh đẹp quá, chụp kiểu gì cũng thành tác phẩm. Góc mặt đẹp nhất của em là bên trái, anh nhớ kỹ.',
  },
  lanterns: {
    date: '20.09',
    title: 'Hai lồng đèn nhỏ',
    body: 'Một cái cho em, một cái cho bé em. Trung thu năm nay có hai chiếc lồng đèn nho nhỏ, và có anh đi cạnh em. Đèn nhỏ thôi, nhưng soi đủ sáng con đường hai đứa đi chung.',
  },
  bubbles: {
    date: '23.08',
    title: 'Đồ thổi bong bóng',
    body: "Hai đứa mua đồ thổi bong bóng, nghịch trước sảnh McDonald's, mấy đứa nhỏ chạy theo đập bong bóng cười giòn tan. Về tới nhà còn ngồi thổi tiếp trước cửa. Cô giáo tương lai mà ham chơi hơn cả học trò. Thử chạm thêm lần nữa đi, bong bóng bay kìa.",
  },
  raincoats: {
    date: '13.09',
    title: 'Áo mưa đỏ, áo mưa xanh',
    body: 'Áo mưa của em hơi dài, kéo lê tới gót. Dưới mưa nhỏ lành lạnh, gió mát, hai đứa ôm nhau vài chục giây, rồi anh được hôn hai má, hôn trán em. Đi tiếp thì mưa to gió lớn, em dặn anh chạy cẩn thận, anh dặn em quay mặt sang phải tránh nước. Chưa có cơn mưa nào lãng mạn bằng.',
  },
  gongcha: {
    date: '27.09',
    title: 'Gongcha khoai môn',
    body: 'Em mời anh Gongcha khoai môn trân châu đen, kèm bánh truffle vị cookies and cream, dặn quay review cho em xem. Anh quay rồi: ngon, hơi ngọt, nhưng không ngọt bằng người mời. Ghi chú: Koi em uống 100 phần trăm đường, Gongcha 70.',
  },
  mic: {
    date: '03.10',
    title: 'Cô MC của anh',
    body: 'Em đi học MC, đi thi MC, mặc đầm xanh đậm, nhìn vừa giống cô giáo vừa giống MC thật. Em thi giỏi lắm, hôm sau còn đi lấy chứng chỉ dù đang sốt nhẹ. Sau này em dẫn chương trình nào, anh xin ngồi hàng ghế đầu, vỗ tay to nhất, hú hét nhiệt tình nhất.',
  },
  roses: {
    date: '04.10',
    title: 'Hồng Ecuador',
    body: 'Hôm em đi lấy chứng chỉ MC, em hơi sốt, hai đứa ghé Tân Định mua thuốc với kẹo ngậm, rồi mua hồng Ecuador ngay kế bên. To xinh như em vậy. Hồng em thích màu hồng hoặc trắng, hồng Ohara thơm và tươi ba ngày, cẩm chướng tươi hai tuần. Anh học thuộc làm bài kiểm tra cũng được.',
  },
  giftBox: {
    date: '25.08',
    title: 'Hộp quà xanh có nơ',
    body: 'Em thích hộp quà màu xanh biển có nơ ruy băng, như hộp quà em đựng áo thun con ngựa tặng anh. Anh ghi nhớ rồi nhé: từ giờ quà nào anh tặng em cũng sẽ có nơ, có màu xanh, và có thêm một lá thư tay.',
  },
  yarn: {
    date: '04.07',
    title: 'Cuộn len',
    body: 'Hôm đi sở thú, hai đứa ghé mua len cho em. Em đan gì thì anh chưa biết, chỉ biết em đã đan anh vào tim em mất rồi, mũi nào cũng chặt, gỡ không ra.',
  },
  chalk: {
    date: '20.09',
    title: 'Phấn cho ngày đầu đi dạy',
    body: 'Hai đứa lục tung nhà sách tìm đồ cho ngày đầu em đi dạy: phấn, cây cầm phấn, khăn, hộp đựng. Lúc đầu chỉ tìm được phấn với cây cầm phấn, trên đường về mới mua đủ khăn và hộp. Perfect. Cô giáo Su ơi, các bạn nhỏ ở lớp em may mắn lắm đó.',
  },
  jacket: {
    date: '20.09',
    title: 'Áo khoác của anh',
    body: 'Em than lạnh, anh khoác áo cho em. Em mặc vào xinh xỉu, như một nữ hoàng trong chiếc áo khoác dài. A queen in a long jacket. Từ đó áo khoác của anh có thêm một chức năng mới: giữ ấm cho em mỗi khi trời mưa.',
  },
  shellCar: {
    date: '23.06',
    title: 'Xe vỏ sò',
    body: 'Chiếc xe vỏ sò bé xíu em tặng anh cùng hộp bánh bơ. Nó chạy bằng gì anh không biết, chỉ biết nó chở anh tới một chặng đường mới, có em ngồi sau, có mưa, có hoa.',
  },
  guava: {
    date: '05.08',
    title: 'Ổi chùa còn cuống',
    body: 'Ổi nhà em cho, còn nguyên cuống. Em dặn kỹ lắm: phủi kiến thôi, không được giết bé nào. Em hiền tới mức thương cả mấy bé kiến. Anh hứa làm theo, và anh nghĩ: người thương cả con kiến thì chắc chắn sẽ thương anh rất nhiều.',
  },
  banhTrang: {
    date: '05.08',
    title: 'Hũ bánh tráng của dì',
    body: 'Dì em tặng anh hũ bánh tráng siêu ngon. Bánh tráng là món hai đứa ăn trong cơn mưa ngày 07.07, ngày em bắt đầu thương anh. Nên mỗi lần ăn bánh tráng, anh đều thấy ngọt hơn bình thường một chút.',
  },
  radio: {
    date: 'Nhạc của em',
    title: 'Dù cho tận thế',
    body: 'Bài hát em thích là Dù cho tận thế, và em thích J97. Ba em thì hay nghe Hotel California, One Way Ticket trên xe, ở nhà mở cải lương loa lớn, nghe Paris By Night. Anh muốn sau này căn phòng nào có em cũng có nhạc. Dù cho tận thế, anh vẫn ở đây.',
  },
  perfume: {
    date: 'Mùi của em',
    title: 'Adopt Blanc',
    body: 'Nước hoa em thích là Adopt mùi Blanc, ở Việt Nam hết hàng rồi, còn có Unique Bạch Nguyệt Quang. Anh không cần ngửi chai nước hoa cũng nhớ, vì mỗi lần ôm em, mùi đó ở lại trên áo anh cả ngày.',
  },
  controller: {
    date: 'Game của em',
    title: 'FIFA, PUBG, Liên Quân',
    body: 'Cô giáo tương lai của anh chơi FIFA, PUBG, Liên Quân. Điểm chung đầu tiên của hai đứa còn là FapTV Đậu Phộng. Hẹn em một trận, thua thì anh bao Dookki, thắng thì anh cũng bao luôn.',
  },
  tenOClock: {
    date: 'Hồi nhỏ',
    title: 'Hoa mười giờ',
    body: 'Hồi nhỏ em theo ba ra công trường, ba là kỹ sư môi trường, còn em thì ngồi ngắm mấy nhúm hoa mười giờ. Anh để một chậu hoa mười giờ ở đây, cho cô bé ngày xưa và cô gái bây giờ đều có hoa để ngắm.',
  },
  maskToy: {
    date: 'Hồi nhỏ',
    title: 'Bé sợ múa mặt nạ',
    body: 'Hồi nhỏ em sợ múa mặt nạ lắm. Hồi nhỏ mấy dì phải chở em đi vòng vòng thì em mới chịu ngủ. Có tấm hình bé Su khóc vì bị chét kem lên mặt. Vậy mà hôm sinh nhật Mộc ở Haidilao, hai đứa ngồi xem múa mặt nạ cùng nhau. Bé Su lớn rồi, có anh ngồi kế bên rồi, khỏi sợ nha.',
  },
  kfc: {
    date: '25.07',
    title: 'Xô gà rán',
    body: 'Gà rán có mặt ở gần như mọi ngày quan trọng: 07.07 trong mưa, 25.07 trước giờ tỏ tình, 06.09 hai gà, nước, khoai tây, gà viên. Ngày nào em muốn ăn gà rán, anh xin trực sẵn.',
  },
  pizza: {
    date: 'Món em thích',
    title: 'Pizza có dứa',
    body: 'Em thích pizza Hawaii có dứa, thích Domino vì có olives. Còn bún bò, bún sườn bò, bún mắm nêm, ốc, cơm tấm Ba Ghiền, sushi, burger, lẩu, chocolate, trứng cút, lạp xưởng, xúc xích phô mai GS25, kem Celano socola và dâu, bánh Oishi snack cà chua, bánh Solite gói nhỏ, bánh gấu, hàu nướng phô mai. Danh sách dài vậy chứ anh thuộc hết. Riêng hột vịt lộn với cháo ếch thì anh gạch tên vĩnh viễn.',
  },
  certificate: {
    date: '04.10',
    title: 'Chứng chỉ MC',
    body: 'Anh đóng khung chứng chỉ MC của em treo lên tường. Đi học mỗi cuối tuần ở Nhà Văn hóa Thanh niên, anh ngồi Highlands đợi, em ra là có nước mua sẵn. Cô MC của anh giỏi quá, anh tự hào muốn nổ tung.',
  },
  flowerShop: {
    date: 'Ước mơ',
    title: 'Tiệm hoa của Su',
    body: 'Em có ước mơ làm florist. Anh đặt sẵn tấm biển nhỏ ở đây: Tiệm hoa của Su. Mai này tiệm mở cửa, sẽ có ly kép trắng tâm vàng, hồng hồng, tulip, cẩm tú cầu xanh. Anh xin làm người chở hoa, người bê chậu, người ngồi gói giấy kiếng như hôm ở Lamour Saigon, và người thương bà chủ nhất.',
  },
  notebook: {
    date: 'Sổ tay',
    title: 'Sổ tay về em',
    body: 'Cuốn sổ anh ghi lại mọi điều về em. Lật từng trang nhé.',
  },
};
