import { setSelectedTagId } from '#/shared/redux/slices/ForumSlice';
import type { AppDispatch, RootState } from '#/shared/redux/store';
import { fetchAllTags } from '#/shared/redux/thunk/ForumThunk';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './LeftSideBar.module.scss';

function LeftSideBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { tags, selectedTagId, ranking } = useSelector(
    (state: RootState) => state.forum,
  );
  const { data: currentUser } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchAllTags({ limit: 50, offset: 0 }));
  }, [dispatch]);

  const myRanking = ranking.find(
    item => item.fullName === currentUser?.fullName,
  );

  const expPoint = myRanking?.point ?? 0;

  return (
    <div className={styles.leftSideBar}>
      <div className={styles.leftSideBar_list}>
        <h4>Phân loại</h4>
        <div className={styles.leftSideBar_list_item}>
          <div
            className={`${styles.leftSideBar_list_item_category} ${selectedTagId === null ? styles.active : ''}`}
            onClick={() => dispatch(setSelectedTagId(null))}
          >
            <p>Tất cả bài viết</p>
          </div>
          {tags.map(tag => (
            <div
              className={`${styles.leftSideBar_list_item_category} ${selectedTagId === tag.id ? styles.active : ''}`}
              key={tag.id}
              onClick={() => dispatch(setSelectedTagId(tag.id))}
            >
              <p>{tag.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.leftSideBar_achievements}>
        <h4>Thành tích của bạn</h4>
        <div className={styles.leftSideBar_streaks_experience}>
          <div className={styles.leftSideBar_streaks_exp}>
            <p>54</p>
            <p>STREAKS</p>
          </div>
          <div className={styles.leftSideBar_streaks_exp}>
            <p>{expPoint.toLocaleString()}</p>
            <p>EXP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSideBar;
