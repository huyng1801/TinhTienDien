import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import ProfileForm from '../components/profile/ProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

const UserProfile = () => {
  const items = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      children: <ProfileForm />
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: <ChangePasswordForm />
    }
  ];

  return (
    <Card title="Thông tin người dùng">
      <Tabs items={items} />
    </Card>
  );
};

export default UserProfile;