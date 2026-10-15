/** "Sổ tay về em": the notebook on the desk. One page per topic, drawn from Phú's notes. */
export interface NotebookPage {
  heading: string;
  lines: string[];
}

export const NOTEBOOK: NotebookPage[] = [
  {
    heading: 'Bé Su hồi nhỏ',
    lines: [
      'Là bé đầu tiên trong nhà nên ai cũng cưng, gọi dì gọi chú là mẹ là ba luôn.',
      'Sợ múa mặt nạ. Phải được mấy dì chở đi vòng vòng mới chịu ngủ.',
      'Có tấm hình khóc nhè vì bị chét kem lên mặt.',
      'Theo ba ra công trường, ngồi ngắm hoa mười giờ.',
    ],
  },
  {
    heading: 'Nhà của em',
    lines: [
      'Mẹ có chữ đẹp nhất nhà. Em là phiên bản mini của mẹ.',
      'Ba mê du lịch, là kỹ sư môi trường, nghe Hotel California trên xe.',
      'Mộc là bé em, sinh nhật 21.09.',
      'Dì út và dượng út gặp nhau ở chùa, dượng út cao đẹp trai nhất nhà.',
    ],
  },
  {
    heading: 'Con đường đi học',
    lines: [
      'Thi vào LHP bằng Văn và Anh. Thi vào lớp 10 trường Nguyễn Du.',
      '19 giờ 30 ngày 11.08: đậu HCMUE, Sư phạm Tiểu học.',
      'Rất thương trẻ con và học trò. Từng gắn bó với trường mầm non Họa Mi 2.',
      'Học MC, thi MC, có chứng chỉ MC.',
    ],
  },
  {
    heading: 'Hoa em thương',
    lines: [
      'Yêu nhất: ly, hồng, tulip. Ly kép trắng tâm vàng.',
      'Hồng màu hồng hoặc trắng. Hồng Ohara thơm, tươi ba ngày.',
      'Cẩm chướng tươi được hai tuần.',
      'Ước mơ: làm florist, có một tiệm hoa của riêng mình.',
    ],
  },
  {
    heading: 'Em ăn gì',
    lines: [
      'Bún bò, bún sườn bò, bún mắm nêm, ốc, cơm tấm Ba Ghiền.',
      'Gà rán, pizza (có dứa, Domino vì olives), sushi, burger, lẩu, chocolate.',
      'Dookki: em có công thức nước lẩu riêng, thích mì tương đen, gà sốt chua, chả cá tokbokki.',
      'Uống được trà, không uống được cà phê. Koi 100 phần trăm đường, Gongcha 70.',
      'Không bao giờ: hột vịt lộn, hột gà lộn, trứng cút lộn, cháo ếch.',
    ],
  },
  {
    heading: 'Gà rán, chi tiết',
    lines: [
      'KFC: gà viên, khoai tây chiên, kem vani, gà truyền thống.',
      "McDonald's: McWings hơn nugget, thêm kem và sốt chua ngọt.",
      'Lotteria: vì có đùi gà gấu bông.',
      'Chưa có tiệm nào làm nugget đúng gu em. Anh đang tìm.',
    ],
  },
  {
    heading: 'Màu của em',
    lines: [
      'Hồng vì dễ thương. Vàng nhạt vì nhìn thấy tâm hồn dễ chịu.',
      'Trắng vì sang. Xanh jeans: baby blue nhạt thì dễ thương, đậm thì ngầu.',
      'Em thích anh mặc màu kem, màu đen, màu vàng nhạt.',
      'Hộp quà phải màu xanh biển, có nơ.',
    ],
  },
  {
    heading: 'Những điều nhỏ xíu',
    lines: [
      'Số may mắn là số 2. Dây chuyền đom đóm. Hello Kitty. Thiên nhiên và màu hồng.',
      'Góc mặt đẹp nhất là bên trái.',
      'Thích J97, bài Dù cho tận thế. Nước hoa Adopt mùi Blanc.',
      'Chơi FIFA, PUBG, Liên Quân. Điểm chung đầu tiên của hai đứa: FapTV Đậu Phộng.',
      'Yên cafe là quán quen em hay dắt bạn tới.',
    ],
  },
  {
    heading: 'Điều anh nhớ',
    lines: [
      'Em hiền mà đôi khi bướng, và anh thương cả hai.',
      'Em cứ là em. Anh không muốn em phải đổi khác điều gì.',
      'Em muốn đi du lịch thật nhiều. Anh xin làm người xách vali.',
      'Hai đứa thích nhất cùng một tấm photobooth của ngày 16.08.',
    ],
  },
];

export const FINALE_LINES: string[] = [
  'Chúc mừng 20/10, Su của anh.',
  'Cảm ơn em vì ngày 25.07, vì những lần em dang tay ôm anh trước, và vì đã biến mọi cơn mưa thành kỷ niệm.',
  'Mai này em mở tiệm hoa, anh xin làm khách quen đầu tiên.',
  '— Phú',
];
