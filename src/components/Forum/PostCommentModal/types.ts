export interface PostCommentModalProps {
  authorAvatar?: string;
  authorName?: string;
  content?: string;
  onClose?: () => void;
  open: boolean;
  postId: string;
}
