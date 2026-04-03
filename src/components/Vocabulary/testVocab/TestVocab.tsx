import { Col, Row } from 'antd';
import styles from './TestVocab.module.scss';

export default function TestVocab() {
  return (
    <>
      <div className={styles.boxMain}>
        <div className={styles.contentMain}>
          <p className={styles.title}>Nội dung</p>
          <p className={styles.text}>Chọn đáp án đúng</p>
        </div>
        <Row className={styles.bodyAnswer} gutter={[16, 16]}>
          <Col md={12} xs={24}>
            <div className={styles.bodyContent}>
              <div className={styles.question}>
                <p>Chọn đáp án đúng</p>
                <p>こん</p>
              </div>
            </div>
          </Col>
          <Col md={12} xs={24}>
            <div className={styles.bodyContent} />
          </Col>
        </Row>
      </div>
    </>
  );
}
