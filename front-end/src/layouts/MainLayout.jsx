// src/layouts/MainLayout.jsx
import React from 'react';
import { Layout, Menu, theme, Button, Space, Dropdown } from 'antd';
import { 
  CalculatorOutlined, 
  UserOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const MainLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, colorPrimary, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'electricity-violation-household',
      icon: <CalculatorOutlined style={{ fontSize: '24px' }} />,
      label: (
        <div style={{ 
          padding: '12px 0',
          lineHeight: '1.6'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            Vi phạm sử dụng điện
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            hộ sinh hoạt
          </div>
        </div>
      ),
    },
    {
      key: 'electricity-violation-business',
      icon: <CalculatorOutlined style={{ fontSize: '24px' }} />,
      label: (
        <div style={{ 
          padding: '12px 0',
          lineHeight: '1.6'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            Vi phạm sử dụng điện
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
          cho mục đích kinh doanh
          </div>
        </div>
      ),
    },
    {
      key: 'electricity-violation-production',
      icon: <CalculatorOutlined style={{ fontSize: '24px' }} />,
      label: (
        <div style={{ 
          padding: '12px 0',
          lineHeight: '1.6'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            Vi phạm sử dụng điện
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            cho mục đích sản xuất
          </div>
        </div>
      ),
    },
    {
      key: 'electricity-violation',
      icon: <CalculatorOutlined style={{ fontSize: '24px' }} />,
      label: (
        <div style={{ 
          padding: '12px 0',
          lineHeight: '1.6'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            Vi phạm sử dụng điện
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            cho 3 mục đích
          </div>
        </div>
      ),
    }
  ];

  // Only show user management menu for admin
  if (isAdmin) {
    menuItems.push({
      key: 'user-management',
      icon: <UserOutlined style={{ fontSize: '24px' }} />,
      label: (
        <div style={{ 
          padding: '12px 0',
          lineHeight: '1.6'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>
            Quản lý người dùng
          </div>
        </div>
      ),
    });
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Thông tin cá nhân'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất'
    }
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  const handleMenuClick = ({ key }) => {
    navigate(`/${key}`);
  };

  // Get current selected key from path
  const selectedKey = location.pathname.split('/')[1] || 'function-a';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: colorBgContainer, 
        padding: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <div style={{ 
          color: colorPrimary,
          fontSize: '20px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginLeft: '24px'
        }}>
          <CalculatorOutlined style={{ fontSize: '24px' }} />
          <span>Phần mềm Tính toán Bồi thường</span>
        </div>

        <div style={{ marginRight: '24px' }}>
          <Dropdown 
            menu={{ 
              items: userMenuItems,
              onClick: handleUserMenuClick
            }} 
            placement="bottomRight"
          >
            <Button type="text">
              <Space>
                <UserOutlined />
                {user?.full_name}
              </Space>
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout style={{ marginTop: 64 }}>
        <Sider
          width={280}
          style={{
            background: '#1677ff',
            boxShadow: '1px 0 4px rgba(0,0,0,0.05)',
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            top: 64,
            padding: '16px 0'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ 
              height: '100%', 
              border: 'none',
              background: 'transparent',
              color: '#fff'
            }}
            items={menuItems}
            className="custom-menu"
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ marginLeft: 280, minHeight: 'calc(100vh - 64px)' }}>
          <Content
            style={{
              margin: '24px',
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 280,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
