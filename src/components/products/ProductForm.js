import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Card, 
  Space, 
  Upload, 
  message,
  Divider,
  Typography
} from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const isEditMode = !!product;

  useEffect(() => {
    fetchCategories();
    if (product) {
      form.setFieldsValue({
        ...product,
        variants: product.variants || [],
      });
      // Set images if any
      if (product.images) {
        setFileList(product.images.map((url, index) => ({
          uid: `-${index}`,
          name: `Image ${index + 1}`,
          status: 'done',
          url,
        })));
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [product, form]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const productData = {
        ...values,
        images: fileList.map(file => file.url || file.response?.url),
        status: values.status || 'active',
      };
      await onSubmit(productData);
      message.success(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Card className="w-full mx-auto" style={{ border: 'none' }}>
      <Title level={2} className="mb-6">
        {isEditMode ? 'Edit Product' : 'Add Product'}
      </Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'active',
          variants: [],
          price: '',
          stock_quantity: '',
          category_id: '',
          name: '',
          description: '',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={4} placeholder="Enter product description" />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              prefix="$"
              placeholder="0.00"
            />
          </Form.Item>

          <Form.Item
            name="stock_quantity"
            label="Stock Quantity"
            rules={[{ required: true, message: 'Please enter stock quantity' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="out_of_stock">Out of Stock</Option>
              <Option value="discontinued">Discontinued</Option>
            </Select>
          </Form.Item>
        </div>

        <Divider>Product Variants</Divider>

        <Form.List name="variants">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} size="small" className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: 'Missing variant name' }]}
                    >
                      <Input placeholder="Variant name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'sku']}
                      rules={[{ required: true, message: 'Missing SKU' }]}
                    >
                      <Input placeholder="SKU" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: 'Missing price' }]}
                    >
                      <InputNumber
                        min={0}
                        step={0.01}
                        style={{ width: '100%' }}
                        placeholder="Price"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'stock_quantity']}
                      rules={[{ required: true, message: 'Missing stock' }]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="Stock"
                      />
                    </Form.Item>
                  </div>
                  <Button
                    type="text"
                    onClick={() => remove(name)}
                    icon={<DeleteOutlined />}
                    danger
                    className="absolute top-2 right-2"
                  />
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Variant
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider>Product Images</Divider>

        <Form.Item label="Images">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false}
          >
            {fileList.length >= 8 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item className="flex justify-end">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductForm; 