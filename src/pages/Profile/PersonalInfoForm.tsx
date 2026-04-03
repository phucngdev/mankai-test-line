import { Button, DatePicker, Form, Input, Select, message } from 'antd';
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './PersonalInfoForm.module.scss';
import { useAppDispatch } from '#/shared/redux/store';
import { useEffect } from 'react';
import { getProfile, putUpdateProfile } from '#/shared/redux/thunk/UserThunk';
import type { UserEntity } from '#/api/requests';
import { UpdateUserDto } from '#/api/requests';
import { uploadFileToS3 } from '#/shared/components/upload/uploadFileToS3';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface PersonalInfoFormProps {
  data?: UserEntity | null;
  onSuccess?: () => void;
  selectedFile?: File | null;
  previewImage?: string;
  setSelectedFile?: (file: File | null) => void;
  setPreviewImage?: (url: string | undefined) => void;
}

function PersonalInfoForm({
  data,
  onSuccess,
  selectedFile,
  previewImage,
  setPreviewImage,
  setSelectedFile,
}: PersonalInfoFormProps) {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        address: data.address,
        birthday: data.birthday ? dayjs(data.birthday) : null,
        email: data.email,
        gender: data.gender,
        level: data.level,
        name: data.fullName,
        national: data.national,
        phone: data.phoneNumber,
      });
    }
  }, [data, form]);

  const onFinish = async (values: any) => {
    try {
      let avatarUrl = data?.avatarUrl;

      if (selectedFile) {
        const { publicUrl } = await uploadFileToS3(selectedFile);
        avatarUrl = publicUrl;
        setPreviewImage?.(publicUrl);
      }

      const payload: UpdateUserDto = {
        address: values.address,
        avatarUrl,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : '',
        fullName: values.name,
        gender: values.gender,
        level: values.level,
        national: values.national,
        phoneNumber: values.phone,
        userProfiles: UpdateUserDto.userProfiles.STUDENT,
      };

      await dispatch(putUpdateProfile(payload)).unwrap();
      await dispatch(getProfile());

      message.success('Cập nhật thông tin thành công!');
      onSuccess?.();

      setSelectedFile?.(null);
      setPreviewImage?.(undefined);
    } catch (error) {
      console.error(error);
      message.error('Cập nhật thất bại!');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
        <Form.Item
          label="Tên học viên"
          name="name"
          rules={[{ message: 'Vui lòng nhập tên!', required: true }]}
          style={{ flex: 1 }}
        >
          <Input className={styles.inputControl} prefix={<UserOutlined />} />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ message: 'Vui lòng nhập email!', required: true }]}
          style={{ flex: 1 }}
        >
          <Input
            className={styles.inputControl}
            disabled
            prefix={<MailOutlined />}
          />
        </Form.Item>
      </div>
      <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
        <Form.Item
          label="Ngày sinh"
          name="birthday"
          rules={[{ message: 'Vui lòng chọn ngày sinh!', required: true }]}
          style={{ flex: 1 }}
        >
          <DatePicker
            className={styles.inputControl}
            format="DD [thg] MM, YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ message: 'Vui lòng nhập số điện thoại!', required: true }]}
          style={{ flex: 1 }}
        >
          <Input className={styles.inputControl} prefix={<PhoneOutlined />} />
        </Form.Item>
      </div>
      <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ message: 'Vui lòng chọn giới tính!', required: true }]}
          style={{ flex: 1 }}
        >
          <Select className={styles.inputControl}>
            <Option value="MALE">Nam</Option>
            <Option value="FEMALE">Nữ</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Quốc gia"
          name="national"
          rules={[{ message: 'Vui lòng chọn quốc gia!', required: true }]}
          style={{ flex: 1 }}
        >
          <Select className={styles.inputControl}>
            <Option value="VIETNAM">🇻🇳 Việt Nam</Option>
            <Option value="JAPAN">🇯🇵 Nhật Bản</Option>
          </Select>
        </Form.Item>
      </div>
      <Form.Item
        label="Địa chỉ"
        name="address"
        rules={[{ message: 'Vui lòng nhập địa chỉ!', required: true }]}
        style={{ flex: 1 }}
      >
        <Input
          className={styles.inputControl}
          prefix={<EnvironmentOutlined />}
        />
      </Form.Item>
      <Form.Item
        label="Cấp độ"
        name="level"
        rules={[{ message: 'Vui lòng chọn cấp độ!', required: true }]}
        style={{ width: '100%' }}
      >
        <Select className={styles.inputControl}>
          <Option value="N5">N5</Option>
          <Option value="N4">N4</Option>
          <Option value="N3">N3</Option>
          <Option value="N2">N2</Option>
          <Option value="N1">N1</Option>
        </Select>
      </Form.Item>

      <div className={styles.buttons} style={{ display: 'flex', gap: '16px' }}>
        <Button htmlType="submit" type="primary">
          {t('profile.btnSubmit')}
        </Button>
      </div>
    </Form>
  );
}

export default PersonalInfoForm;
