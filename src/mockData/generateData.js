import { faker } from '@faker-js/faker';

const generateCategories = (count) => {
  const categories = [];
  const mainCategories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Beauty', 'Sports'];
  
  // Generate main categories
  mainCategories.forEach(name => {
    categories.push({
      id: faker.string.uuid(),
      name,
      description: faker.commerce.productDescription(),
      parent_id: null,
    });
  });

  // Generate subcategories
  for (let i = 0; i < count - mainCategories.length; i++) {
    categories.push({
      id: faker.string.uuid(),
      name: faker.commerce.productAdjective() + ' ' + faker.helpers.arrayElement(mainCategories),
      description: faker.commerce.productDescription(),
      parent_id: faker.helpers.arrayElement(categories.slice(0, mainCategories.length)).id,
    });
  }
  return categories;
};

const generateUsers = (count) => {
  const users = [
    // Default Admin Users
    {
      id: '1a2b3c4d-5e6f-7g8h-9i0j',
      email: 'admin@admin.com',
      password: '$2a$10$XgXB8g5jL5K4T5/MvE1XqOJHLF6LQz2OxO3Yy0q3IbCz6861zxp9W', // "admin123"
      full_name: 'Super Admin',
      role: 'admin',
      created_at: faker.date.past(),
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff`,
    },
    {
      id: faker.string.uuid(),
      email: 'asad@admin.com',
      password: '$2a$10$XgXB8g5jL5K4T5/MvE1XqOJHLF6LQz2OxO3Yy0q3IbCz6861zxp9W', // "admin123"
      full_name: 'Asadullah Sarker',
      role: 'admin',
      created_at: faker.date.past(),
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=Asadullah+Sarker&background=2E8B57&color=fff`,
    },
    // Default Regular Users
    {
      id: faker.string.uuid(),
      email: 'john@example.com',
      password: '$2a$10$XgXB8g5jL5K4T5/MvE1XqOJHLF6LQz2OxO3Yy0q3IbCz6861zxp9W', // "admin123"
      full_name: 'John Doe',
      role: 'customer',
      created_at: faker.date.past(),
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=John+Doe&background=4B0082&color=fff`,
    },
    {
      id: faker.string.uuid(),
      email: 'jane@example.com',
      password: '$2a$10$XgXB8g5jL5K4T5/MvE1XqOJHLF6LQz2OxO3Yy0q3IbCz6861zxp9W', // "admin123"
      full_name: 'Jane Smith',
      role: 'customer',
      created_at: faker.date.past(),
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=Jane+Smith&background=800000&color=fff`,
    }
  ];

  // Generate additional random users
  for (let i = users.length; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    
    users.push({
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: '$2a$10$XgXB8g5jL5K4T5/MvE1XqOJHLF6LQz2OxO3Yy0q3IbCz6861zxp9W', // "admin123"
      full_name: fullName,
      role: faker.helpers.arrayElement(['customer', 'customer', 'customer', 'admin']), // 25% chance of being admin
      created_at: faker.date.past(),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=${faker.helpers.arrayElement(['1ABC9C', '2ECC71', '3498DB', '9B59B6', 'E67E22', 'E74C3C'])}&color=fff`,
    });
  }

  return users;
};

const generateProductVariants = (productId) => {
  const variants = [];
  const variantCount = faker.number.int({ min: 1, max: 4 });

  for (let i = 0; i < variantCount; i++) {
    variants.push({
      id: faker.string.uuid(),
      product_id: productId,
      name: faker.commerce.productMaterial(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      price: parseFloat(faker.commerce.price()),
      stock_quantity: faker.number.int({ min: 0, max: 100 }),
    });
  }
  return variants;
};

const generateProducts = (count, categories) => {
  const products = [];
  const productVariants = [];
  const productStatus = ['active', 'inactive', 'out_of_stock', 'discontinued'];

  for (let i = 0; i < count; i++) {
    const productId = faker.string.uuid();
    const category = faker.helpers.arrayElement(categories);
    
    // Find parent category if this is a subcategory
    let categoryName = category.name;
    if (category.parent_id) {
      const parentCategory = categories.find(c => c.id === category.parent_id);
      if (parentCategory) {
        categoryName = `${parentCategory.name} > ${category.name}`;
      }
    }

    products.push({
      id: productId,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      stock_quantity: faker.number.int({ min: 0, max: 1000 }),
      category_id: category.id,
      category_name: categoryName,
      status: faker.helpers.arrayElement(productStatus),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    });

    // Generate variants for this product
    productVariants.push(...generateProductVariants(productId));
  }
  return { products, productVariants };
};

const generateOrders = (count, users, products) => {
  const orders = [];
  const orderItems = [];
  const orderStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const customers = users.filter(user => user.role === 'customer');

  for (let i = 0; i < count; i++) {
    const orderId = faker.string.uuid();
    const orderItemsCount = faker.number.int({ min: 1, max: 5 });
    let totalAmount = 0;

    // Generate order items
    for (let j = 0; j < orderItemsCount; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const unitPrice = parseFloat(product.price);
      
      orderItems.push({
        id: faker.string.uuid(),
        order_id: orderId,
        product_id: product.id,
        quantity,
        unit_price: unitPrice,
      });

      totalAmount += quantity * unitPrice;
    }

    orders.push({
      id: orderId,
      user_id: faker.helpers.arrayElement(customers).id,
      status: faker.helpers.arrayElement(orderStatus),
      total_amount: totalAmount,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    });
  }

  return { orders, orderItems };
};

const generateCommunications = (users) => {
  const types = ['email', 'phone', 'meeting', 'note'];
  const statuses = ['sent', 'received', 'completed', 'pending'];
  const subjects = [
    'Order confirmation', 
    'Shipping update', 
    'Customer support', 
    'Product inquiry',
    'Return request',
    'Feedback follow-up'
  ];

  const customers = users.filter(user => user.role === 'customer');
  return customers.flatMap(customer => 
    Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => ({
      id: faker.string.uuid(),
      user_id: customer.id,
      type: faker.helpers.arrayElement(types),
      subject: faker.helpers.arrayElement(subjects),
      message: faker.lorem.paragraph(),
      date: faker.date.past(),
      status: faker.helpers.arrayElement(statuses),
    }))
  );
};

const addCustomerData = (users) => {
  const segments = ['VIP', 'Regular', 'New', 'At Risk', 'Dormant'];
  const lifetimeValues = ['High Value', 'Medium Value', 'Low Value'];
  const purchaseFrequencies = ['Frequent', 'Regular', 'Occasional', 'Rare'];

  return users.map(user => {
    if (user.role === 'customer') {
      return {
        ...user,
        phone: faker.phone.number('+1 ###-###-####'),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
        segments: faker.helpers.arrayElements(segments, faker.number.int({ min: 1, max: 3 })),
        lifetime_value: faker.helpers.arrayElement(lifetimeValues),
        purchase_frequency: faker.helpers.arrayElement(purchaseFrequencies),
        total_orders: faker.number.int({ min: 0, max: 50 }),
        total_spent: parseFloat(faker.commerce.price({ min: 0, max: 10000 })),
        last_purchase: faker.date.recent(),
        notes: faker.lorem.sentences(2),
      };
    }
    return user;
  });
};

// Generate the complete database
const categories = generateCategories(20);
const users = generateUsers(50);
const { products, productVariants } = generateProducts(100, categories);
const { orders, orderItems } = generateOrders(200, users, products);

const enrichedUsers = addCustomerData(users);
const communications = generateCommunications(enrichedUsers);

// Generate Discounts
const generateDiscounts = (count = 20) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productAdjective() + ' ' + faker.word.noun() + ' Discount',
    type: faker.helpers.arrayElement(['percentage', 'fixed_amount']),
    value: faker.number.float({ min: 5, max: 50, precision: 2 }),
    start_date: faker.date.future(),
    end_date: faker.date.future(),
    min_purchase_amount: faker.number.float({ min: 0, max: 200, precision: 2 }),
    usage_limit: faker.number.int({ min: 50, max: 1000 }),
    usage_count: faker.number.int({ min: 0, max: 50 }),
    status: faker.helpers.arrayElement(['active', 'scheduled', 'expired', 'disabled']),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));
};

// Generate Campaigns
const generateCampaigns = (count = 15) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.catchPhrase() + ' Campaign',
    description: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(['seasonal', 'holiday', 'flash_sale', 'clearance']),
    start_date: faker.date.future(),
    end_date: faker.date.future(),
    target_audience: faker.helpers.arrayElements(['new_customers', 'existing_customers', 'vip', 'all'], 2),
    budget: faker.number.float({ min: 1000, max: 10000, precision: 2 }),
    status: faker.helpers.arrayElement(['draft', 'active', 'scheduled', 'completed', 'cancelled']),
    metrics: {
      impressions: faker.number.int({ min: 1000, max: 100000 }),
      clicks: faker.number.int({ min: 100, max: 5000 }),
      conversions: faker.number.int({ min: 10, max: 500 }),
      revenue: faker.number.float({ min: 1000, max: 50000, precision: 2 }),
    },
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));
};

// Generate Coupons
const generateCoupons = (count = 30) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    code: faker.string.alphanumeric(8).toUpperCase(),
    description: faker.lorem.sentence(),
    discount_type: faker.helpers.arrayElement(['percentage', 'fixed_amount']),
    discount_value: faker.number.float({ min: 5, max: 50, precision: 2 }),
    start_date: faker.date.future(),
    end_date: faker.date.future(),
    minimum_purchase: faker.number.float({ min: 0, max: 200, precision: 2 }),
    usage_limit: faker.number.int({ min: 1, max: 100 }),
    usage_count: faker.number.int({ min: 0, max: 50 }),
    is_single_use: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(['active', 'expired', 'used']),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));
};

// Generate Email Templates
const generateEmailTemplates = (count = 10) => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName() + ' Template',
    subject: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    type: faker.helpers.arrayElement(['welcome', 'promotional', 'abandoned_cart', 'order_confirmation', 'newsletter']),
    status: faker.helpers.arrayElement(['active', 'draft', 'archived']),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));
};

const db = {
  categories,
  users: enrichedUsers,
  products,
  product_variants: productVariants,
  orders,
  order_items: orderItems,
  communications,
  discounts: generateDiscounts(),
  campaigns: generateCampaigns(),
  coupons: generateCoupons(),
  email_templates: generateEmailTemplates(),
  stats: {
    total_revenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
    total_orders: orders.length,
    total_customers: enrichedUsers.filter(user => user.role === 'customer').length,
    total_products: products.length,
    recent_sales: Array.from({ length: 7 }, () => ({
      date: faker.date.recent(),
      amount: faker.number.int({ min: 1000, max: 50000 }),
    })),
  },
};

export default db; 