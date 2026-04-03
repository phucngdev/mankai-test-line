import type { AppDispatch, RootState } from '#/shared/redux/store';
import {
  deletePost,
  fetchForumRanking,
  togglePostFlower,
  togglePostLike,
} from '#/shared/redux/thunk/ForumThunk';
import {
  CommentOutlined,
  EllipsisOutlined,
  GiftFilled,
  GiftOutlined,
  LikeFilled,
  LikeOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Modal, message } from 'antd';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import avatar from 'src/assets/images/header/avatardefault.jpg';

import { startEditingPost } from '#/shared/redux/slices/ForumSlice';
import PostCommentModal from '../PostCommentModal/PostCommentModal';
import styles from './PostCard.module.scss';
import type { PostCardProps } from './types';

const formatTimeFromNow = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) return 'Vừa xong';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return `Hôm qua lúc ${date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN');
};

function PostCard(props: PostCardProps) {
  const {
    authorAvatar,
    authorId,
    authorName,
    commentCount = 0,
    content = '',
    likeCount = 0,
    liked = false,
    userGiveFlowerCount = 0,
    flower = false,
    postId,
    tagIds = [],
    createdAt,
  } = props;
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user.data);
  const tags = useSelector((state: RootState) => state.forum.tags);

  const isOwnPost =
    currentUser?.id != null &&
    authorId != null &&
    String(currentUser.id) === String(authorId);

  const handleLike = async () => {
    if (!postId) return;
    try {
      await dispatch(togglePostLike(postId)).unwrap();

      dispatch(
        fetchForumRanking({
          limit: 10,
          offset: 0,
        }),
      );
    } catch {
      message.error('Thao tác thất bại.');
    }
  };

  const handleFlower = async () => {
    if (!postId) return;
    try {
      const result = await dispatch(togglePostFlower(postId));
      if (togglePostFlower.rejected.match(result)) {
        const data = result.payload as any;
        const raw = data?.message;
        const msg = Array.isArray(raw)
          ? raw[0]
          : (raw ?? data?.messageCode ?? result.error?.message);
        if (msg) message.error(msg);
        return;
      }
      dispatch(
        fetchForumRanking({
          limit: 10,
          offset: 0,
        }),
      );
    } catch {
      message.error('Thao tác thất bại.');
    }
  };

  const resolvedTagNames = tagIds
    .map(id => tags.find(t => String(t.id) === String(id))?.name)
    .filter(Boolean) as string[];

  const handleDeletePost = () => {
    if (!postId) return;
    Modal.confirm({
      title: 'Xóa bài viết',
      content: 'Bạn có chắc chắn muốn xóa bài viết này?',
      okText: 'Xóa',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      async onOk() {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[DeletePost]', {
            postId,
            currentUserId: currentUser?.id,
            authorId,
            isOwnPost,
          });
        }
        const result = await dispatch(deletePost(postId));
        if (deletePost.rejected.match(result)) {
          const data = result.payload as any;
          const raw = data?.message;
          const msg = Array.isArray(raw)
            ? raw[0]
            : (raw ?? data?.messageCode ?? result.error?.message);
          if (msg) message.error(msg);
          return;
        }
        message.success('Đã xóa bài viết.');
      },
    });
  };

  const handleOpenEdit = () => {
    if (!postId) return;
    dispatch(startEditingPost(postId));
  };

  const moreMenuItems = [
    {
      key: 'edit',
      label: 'Chỉnh sửa bài viết',
    },
    {
      key: 'delete',
      label: 'Xóa bài viết',
    },
  ];

  return (
    <div className={styles.postCard}>
      <div className={styles.postCard_header}>
        <div className={styles.postCard_header_left}>
          <Avatar size={40} src={authorAvatar || avatar} />
          <div className={styles.postCard_header_info}>
            <div className={styles.authorInfo}>
              <p className={styles.authorName}>{authorName}</p>
              {isOwnPost && <p className={styles.authorRole}>Tác giả</p>}
            </div>
            {(createdAt || resolvedTagNames.length > 0) && (
              <div className={styles.meta}>
                {createdAt && (
                  <span className={styles.postTime}>
                    {formatTimeFromNow(createdAt)}
                  </span>
                )}
                {createdAt && resolvedTagNames.length > 0 && (
                  <span className={styles.dot}>·</span>
                )}
                {resolvedTagNames.length > 0 && (
                  <div className={styles.metaTags}>
                    {resolvedTagNames.map(tag => (
                      <span className={styles.metaTag} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {isOwnPost && (
          <Dropdown
            menu={{
              items: moreMenuItems,
              onClick: ({ key }) => {
                if (key === 'edit') handleOpenEdit();
                if (key === 'delete') handleDeletePost();
              },
            }}
            trigger={['click']}
          >
            <button className={styles.moreBtn} type="button">
              <EllipsisOutlined />
            </button>
          </Dropdown>
        )}
      </div>

      <div className={styles.postCard_content}>
        <div
          className={styles.richContent}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <div className={styles.postCard_actions_metrics}>
        <span className={styles.postCard_actions_metric}>
          <LikeOutlined className={styles.likeIcon} />
          <span className={styles.likeText}>{likeCount}</span>
        </span>
        <span className={styles.postCard_actions_metric}>
          <GiftOutlined className={styles.flowerIcon} />
          <span className={styles.flowerText}>{userGiveFlowerCount}</span>
        </span>
        <span
          className={`${styles.postCard_actions_metric} ${styles.commentMetric}`}
        >
          {commentCount} bình luận
        </span>
      </div>

      <div className={styles.postCard_actions}>
        {!isOwnPost && (
          <>
            <button
              className={`${styles.actionBtn} ${!isOwnPost && liked ? styles.liked : ''}`}
              onClick={() => {
                if (isOwnPost) {
                  message.warning('Tính năng không khả dụng.');
                  return;
                }
                handleLike();
              }}
              type="button"
            >
              {!isOwnPost && liked ? <LikeFilled /> : <LikeOutlined />}
              <span>Thích</span>
            </button>
            <button
              className={`${styles.actionBtn} ${!isOwnPost && flower ? styles.flower : ''}`}
              onClick={() => {
                if (isOwnPost) {
                  message.warning('Tính năng không khả dụng.');
                  return;
                }
                handleFlower();
              }}
              type="button"
            >
              {!isOwnPost && flower ? <GiftFilled /> : <GiftOutlined />}
              <span>Tặng hoa</span>
            </button>
          </>
        )}
        <button
          className={styles.actionBtn}
          onClick={() => postId && setCommentModalOpen(true)}
          type="button"
        >
          <CommentOutlined />
          <span>Bình luận</span>
        </button>
      </div>

      {postId && (
        <PostCommentModal
          authorAvatar={authorAvatar}
          authorName={authorName}
          content={content}
          onClose={() => setCommentModalOpen(false)}
          open={commentModalOpen}
          postId={postId}
        />
      )}
    </div>
  );
}

export default PostCard;
