import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FireOutlined,
  MinusOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Avatar } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type {
  ForumRankingTag,
  ForumRankingTagResponse,
} from '#/api/requests/interface/Forum/Forum';
import { getAllRankingTagsService } from '#/api/services/forum.services';
import type { AppDispatch, RootState } from '#/shared/redux/store';
import { fetchForumRanking } from '#/shared/redux/thunk/ForumThunk';
import styles from './RightSideBar.module.scss';

const rankColors: Record<number, string> = {
  1: '#f59e0b',
  2: '#94a3b8',
  3: '#cd7f32',
};

function RightSideBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { ranking, rankingStatus } = useSelector(
    (state: RootState) => state.forum,
  );

  const [rankingTags, setRankingTags] = useState<ForumRankingTag[]>([]);

  const loadRanking = useCallback(() => {
    if (rankingStatus !== 'idle') return;

    dispatch(
      fetchForumRanking({
        limit: 10,
        offset: 0,
      }),
    );
  }, [dispatch, rankingStatus]);

  const loadRankingTags = useCallback(async () => {
    try {
      const { data } = await getAllRankingTagsService();
      const response = data as ForumRankingTagResponse;
      setRankingTags(response.data);
    } catch {
      setRankingTags([]);
    }
  }, []);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  useEffect(() => {
    loadRankingTags();
  }, [loadRankingTags]);

  const trendIcons = useMemo(
    () => [<ArrowUpOutlined />, <MinusOutlined />, <ArrowDownOutlined />],
    [],
  );

  const getTrendIcon = (index: number) => {
    if (index < trendIcons.length) return trendIcons[index];
    return trendIcons[2];
  };

  return (
    <div className={styles.rightSideBar}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h4>Chủ đề xu hướng</h4>
          <FireOutlined className={styles.headerIcon} />
        </div>
        <div className={styles.topicList}>
          {rankingTags.map(topic => (
            <div className={styles.topicItem} key={topic.id}>
              <span className={styles.topicTag}>{topic.name}</span>
              <span className={styles.topicMeta}>
                {topic.totalPost} bài viết • {topic.totalInteract} đang thảo
                luận
              </span>
            </div>
          ))}
        </div>
        <button className={styles.seeMore}>Xem thêm</button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h4>Bảng xếp hạng</h4>
          <TrophyOutlined className={styles.headerIconTrophy} />
        </div>
        {ranking.length === 0 && rankingStatus !== 'pending' && (
          <p className={styles.topicMeta}>Chưa có dữ liệu xếp hạng.</p>
        )}
        {ranking.length > 0 && (
          <div className={styles.leaderboardList}>
            {ranking.map((user, index) => (
              <div
                className={styles.leaderboardItem}
                key={user.position ?? index}
              >
                <div className={styles.leaderboardLeft}>
                  <div className={styles.avatarWrapper}>
                    <Avatar size={40} src={user.avatarUrl}>
                      {user.fullName?.charAt(0)}
                    </Avatar>
                    {typeof user.position === 'number' && (
                      <span
                        className={styles.rankBadge}
                        style={{
                          backgroundColor:
                            rankColors[user.position] ?? '#e5e7eb',
                        }}
                      >
                        {user.position}
                      </span>
                    )}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.fullName}</span>
                    <span className={styles.userExp}>
                      {user.point?.toLocaleString()} điểm
                    </span>
                  </div>
                </div>
                <div className={styles.trendIcon}>{getTrendIcon(index)}</div>
              </div>
            ))}
          </div>
        )}
        <button className={styles.seeMore}>Xếp hạng của tôi</button>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLinks}>
          <a href="#">Chính sách bảo mật</a>
          <span>•</span>
          <a href="#">Điều khoản</a>
          <span>•</span>
          <a href="#">Trợ giúp</a>
        </div>
        <p>© 2024 Mankai Academy. All rights reserved.</p>
      </div>
    </div>
  );
}

export default RightSideBar;
