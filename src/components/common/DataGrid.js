import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tooltip, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, ColumnHeightOutlined } from '@ant-design/icons';

const { Search } = Input;

const DataGrid = ({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  actions,
  searchable = true,
  loading = false,
  rowsPerPageOptions = [10, 25, 50, 100],
  size = 'middle',
  className = '',
}) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filteredData, setFilteredData] = useState(data);
  const [tableSize, setTableSize] = useState(size);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: rowsPerPageOptions[0],
      showSizeChanger: true,
      pageSizeOptions: rowsPerPageOptions,
      total: data.length,
      className: 'px-6 py-4',
    },
  });

  // Update filtered data and pagination when data prop changes
  useEffect(() => {
    setFilteredData(data);
    setTableParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: data.length,
      },
    }));
  }, [data]);

  // Update filtered data when search text changes
  useEffect(() => {
    if (!searchText) {
      setFilteredData(data);
      setTableParams(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          total: data.length,
        },
      }));
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = data.filter(record => {
      return columns.some(column => {
        const value = record[column.field];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });

    setFilteredData(filtered);
    setTableParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        total: filtered.length,
        current: 1,
      },
    }));
  }, [searchText, data, columns]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, confirm) => {
    clearFilters();
    setSearchText('');
    confirm();
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    filteredValue: searchedColumn === dataIndex ? [searchText] : null,
  });

  const enhancedColumns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, index) => {
        const { current, pageSize } = tableParams.pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    ...columns.map(column => ({
      ...column,
      title: column.header,
      dataIndex: column.field,
      key: column.field,
      sorter: column.sortable !== false && ((a, b) => {
        if (typeof a[column.field] === 'string') {
          return a[column.field].localeCompare(b[column.field]);
        }
        return a[column.field] - b[column.field];
      }),
      ...(column.filterable && getColumnSearchProps(column.field, column.header)),
      render: column.render || undefined,
    }))
  ];

  const getRowKey = (record) => record.id || record.key;

  const rowSelection = selectable ? {
    type: 'checkbox',
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
      onSelectionChange?.(selectedKeys);
    },
    selections: [
      {
        key: 'all-data',
        text: 'Select All Data',
        onSelect: () => {
          const allKeys = data.map(getRowKey);
          setSelectedRowKeys(allKeys);
          onSelectionChange?.(allKeys);
        },
      },
      {
        key: 'clear-all',
        text: 'Clear All',
        onSelect: () => {
          setSelectedRowKeys([]);
          onSelectionChange?.([]);
        },
      },
    ],
  } : undefined;

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  const refreshData = () => {
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  };

  // Size options with icons and labels
  const sizeOptions = [
    { label: 'Compact View', value: 'small', icon: <ColumnHeightOutlined style={{ fontSize: '12px' }} /> },
    { label: 'Normal View', value: 'middle', icon: <ColumnHeightOutlined style={{ fontSize: '14px' }} /> },
    { label: 'Large View', value: 'large', icon: <ColumnHeightOutlined style={{ fontSize: '16px' }} /> },
  ];

  return (
    <div className={` rounded-lg shadow ${className}`}>
      <div className="p-4 border-b flex justify-between items-start flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {searchable && (
            <Search
              placeholder="Search in all columns..."
              allowClear
              onSearch={(value) => setSearchText(value)}
              style={{ width: '100%' }}
            />
          )}
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshData}
            />
          </Tooltip>
        </div>
        <div>
          <Select
            value={tableSize}
            onChange={setTableSize}
            style={{ width: 140 }}
            options={sizeOptions}
            optionLabelProp="label"
            dropdownMatchSelectWidth={false}
            popupClassName="size-selector-dropdown"
          >
            {sizeOptions.map(option => (
              <Select.Option key={option.value} value={option.value} label={option.label}>
                <Space>
                  {option.icon}
                  {option.label}
                </Space>
              </Select.Option>
            ))}
          </Select>
          {actions}
        </div>
      </div>

      <Table
        rowKey={getRowKey}
        columns={enhancedColumns}
        dataSource={filteredData}
        rowSelection={rowSelection}
        onRow={onRowClick ? (record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: 'pointer' }
        }) : undefined}
        onChange={handleTableChange}
        pagination={{
          ...tableParams.pagination,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        loading={loading}
        scroll={{ x: 'max-content' }}
        size={tableSize}
        className="ant-table-cell-padding"
        style={{
          '--cell-padding-small': '8px 16px',
          '--cell-padding-middle': '12px 16px',
          '--cell-padding-large': '16px 16px',
        }}
      />
    </div>
  );
};

export default DataGrid; 