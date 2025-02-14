export const API_BASE_URLL = 'http://localhost:3001';
export const API_BASE_URL = 'https://ecom-dashboard-live.vercel.app:3001/';

export const api = {
  // Auth
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
    console.log('response:', response);
    const users = await response.json();
    console.log('users:', users);
    const user = users[0];
    
    // In a real app, password comparison would happen on the server
    // For demo purposes, we'll check if the password is "admin123" since that's our known password
    if (user && password === "admin123" && user.role === 'admin') {
      return user;
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        role: 'admin',
        created_at: new Date().toISOString(),
      }),
    });
    return response.json();
  },

  // Products
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/products?${queryString}`);
    const products = await response.json();
    
    // Fetch all categories once
    const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
    const categories = await categoriesResponse.json();
    
    // Map products with category information
    return products.map(product => {
      const category = categories.find(c => c.id === product.category_id);
      const parentCategory = category?.parent_id 
        ? categories.find(c => c.id === category.parent_id)
        : null;

      return {
        ...product,
        category_name: parentCategory 
          ? `${parentCategory.name} > ${category.name}`
          : category?.name
      };
    });
  },

  getProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    const product = await response.json();
    
    // Fetch variants for this product
    const variantsResponse = await fetch(`${API_BASE_URL}/product_variants?product_id=${id}`);
    const variants = await variantsResponse.json();
    
    // Fetch category info
    const categoryResponse = await fetch(`${API_BASE_URL}/categories/${product.category_id}`);
    const category = await categoryResponse.json();
    
    return {
      ...product,
      variants,
      category_name: category.name
    };
  },

  getProductVariants: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/product_variants?product_id=${productId}`);
    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  // Orders
  getOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/orders?${queryString}`);
    const orders = await response.json();

    // Fetch all users to get customer names
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const users = await usersResponse.json();

    // Map orders with customer information
    return orders.map(order => {
      const customer = users.find(user => user.id === order.user_id);
      return {
        ...order,
        customer_name: customer ? customer.full_name : 'Unknown Customer'
      };
    });
  },

  getOrder: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    const order = await response.json();
    
    // Fetch order items
    const itemsResponse = await fetch(`${API_BASE_URL}/order_items?order_id=${id}`);
    const items = await itemsResponse.json();

    // Fetch customer info
    const userResponse = await fetch(`${API_BASE_URL}/users/${order.user_id}`);
    const customer = await userResponse.json();

    // Fetch all products to get names
    const productsResponse = await fetch(`${API_BASE_URL}/products`);
    const products = await productsResponse.json();

    // Add product details to items
    const itemsWithProducts = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        ...item,
        product_name: product ? product.name : 'Unknown Product'
      };
    });
    
    return { 
      ...order, 
      items: itemsWithProducts,
      customer_name: customer ? customer.full_name : 'Unknown Customer'
    };
  },

  // Users
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryString}`);
    const users = await response.json();
    
    // If role is specified, filter by role
    if (params.role) {
      return users.filter(user => user.role === params.role);
    }
    
    return users;
  },

  getUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return response.json();
  },

  // Dashboard Stats
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  },

  // Products
  createProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  updateProduct: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    return response.json();
  },

  deleteProduct: async (id) => {
    await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
  },

  bulkDeleteProducts: async (ids) => {
    await Promise.all(ids.map(id => api.deleteProduct(id)));
  },

  // Product Variants
  createVariant: async (variantData) => {
    const response = await fetch(`${API_BASE_URL}/product_variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variantData),
    });
    return response.json();
  },

  updateVariant: async (id, variantData) => {
    const response = await fetch(`${API_BASE_URL}/product_variants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variantData),
    });
    return response.json();
  },

  deleteVariant: async (id) => {
    await fetch(`${API_BASE_URL}/product_variants/${id}`, {
      method: 'DELETE',
    });
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    return true;
  },

  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.full_name)}`,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    return response.json();
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        updated_at: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    
    return response.json();
  },

  updateOrderStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.json();
  },

  getCustomerOrders: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/orders?user_id=${customerId}`);
    return response.json();
  },

  getCustomerCommunications: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/communications?user_id=${customerId}`);
    return response.json();
  },

  addCustomerCommunication: async (data) => {
    const response = await fetch(`${API_BASE_URL}/communications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        date: new Date().toISOString(),
      }),
    });
    return response.json();
  },

  updateCustomerSegments: async (customerId, segments) => {
    const response = await fetch(`${API_BASE_URL}/users/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        segments,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.json();
  },

  // Analytics APIs
  getOrderAnalytics: async (period = 30) => {
    const response = await fetch(`${API_BASE_URL}/orders`);
    const orders = await response.json();
    return orders.filter(order => {
      const orderDate = new Date(order.created_at);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - period);
      return orderDate >= cutoffDate;
    });
  },

  getProductAnalytics: async () => {
    const [productsRes, ordersRes, orderItemsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/orders`),
      fetch(`${API_BASE_URL}/order_items`),
      fetch(`${API_BASE_URL}/categories`)
    ]);

    const [products, orders, orderItems, categories] = await Promise.all([
      productsRes.json(),
      ordersRes.json(),
      orderItemsRes.json(),
      categoriesRes.json()
    ]);

    return {
      products,
      orders,
      orderItems,
      categories
    };
  },

  getCustomerAnalytics: async () => {
    const [usersRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/users`),
      fetch(`${API_BASE_URL}/orders`)
    ]);

    const [users, orders] = await Promise.all([
      usersRes.json(),
      ordersRes.json()
    ]);

    const customers = users.filter(user => user.role === 'customer');
    return { customers, orders };
  },

  getInventoryAnalytics: async () => {
    const [productsRes, orderItemsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/order_items`)
    ]);

    const [products, orderItems] = await Promise.all([
      productsRes.json(),
      orderItemsRes.json()
    ]);

    return { products, orderItems };
  },

  // Marketing APIs
  getDiscount: async (id) => {
    const response = await fetch(`${API_BASE_URL}/discounts/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch discount');
    }
    return response.json();
  },

  getDiscounts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/discounts?${queryString}`);
    return response.json();
  },

  createDiscount: async (discountData) => {
    const response = await fetch(`${API_BASE_URL}/discounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...discountData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    return response.json();
  },

  updateDiscount: async (id, discountData) => {
    const response = await fetch(`${API_BASE_URL}/discounts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...discountData,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.json();
  },

  deleteDiscount: async (id) => {
    await fetch(`${API_BASE_URL}/discounts/${id}`, {
      method: 'DELETE',
    });
  },

  // Campaign APIs
  getCampaign: async (id) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch campaign');
    }
    return response.json();
  },

  getCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/campaigns?${queryString}`);
    return response.json();
  },

  createCampaign: async (campaignData) => {
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...campaignData,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create campaign');
    }
    return response.json();
  },

  updateCampaign: async (id, campaignData) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...campaignData,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update campaign');
    }
    return response.json();
  },

  deleteCampaign: async (id) => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete campaign');
    }
  },

  // Coupon APIs
  getCoupon: async (id) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch coupon');
    }
    return response.json();
  },

  getCoupons: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/coupons?${queryString}`);
    return response.json();
  },

  createCoupon: async (couponData) => {
    const response = await fetch(`${API_BASE_URL}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...couponData,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create coupon');
    }
    return response.json();
  },

  updateCoupon: async (id, couponData) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...couponData,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update coupon');
    }
    return response.json();
  },

  deleteCoupon: async (id) => {
    const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete coupon');
    }
  },

  // Email Marketing APIs
  getEmailTemplate: async (id) => {
    const response = await fetch(`${API_BASE_URL}/email_templates/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch email template');
    }
    return response.json();
  },

  getEmailTemplates: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/email_templates?${queryString}`);
    return response.json();
  },

  createEmailTemplate: async (templateData) => {
    const response = await fetch(`${API_BASE_URL}/email_templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...templateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create email template');
    }
    return response.json();
  },

  updateEmailTemplate: async (id, templateData) => {
    const response = await fetch(`${API_BASE_URL}/email_templates/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...templateData,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update email template');
    }
    return response.json();
  },

  deleteEmailTemplate: async (id) => {
    const response = await fetch(`${API_BASE_URL}/email_templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete email template');
    }
  },

  sendTestEmail: async (templateId) => {
    const response = await fetch(`${API_BASE_URL}/email_templates/${templateId}/send-test`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to send test email');
    }
    return response.json();
  },

  // Email Campaign Analytics
  getEmailAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/email_analytics`);
    return response.json();
  },

  // Marketing Dashboard Stats
  getMarketingStats: async () => {
    const [discounts, campaigns, coupons, emailStats] = await Promise.all([
      fetch(`${API_BASE_URL}/discounts`).then(res => res.json()),
      fetch(`${API_BASE_URL}/campaigns`).then(res => res.json()),
      fetch(`${API_BASE_URL}/coupons`).then(res => res.json()),
      fetch(`${API_BASE_URL}/email_analytics`).then(res => res.json()),
    ]);

    return {
      activeDiscounts: discounts.filter(d => d.status === 'active').length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalCouponsUsed: coupons.reduce((sum, c) => sum + c.usage_count, 0),
      emailStats,
    };
  },

  // User Profile APIs
  getProfile: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  },

  updateProfile: async (userId, profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileData,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  },

  changePassword: async (userId, { currentPassword, newPassword }) => {
    // First verify current password
    const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!userResponse.ok) {
      throw new Error('User not found');
    }
    const user = await userResponse.json();
    
    // In a real app, this would be done server-side with hashed passwords
    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: newPassword,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to change password');
    }
    return response.json();
  },

  // Dashboard APIs
  getDashboardStats: async () => {
    const [
      ordersResponse,
      productsResponse,
      usersResponse
    ] = await Promise.all([
      fetch(`${API_BASE_URL}/orders`),
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/users`)
    ]);

    const orders = await ordersResponse.json();
    const products = await productsResponse.json();
    const users = await usersResponse.json();
    const customers = users.filter(user => user.role === 'customer');

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const totalCustomers = customers.length;
    const totalProducts = products.length;

    // Get recent orders
    const recentOrders = orders
      .filter(order => order && order.created_at)
      .map(order => {
        // Find customer details
        const customer = customers.find(c => c.id === order.user_id);
        return {
          id: order.id,
          order_number: `ORD-${String(order.id).padStart(6, '0')}`,
          customer_name: customer?.full_name || 'Unknown Customer',
          total: order.total_amount || order.total || 0,
          status: order.status || 'pending',
          created_at: order.created_at
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Get top selling products
    const topProducts = products
      .filter(product => product)
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 5);

    // Generate revenue data for chart (last 7 days)
    const revenueData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      
      // Filter orders for this date
      const dailyOrders = orders.filter(order => 
        order && order.created_at &&
        new Date(order.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }) === dateStr
      );
      
      return {
        date: dateStr,
        revenue: dailyOrders.reduce((sum, order) => sum + (Number(order.total_amount) || Number(order.total) || 0), 0),
        orders: dailyOrders.length
      };
    }).reverse();

    return {
      stats: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
      },
      recentOrders,
      topProducts,
      revenueData,
    };
  },
}; 