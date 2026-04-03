import type { ForumTag } from '#/api/requests/interface/Forum/Forum';
import { stopEditingPost } from '#/shared/redux/slices/ForumSlice';
import type { AppDispatch, RootState } from '#/shared/redux/store';
import { createPost, updatePost } from '#/shared/redux/thunk/ForumThunk';
import { PlusOutlined } from '@ant-design/icons';
import { Avatar, Modal, Popover, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import avatar from 'src/assets/images/header/avatardefault.jpg';
import PostCKEditor from './PostCKEditor';

import styles from './CreatePost.module.scss';

const MAX_TAGS = 3;

function CreatePost() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: userData } = useSelector((state: RootState) => state.user);
  const {
    tags: availableTags,
    posts,
    editingPostId,
  } = useSelector((state: RootState) => state.forum);
  const editingPost = posts.find(p => p.id === editingPostId) ?? null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<ForumTag[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit =
    content.trim().length > 0 && selectedTags.length >= 1 && !isSubmitting;

  const resetForm = () => {
    setContent('');
    setSelectedTags([]);
    setTagPopoverOpen(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    if (editingPost) {
      dispatch(stopEditingPost());
    }
    resetForm();
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    const tagIds = selectedTags.map(t => String(t.id));
    setIsSubmitting(true);
    try {
      let result;
      if (editingPost) {
        result = await dispatch(
          updatePost({
            postId: editingPost.id,
            payload: { content, tagIds },
          }),
        );
      } else {
        result = await dispatch(createPost({ content, tagIds }));
      }

      if (
        updatePost.rejected.match(result) ||
        createPost.rejected.match(result)
      ) {
        const data = result.payload as any;
        const raw = data?.message;
        const msg = Array.isArray(raw)
          ? raw[0]
          : (raw ?? data?.messageCode ?? result.error?.message);
        if (msg) message.error(msg);
        return;
      }

      message.success(
        editingPost ? 'Cập nhật bài viết thành công!' : 'Đăng bài thành công!',
      );
      setIsModalOpen(false);
      dispatch(stopEditingPost());
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!editingPost) return;
    setContent(editingPost.content);
    const nextTags = availableTags.filter(t =>
      editingPost.tagIds.includes(String(t.id)),
    );
    setSelectedTags(nextTags);
  }, [editingPost, availableTags]);

  const handleSelectTag = (tag: ForumTag) => {
    if (selectedTags.some(t => t.id === tag.id)) return;
    const next = [...selectedTags, tag];
    setSelectedTags(next);
    if (next.length >= MAX_TAGS) setTagPopoverOpen(false);
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
  };

  return (
    <div className={styles.createPost}>
      <div
        className={styles.createPost_trigger}
        onClick={() => {
          if (isSubmitting) return;
          setIsModalOpen(true);
        }}
      >
        <Avatar size={40} src={userData?.avatarUrl || avatar} />
        <p className={styles.ModalTrigger_text}>
          {userData?.fullName ?? 'Bạn'} ơi, bạn đang nghĩ gì?
        </p>
      </div>

      <Modal
        closable={false}
        footer={null}
        maskClosable={!isSubmitting}
        onCancel={handleClose}
        open={isModalOpen || Boolean(editingPost)}
        title={
          <div className={styles.modalTitle}>
            <p>{editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}</p>
          </div>
        }
        width={750}
      >
        <div className={styles.modalContent}>
          <div className={styles.modalContent_header}>
            <Avatar size={40} src={userData?.avatarUrl || avatar} />
            <p className={styles.ModalTrigger_text}>
              {userData?.fullName ?? 'Bạn'}
            </p>
          </div>
          <div className={styles.modalContent_body}>
            <PostCKEditor changeData={setContent} value={content} />
          </div>
        </div>
        <div className={styles.modalContent_tags}>
          <p className={styles.modalContent_tags_title}>Gắn thẻ bài viết:</p>
          <div className={styles.modalContent_tags_list}>
            {selectedTags.map(tag => (
              <Tag
                className={styles.selectedTag}
                closable={!isSubmitting}
                key={tag.id}
                onClose={() => handleRemoveTag(tag.id)}
              >
                {tag.name}
              </Tag>
            ))}
            {selectedTags.length < MAX_TAGS && (
              <Popover
                content={
                  <div className={styles.tagDropdown}>
                    {availableTags
                      .filter(t => !selectedTags.some(s => s.id === t.id))
                      .map(t => (
                        <div
                          className={styles.tagDropdown_item}
                          key={t.id}
                          onClick={() => handleSelectTag(t)}
                        >
                          {t.name}
                        </div>
                      ))}
                  </div>
                }
                onOpenChange={open => setTagPopoverOpen(open)}
                open={tagPopoverOpen || undefined}
                placement="bottom"
                trigger="click"
              >
                <button
                  className={styles.addTagBtn}
                  disabled={isSubmitting}
                  onClick={() => setTagPopoverOpen(true)}
                  type="button"
                >
                  <PlusOutlined />
                </button>
              </Popover>
            )}
          </div>
        </div>
        <div className={styles.modalContent_footer}>
          <button
            className={styles.modalContent_footer_button}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? editingPost
                ? 'Đang lưu...'
                : 'Đang đăng...'
              : editingPost
                ? 'Lưu thay đổi'
                : 'Đăng bài'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CreatePost;
