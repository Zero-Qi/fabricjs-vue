export const tableHeader = [
  {
    type: 'index', //类型是操作按钮
    width: '100', //表格列所占宽度
    label: '序号', //表格列名
  },
  {
    prop: 'path', //字段
    label: '文件名称', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },
  {
    prop: 'createTime', //字段
    label: '创建时间', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },
  {
    prop: 'trainTagDtos', //字段
    label: '标签类型', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },
  {
    prop: 'label', //字段
    label: '标签数量', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },
  {
    prop: 'source', //字段
    label: '数据来源', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },
  {
    prop: 'userDtos', //字段
    label: '负责人', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },
  {
    prop: 'progress', //字段
    label: '标注进度', //表格列名
    align: 'center', //表格列数据对其方式
    width: '100',
    fixed: false
  },

  {
    type: 'handle', //类型是操作按钮
    width: '200', //表格列所占宽度
    label: '操作', //表格列名
    align: 'center', //表格列数据对其方式
    fixed: 'right' //表格列是否固定，固定到右端
  }
]