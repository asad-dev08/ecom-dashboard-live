import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Tag, Typography, message, Popconfirm, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import DataGrid from '../components/common/DataGrid';
import ProductForm from '../components/products/ProductForm';

const { Title } = Typography;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (record) => {
    try {
      setLoading(true);
      // Fetch complete product data including variants
      const productData = await api.getProduct(record.id);
      setEditingProduct(productData);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      message.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ids) => {
    try {
      await api.bulkDeleteProducts(ids);
      await fetchProducts();
      setSelectedProducts([]);
      message.success('Products deleted successfully');
    } catch (error) {
      console.error('Error deleting products:', error);
      message.error('Failed to delete products');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, values);
        message.success('Product updated successfully');
      } else {
        await api.createProduct(values);
        message.success('Product created successfully');
      }
      setIsModalVisible(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      message.error('Failed to save product');
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  const columns = [
    {
      field: 'name',
      header: 'Product Name',
      sortable: true,
      filterable: true,
      width: 250,
    },
    {
      field: 'category_name',
      header: 'Category',
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      field: 'price',
      header: 'Price',
      sortable: true,
      render: (value) => `$${value.toFixed(2)}`,
      width: 120,
    },
    {
      field: 'stock_quantity',
      header: 'Stock',
      sortable: true,
      width: 100,
    },
    {
      field: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => {
        const colors = {
          active: 'success',
          inactive: 'warning',
          out_of_stock: 'error',
          discontinued: 'default'
        };
        return (
          <Tag color={colors[value]}>
            {value?.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      },
      width: 120,
    },
  ];

  const actions = (
    <div className='flex gap-2 flex-wrap items-center justify-between mt-2'>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddNew}
      >
        Add Product
      </Button>
      {selectedProducts.length > 0 && (
        <Popconfirm
          title="Delete selected products"
          description="Are you sure you want to delete the selected products?"
          onConfirm={() => handleDelete(selectedProducts)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            icon={<DeleteOutlined />}
          >
            Delete Selected
          </Button>
        </Popconfirm>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <Title level={2}>Products</Title>
      <DataGrid
        columns={columns}
        data={products}
        loading={loading}
        selectable
        onSelectionChange={setSelectedProducts}
        onRowClick={handleEdit}
        actions={actions}
        searchable
      />

      <Modal
        // title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalVisible}
        onCancel={handleModalClose}
        width={1000}
        footer={null}
        destroyOnClose={true}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default Product;