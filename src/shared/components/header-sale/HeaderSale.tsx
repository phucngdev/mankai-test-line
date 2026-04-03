import './HeaderSale.scss';

function HeaderSale() {
  return (
    <>
      <div className="headerSale">
        <div className="headerSale__title">
          <p className="headerSale__title--left"> Ưu đãi cho học viên mới</p>
          <p className="headerSale__title--mid">
            | Các khóa học có giá từ 299.000₫ |
          </p>
          <p className="headerSale__title--right">Kết thúc sau 5 giờ 20 phút</p>
        </div>
        <div className="headerSale__button">
          <p>Nhận ưu đãi</p>
        </div>
      </div>
    </>
  );
}

export default HeaderSale;
