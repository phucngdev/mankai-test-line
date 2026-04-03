import type { TablePaginationConfig, TableProps } from 'antd';
import { Table } from 'antd';

import styles from './ListExam.module.scss';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '#/shared/components/loading/Loading';
import { getTestUserResult } from '#/shared/redux/thunk/MockTestThunk';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

export default function ListExam() {
  const { dataResultUser, totalElement } = useSelector(
    (state: RootState) => state.mockTestDetail,
  );

  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userStr = Cookies.get('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const userId = user ? user.id : null;
  const [pagination, setPagination] = useState({
    current: 1,
    limit: 10,
    offset: 0,
  });
  const { t } = useTranslation();
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    dispatch(
      getTestUserResult({
        limit: pagination.limit,
        offset: pagination.offset,
        userId,
      }),
    ).finally(() => setLoading(false));
  }, [pagination, userId]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const { current = 1, pageSize = 10 } = pagination;

    setPagination(prev => ({
      ...prev,
      current,
      limit: pageSize,
      offset: (current - 1) * pageSize,
    }));
  };

  const columns: TableProps['columns'] = [
    {
      dataIndex: 'name',
      key: 'name',
      render: text => <a>{text}</a>,
      title: <>{t('banner.examTest')}</>,
    },
    {
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? new Date(value).toLocaleString('vi-VN') : '',
      title: <>{t('banner.dateExam')}</>,
    },

    {
      dataIndex: 'score',
      key: 'score',
      title: <>{t('banner.point')}</>,
    },
  ];

  if (loading) return <Loading />;
  const tableData =
    dataResultUser.map(item => ({
      ...item,
      name: item.testId.name,
    })) || [];
  return (
    <>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('historyExam.titleHistoryExam')}</h1>
        <div>
          <Table
            bordered
            columns={columns}
            dataSource={tableData}
            onChange={handleTableChange}
            onRow={record => ({
              onClick: () => navigate(`/exam-result/${record.id}`),
            })}
            pagination={{
              current: pagination.current,
              pageSize: pagination.limit,
              showSizeChanger: true,
              // showTotal: total => `Tổng số ${total}`,
              total: totalElement,
            }}
            rowKey="id"
          />
        </div>
      </div>
    </>
  );
}
