import './Footer.scss';
//image
import logo from '/src/assets/images/header/Logo.png';
import facebook from '/src/assets/images/footer/facebook.png';
import linked from '/src/assets/images/footer/linked.png';
import map_pin from '/src/assets/images/footer/map_pin.png';
import phone from '/src/assets/images/footer/phone.png';
import twitter from '/src/assets/images/footer/twitter.png';

//image
function Footer() {
  return (
    <>
      <div className="footer">
        <div className="footer__content">
          <div className="footer__content--left">
            <div className="footer__content--left__logo">
              <img alt="logo" src={logo} />
            </div>
            <p className="footer__content--left__text">
              Design amazing digital experiences that create more happy in the
              world.
            </p>
            <div className="footer__content--left__list">
              <p>Overview</p>
              <p>Features</p>
              <p>Careers</p>
              <p>Help</p>
              <p>Privacy</p>
            </div>
          </div>
          <div className="footer__content--right">
            <div className="footer__content--right__item">
              <p className="footer__content--right__item--title">Cơ sở 1</p>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={map_pin} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Tầng 7, khối A tòa nhà Sông Đà, đường Phạm Hùng , Phường Mỹ
                    Đình 1, Quận Nam Từ Liêm, Hà Nội.
                  </p>
                </div>
              </div>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={phone} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Hotline: 0862 069 233
                  </p>
                </div>
              </div>
            </div>
            <div className="footer__content--right__item">
              <p className="footer__content--right__item--title">Cơ sở 2</p>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={map_pin} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Tầng 22, khối A tòa nhà Sông Đà, đường Phạm Hùng , Phường Mỹ
                    Đình 1, Quận Nam Từ Liêm, Hà Nội.
                  </p>
                </div>
              </div>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={phone} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Hotline: 0862 069 233
                  </p>
                </div>
              </div>
            </div>
            <div className="footer__content--right__item">
              <p className="footer__content--right__item--title">Cơ sở 3</p>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={map_pin} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Tầng 4, tòa nhà Ricco, số 363 Nguyễn Hữu Thọ, phường Khuê
                    Trung, Quận Cẩm Lệ, Đà Nẵng.
                  </p>
                </div>
              </div>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={phone} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Hotline: 0904 694 869
                  </p>
                </div>
              </div>
            </div>
            <div className="footer__content--right__item">
              <p className="footer__content--right__item--title">Cơ sở 4</p>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={map_pin} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Tầng 12, Tòa nhà Đảm Bảo An Toàn Hàng Hải phía Nam Số 42
                    đường Tự Cường, phường 4, Tân Bình, TP. Hồ Chí Minh.
                  </p>
                </div>
              </div>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={phone} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Hotline: 0862 069 233
                  </p>
                </div>
              </div>
            </div>
            <div className="footer__content--right__item">
              <p className="footer__content--right__item--title">Cơ sở 5</p>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={map_pin} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Tầng 3, toà TSA Bulding, Số 77 Lê Trung Nghĩa, Phường 12,
                    Tân Bình, TP. Hồ Chí Minh.
                  </p>
                </div>
              </div>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={phone} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Hotline: 0962 703 893
                  </p>
                </div>
              </div>
            </div>
            <div className="footer__content--right__item">
              <p className="footer__content--right__item--title">
                Cơ sở Fukuoka
              </p>
              <div className="footer__content--right__item--onelocation">
                <img alt="icon" src={map_pin} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Tokan Fukuoka 2nd Building 417 Hiecho 1-chome-18, Hakata-ku,
                    Fukuoka, Japan
                  </p>
                </div>
              </div>
              {/* <div className='footer__content--right__item--onelocation'>
                <img alt="icon" src={phone} />
                <div className="footer__content--right__item--text">
                  <p className="footer__content--right__item--text--address">
                    Hotline: 0862 069 233
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2077 Phenikaa. All rights reserved.</p>
          <div className="footer__bottom--icon">
            <img alt="icon" src={twitter} /> <img alt="icon" src={linked} />{' '}
            <img alt="icon" src={facebook} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
