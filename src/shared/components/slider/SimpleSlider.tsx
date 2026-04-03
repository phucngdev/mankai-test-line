// import DetailBanner from '#/features/student/components/banner-slider/DetailBanner';
import Slider from 'react-slick';

export default function SimpleSlider() {
  const settings = {
    dots: true,
    infinite: true,
    slidesToScroll: 1,
    slidesToShow: 1,
    speed: 500,
  };
  return <Slider {...settings}>{/* <DetailBanner /> */}</Slider>;
}
