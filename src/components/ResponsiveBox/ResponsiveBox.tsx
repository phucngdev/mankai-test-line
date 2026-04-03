import React from 'react';
import styles from './ResponsiveBox.module.scss';

function ResponsiveBox(): React.ReactElement {
  return (
    <div className={styles.wrapper}>
      <h2>Responsive Box</h2>
      <p>Resize màn hình để thấy sự thay đổi theo từng breakpoint.</p>
    </div>
  );
}

export default ResponsiveBox;
