import Feed from '#/src/components/Forum/Feed';
import LeftSideBar from '#/src/components/Forum/LeftSideBar';
import RightSideBar from '#/src/components/Forum/RightSideBar';
import { Col, Row } from 'antd';
import styles from './Forum.module.scss';

function Forum() {
  return (
    <div className={styles.forum}>
      <Row gutter={32}>
        <Col md={6} xs={24}>
          <LeftSideBar />
        </Col>
        <Col md={12} xs={24}>
          <Feed />
        </Col>
        <Col md={6} xs={24}>
          <RightSideBar />
        </Col>
      </Row>
    </div>
  );
}

export default Forum;
