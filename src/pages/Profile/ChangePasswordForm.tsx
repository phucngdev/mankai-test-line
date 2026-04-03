import { Button, Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import styles from './ChangePasswordForm.module.scss';

import { useAppDispatch } from '#/shared/redux/store';
import { putUpdatePass } from '#/shared/redux/thunk/UserThunk';
import type { UpdateUserPasswordDto } from '#/api/requests';
import { useTranslation } from 'react-i18next';

function ChangePasswordForm() {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const onFinish = async (values: any) => {
    const payload: UpdateUserPasswordDto = {
      oldPassword: values.oldPassword,
      password: values.newPassword,
    };

    try {
      await dispatch(putUpdatePass(payload)).unwrap(); // unwrap để xử lý lỗi trực tiếp
      message.success('Cập nhật mật khẩu thành công!');
      form.resetFields();
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Cập nhật mật khẩu thất bại, vui lòng thử lại.';
      message.error(errorMsg);
    }
  };

  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        label="Mật khẩu cũ"
        name="oldPassword"
        rules={[{ message: 'Vui lòng nhập mật khẩu cũ', required: true }]}
      >
        <Input.Password
          className={styles.input}
          placeholder="Nhập mật khẩu tại đây"
          prefix={<LockOutlined />}
        />
      </Form.Item>

      <Form.Item
        label="Mật khẩu mới"
        name="newPassword"
        rules={[{ message: 'Vui lòng nhập mật khẩu mới', required: true }]}
      >
        <Input.Password
          className={styles.input}
          placeholder="Nhập mật khẩu tại đây"
          prefix={<LockOutlined />}
        />
      </Form.Item>

      <Form.Item
        dependencies={['newPassword']}
        label="Nhập lại mật khẩu mới"
        name="confirmPassword"
        rules={[
          { message: 'Vui lòng xác nhận mật khẩu', required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }

              return Promise.reject(new Error('Mật khẩu không khớp'));
            },
          }),
        ]}
      >
        <Input.Password
          className={styles.input}
          placeholder="Nhập mật khẩu tại đây"
          prefix={<LockOutlined />}
        />
      </Form.Item>

      <div className={styles.buttons}>
        <Button htmlType="submit" type="primary">
          {t('profile.btnSubmit')}
        </Button>
      </div>
    </Form>
  );
}

export default ChangePasswordForm;
