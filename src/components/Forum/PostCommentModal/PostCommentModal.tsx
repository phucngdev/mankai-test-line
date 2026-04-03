import type {
  CreateCommentPayload,
  PostComment,
  PostUser,
} from '#/api/requests/interface/Forum/Forum';
import {
  createCommentService,
  deleteCommentService,
  getCommentsService,
  toggleCommentLikeService,
  updateCommentService,
} from '#/api/services/forum.services';
import { incrementPostCommentCount } from '#/shared/redux/slices/ForumSlice';
import type { AppDispatch, RootState } from '#/shared/redux/store';
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  HeartFilled,
  HeartOutlined,
  LoadingOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Input, Modal, Spin, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import avatar from 'src/assets/images/header/avatardefault.jpg';
import type { PostCommentModalProps } from './types';
import styles from './PostCommentModal.module.scss';

const COMMENT_PAGE_SIZE = 10;
const DEFAULT_ORDER = 'createdAt:desc';

function PostCommentModal({
  authorAvatar,
  authorName = '',
  content = '',
  onClose,
  open,
  postId,
}: PostCommentModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.user.data);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const currentUserId = currentUser?.id;

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const { data } = await getCommentsService({
        limit: COMMENT_PAGE_SIZE,
        offset: 0,
        order: DEFAULT_ORDER,
        postId,
      });
      const items = data.data.items;
      setComments(items);
    } catch {
      message.error('Không tải được bình luận.');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open && postId) fetchComments();
  }, [open, postId, fetchComments]);

  useEffect(() => {
    if (!open) {
      setCommentText('');
      setEditingId(null);
      setEditText('');
    }
  }, [open]);

  const handleSubmitComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed || submitLoading) return;
    setSubmitLoading(true);
    try {
      const payload: CreateCommentPayload = { content: trimmed, postId };
      const { data } = await createCommentService(payload);
      const newComment = data?.data ?? data;
      if (newComment) {
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        dispatch(incrementPostCommentCount(postId));
        message.success('Đã gửi bình luận.');
      }
    } catch {
      message.error('Gửi bình luận thất bại.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleLike = async (comment: PostComment) => {
    try {
      const { data } = await toggleCommentLikeService(comment.id);
      const updated = data?.data ?? data;
      if (updated) {
        setComments(prev =>
          prev.map(c =>
            c.id === comment.id
              ? {
                  ...c,
                  isLiked: updated.isLiked ?? !c.isLiked,
                  userLikeCount: updated.userLikeCount ?? c.userLikeCount,
                }
              : c,
          ),
        );
      } else {
        setComments(prev =>
          prev.map(c =>
            c.id === comment.id
              ? {
                  ...c,
                  isLiked: !c.isLiked,
                  userLikeCount: c.isLiked
                    ? c.userLikeCount - 1
                    : c.userLikeCount + 1,
                }
              : c,
          ),
        );
      }
    } catch {
      message.error('Thao tác thất bại.');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteCommentService(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setEditingId(null);
      message.success('Đã xóa bình luận.');
    } catch {
      message.error('Xóa bình luận thất bại.');
    }
  };

  const startEdit = (comment: PostComment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) {
      cancelEdit();
      return;
    }
    try {
      const { data } = await updateCommentService(editingId, editText.trim());
      const updated = data?.data ?? data;
      setComments(prev =>
        prev.map(c =>
          c.id === editingId
            ? { ...c, content: updated?.content ?? editText.trim() }
            : c,
        ),
      );
      message.success('Đã cập nhật bình luận.');
    } catch {
      message.error('Cập nhật thất bại.');
    } finally {
      cancelEdit();
    }
  };

  const isOwnComment = (user: PostUser) =>
    currentUserId != null && String(user?.id) === String(currentUserId);

  return (
    <Modal
      cancelButtonProps={{ style: { display: 'none' } }}
      closable
      footer={
        <div className={styles.commentInput}>
          <Avatar
            className={styles.commentInputAvatar}
            size={40}
            src={currentUser?.avatarUrl || avatar}
          />
          <div className={styles.commentInputBox}>
            <Input.TextArea
              autoSize={{ maxRows: 6, minRows: 1 }}
              className={styles.commentTextArea}
              onChange={e => setCommentText(e.target.value)}
              onPressEnter={e => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              placeholder="Hãy gửi bình luận đầu tiên của bạn..."
              value={commentText}
            />
            <button
              className={styles.sendBtn}
              disabled={!commentText.trim() || submitLoading}
              onClick={handleSubmitComment}
              type="button"
            >
              {submitLoading ? <LoadingOutlined spin /> : <SendOutlined />}
            </button>
          </div>
        </div>
      }
      onCancel={onClose}
      open={open}
      title={`Bài viết của ${authorName}`}
      width={900}
      wrapClassName={styles.modalWrap}
    >
      <div className={styles.body}>
        <div className={styles.postSummaryContainer}>
          <div className={styles.postSummary}>
            <Avatar size={40} src={authorAvatar || avatar} />
            <p className={styles.postAuthor}>{authorName}</p>
          </div>

          <div
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        <div className={styles.commentList}>
          {loading ? (
            <div className={styles.loading}>
              <Spin />
            </div>
          ) : comments.length === 0 ? (
            <p className={styles.empty}>Chưa có bình luận nào.</p>
          ) : (
            comments.map(comment => {
              const menuItems: MenuProps['items'] = isOwnComment(comment.user)
                ? [
                    {
                      key: 'edit',
                      label: 'Chỉnh sửa',
                      icon: <EditOutlined />,
                      onClick: () => startEdit(comment),
                    },
                    {
                      key: 'delete',
                      label: 'Xóa',
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: () => handleDelete(comment.id),
                    },
                  ]
                : [];
              return (
                <div className={styles.commentItem} key={comment.id}>
                  <Avatar size={36} src={comment.user?.avatarUrl || avatar} />
                  <div className={styles.commentBody}>
                    {editingId === comment.id ? (
                      <div className={styles.editInputWrap}>
                        <Input
                          className={styles.editInputField}
                          onChange={e => setEditText(e.target.value)}
                          onPressEnter={() => handleSaveEdit()}
                          value={editText}
                        />
                        <button
                          className={styles.sendBtn}
                          onClick={handleSaveEdit}
                          type="button"
                        >
                          <SendOutlined />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className={styles.commentHead}>
                          <span className={styles.commentAuthor}>
                            {comment.user?.fullName ?? ''}
                          </span>
                          {menuItems.length > 0 && (
                            <Dropdown
                              menu={{ items: menuItems }}
                              trigger={['click']}
                            >
                              <button
                                className={styles.threeDotsBtn}
                                type="button"
                              >
                                <EllipsisOutlined />
                              </button>
                            </Dropdown>
                          )}
                        </div>
                        <p className={styles.commentContent}>
                          {comment.content}
                        </p>
                      </>
                    )}
                    <div className={styles.commentFooter}>
                      {!isOwnComment(comment.user) && (
                        <button
                          className={styles.iconBtn}
                          onClick={() => handleToggleLike(comment)}
                          type="button"
                        >
                          {comment.isLiked ? (
                            <HeartFilled className={styles.liked} />
                          ) : (
                            <HeartOutlined />
                          )}
                          <span>
                            {comment.userLikeCount > 0
                              ? comment.userLikeCount
                              : 'Thích'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

export default PostCommentModal;
