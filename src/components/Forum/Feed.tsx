import type { GetAllPostsParams } from '#/api/requests/interface/Forum/Forum';
import { setSelectedTagId } from '#/shared/redux/slices/ForumSlice';
import type { AppDispatch, RootState } from '#/shared/redux/store';
import { fetchAllPosts } from '#/shared/redux/thunk/ForumThunk';
import CreatePost from '#/src/components/Forum/CreatePost/CreatePost';
import PostCard from '#/src/components/Forum/PostCard/PostCard';
import { Skeleton } from 'antd';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styles from './Feed.module.scss';

const SKELETON_CARD_COUNT = 4;

function PostCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton
        active
        avatar={{ shape: 'circle', size: 40 }}
        paragraph={{ rows: 3 }}
        title={{ width: '60%' }}
      />
      <div className={styles.skeletonCard_actions}>
        <Skeleton.Button active size="small" />
        <Skeleton.Button active size="small" />
        <Skeleton.Button active size="small" />
      </div>
    </div>
  );
}

// Sắp xếp
// const SORT_OPTIONS = [
//   { key: 'newest', label: 'Mới nhất' },
//   { key: 'popular', label: 'Phổ biến nhất' },
//   { key: 'most_liked', label: 'Nhiều tym nhất' },
//   { key: 'my_posts', label: 'Bài viết của tôi' },
// ];

function Feed() {
  // const [sortKey, setSortKey] = useState('newest');
  const dispatch = useDispatch<AppDispatch>();
  const { posts, postsStatus, selectedTagId, createPostStatus, tags } =
    useSelector((state: RootState) => state.forum);

  // const currentLabel =
  //   SORT_OPTIONS.find(option => option.key === sortKey)?.label ?? 'Mới nhất';

  const isLoadingPosts = postsStatus === 'pending';
  const isLoadedAndEmpty = postsStatus === 'successfully' && posts.length === 0;

  useEffect(() => {
    const params: GetAllPostsParams = {
      limit: 20,
      offset: 0,
      ...(selectedTagId !== null && { tagIds: [String(selectedTagId)] }),
    };
    dispatch(fetchAllPosts(params));
  }, [dispatch, selectedTagId, createPostStatus]);

  return (
    <div className={styles.feed}>
      <CreatePost />

      <div className={styles.classificationTabs}>
        <button
          className={`${styles.classificationTabs_tab} ${selectedTagId === null ? styles.active : ''}`}
          onClick={() => dispatch(setSelectedTagId(null))}
          type="button"
        >
          Tất cả bài viết
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            className={`${styles.classificationTabs_tab} ${selectedTagId === tag.id ? styles.active : ''}`}
            onClick={() => dispatch(setSelectedTagId(tag.id))}
            type="button"
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className={styles.newsFeed}>
        <div className={styles.newsFeed_header}>
          <p className={styles.newsFeed_header_title}>Bản tin</p>
          {/* Sắp xếp
          <Dropdown
            menu={{
              items: SORT_OPTIONS.map(o => ({
                key: o.key,
                label: o.label,
              })),
              onClick: ({ key }) => setSortKey(key),
              selectedKeys: [sortKey],
            }}
            overlayClassName={styles.sortDropdown}
            trigger={['click']}
          >
            <p className={styles.newsFeed_header_sort}>
              Sắp xếp: <span>{currentLabel}</span> <DownOutlined />
            </p>
          </Dropdown>
          */}
        </div>

        {isLoadingPosts && (
          <div className={styles.skeletonList}>
            {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoadingPosts && isLoadedAndEmpty && (
          <p className={styles.noPosts}>Chưa có bài viết nào.</p>
        )}

        {!isLoadingPosts &&
          posts.map(post => (
            <PostCard
              authorAvatar={post.user?.avatarUrl}
              authorId={post.user?.id}
              authorName={post.user?.fullName}
              commentCount={post.commentCount}
              content={post.content}
              key={post.id}
              likeCount={post.userLikeCount}
              liked={post.isLiked}
              userGiveFlowerCount={post.userGiveFlowerCount ?? 0}
              flower={post.isFlower}
              postId={post.id}
              tagIds={post.tagIds}
              createdAt={post.createdAt}
            />
          ))}
      </div>
    </div>
  );
}

export default Feed;
