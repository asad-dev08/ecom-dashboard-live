import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Form, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (values) => {
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(values.email, values.password);
        navigate('/dashboard');
      } else {
        // Registration validation
        if (values.password !== values.confirm_password) {
          throw new Error('Passwords do not match');
        }
        await register({
          email: values.email,
          password: values.password,
          full_name: values.full_name,
        });
        // Auto switch to login after successful registration
        setIsLogin(true);
        form.resetFields();
        setError('Registration successful! Please login.');
      }
    } catch (error) {
      setError(error.message || (isLogin ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">
                Welcome Back
              </h1>
              <p className="text-blue-100 mt-2">
                {isLogin ? 'Sign in to access your account' : 'Create your admin account'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <Alert
                message={error}
                type={error.includes('successful') ? 'success' : 'error'}
                showIcon
                className="mb-6"
              />
            )}

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              initialValues={{
                email: 'admin@admin.com',
                password: 'admin123'
              }}
            >
              {/* Registration Fields */}
              {!isLogin && (
                <Form.Item
                  name="full_name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Enter your full name" 
                    size="large"
                  />
                </Form.Item>
              )}

              {/* Common Fields */}
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Enter your email" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                  size="large"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              {/* Registration Fields */}
              {!isLogin && (
                <Form.Item
                  name="confirm_password"
                  label="Confirm Password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm your password"
                    size="large"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              )}

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 text-base font-medium"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </Form.Item>
            </Form>

            {/* Toggle between login and register */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  form.resetFields();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            © 2024 | Asadullah Sarker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 