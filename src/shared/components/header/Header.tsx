import './Header.scss';
import logo from '/src/assets/images/header/Logo.png';
import icon from '/src/assets/images/header/Navigation_Language.png';
import iconDropdown from '/src/assets/images/header/Dropdown.png';
import search from '/src/assets/images/header/search.png';

export function Header() {
  return (
    <>
      <div className="header">
        <div className="header-logo">
          <img alt="logo" src={logo} />
        </div>
        <div className="header-left">
          <div className="header-left__dropdown">
            <p>Khám phá</p>
            <img alt="icon" src={iconDropdown} />
          </div>
          <div className="header-left__search">
            <img alt="icon" src={search} />
            <input placeholder="Tìm kiếm" type="text" />
          </div>
        </div>
        <div className="header-right">
          <div className="header-right__business">
            <p>Business</p>
          </div>
          <div className="header-right__apply">
            <p>Tuyển dụng</p>
          </div>
          <div className="header-right__login">
            <p>Đăng nhập</p>
          </div>
          <div className="header-right__register">
            <p>Đăng ký</p>
          </div>
          <div className="header-right__icon">
            <img alt="icon" src={icon} />
          </div>
        </div>
      </div>
    </>
  );
}
