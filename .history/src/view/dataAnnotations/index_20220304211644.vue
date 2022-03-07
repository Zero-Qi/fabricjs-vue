<template>
  <BasicLayout>
    <div class="TrainingTasks">
      <div class="title">
        <BasicForm :searchForm="headForm" :searchData="headData" class="headForm" :searchHandle="headHandle" :inline="true" />
      </div>
      <BasicTable :tableHeader="tableHeader" :tableData="tableData">
        <template #handles="scope">
          <el-button type="success" @click="openDialog({ scope, type: 'fabric' })">标注</el-button>
          <el-button type="primary" @click="openDialog({ scope, type: 'check' })">查看</el-button>
          <el-button type="danger" @click="handleEdit(scope)">删除</el-button>
        </template>
      </BasicTable>
      <div class="foot">
        <BasicPagination
          :total="totalHead"
          :pageSize="pageSizeHead"
          @handleCurrentChange="handleCurrentChangeHead"
          @handleSizeChange="handleSizeChangeHead"
        />
      </div>

      <BasicDialog ref="dialogShow" :fullscreen="fullscreen" :title="dialogTitle" :handleStatus="true" @confirm="confirm" :width="dialogWidth">
        <TheFabric :scope="fabricScope" :key="new Date().getTime()" />
        <template v-if="openType.type == 'fabric'"> </template>
        <template v-if="openType.type == 'check'">
          <TheImgCanvas :arr="imageCanvaArr" />
          <BasicPagination :total="total" :pageSize="pageSize" @handleCurrentChange="handleCurrentChange" />
        </template>
        <template v-if="openType.type == 'upload'">
          <BasicUpload ref="uploadHttpRequest" :searchData="searchData" :httpRequest="httpRequest" />
        </template>
        <template v-if="openType.type == 'load'">
          <BasicForm
            class="loadForm"
            :searchForm="loadHeader"
            :searchData="loadData"
            :inline="true"
            :rules="rules"
            :searchHandle="searchHandle"
            :isHandle="true"
          />
          <TheImage :init="theImageInit" :loadType="loadData.loadType" ref="theImageRef" />
          <BasicPagination :total="total" :pageSize="pageSize" @handleCurrentChange="handleCurrentChange" />
        </template>
        <template v-if="openType.type == 'add'">
          <BasicForm :searchForm="taskHeader" :searchData="searchData" :rules="rules" ref="addForm" />
        </template>
      </BasicDialog>
    </div>
  </BasicLayout>
</template>
<script setup>
  import { tableHeader } from './dataTable.js'
  import {
    queryAnnotationsPerson,
    queryTagType,
    queryAnnotations,
    queryImgType,
    queryRegion,
    queryCatchPhoto,
    addImagData,
    queryWarnPhoto,
    delManage,
    queryFabricImg
  } from 'api/modules/dataAnnotations.js'
  import BasicTable from 'comp/global/BasicTable.vue'
  import BasicDialog from 'comp/global/BasicDialog.vue'
  import BasicLayout from 'comp/global/BasicLayout.vue'
  import BasicForm from 'comp/global/BasicForm.vue'
  import TheImgCanvas from 'comp/TheImgCanvas.vue'
  import BasicUpload from 'comp/global/BasicUpload.vue'
  import moment from 'moment'

  import TheImage from 'comp/TheImage.vue'
  import BasicPagination from 'comp/global/BasicPagination.vue'
  import { ElMessage } from 'element-plus'

  import TheFabric from 'comp/TheFabric.vue'

  import { vxRule } from 'utils/validator.js'
  import axios from 'axios'

  import { ref, reactive, onMounted, nextTick } from 'vue'
  const rules = reactive({
    fileName: vxRule(true, 'String', 'blur', '请输入文件名字'),
    labelType: vxRule(true, 'Array', 'blur', '请选择标签'),
    inChange: vxRule(true, 'Array', 'blur', '请选择负责人'),
    dataSource: vxRule(true, 'String', 'blur', '请选择数据来源')
  })
  const loadHeader = ref([
    {
      label: '开始时间',
      size: 'default',
      type: 'DateTime',
      prop: 'from'
    },
    {
      label: '结束时间',
      size: 'default',
      type: 'DateTime',
      prop: 'to'
    },
    {
      label: '区域',
      type: 'SelectTree',
      prop: 'regionIds',
      options: [],
      vals: ''
    },
    {
      label: '检索分类',
      type: 'Selects',
      prop: 'typeIds',
      change: (e) => {},
      options: []
    },
    {
      label: '导入方式',
      type: 'Select',
      prop: 'loadType',
      change: (e) => {},
      options: [
        {
          label: '一键导入',
          value: false
        },
        {
          label: '选择导入',
          value: true
        }
      ]
    }
  ])
  const headForm = ref([
    {
      label: '创建时间',
      size: 'default',
      type: 'datetimerange',
      prop: 'time'
    },
    {
      label: '标签类型',
      type: 'Select',
      prop: 'tagId',
      change: (e) => {},
      options: []
    },
    {
      label: '负责人',
      type: 'Select',
      prop: 'userId',
      change: (e) => {},
      options: []
    },
    {
      label: '数据来源',
      type: 'Select',
      prop: 'source',
      change: (e) => {},
      options: [
        {
          label: '全部',
          value: ''
        },
        {
          label: '导入数据',
          value: '导入数据'
        },
        {
          label: '抓拍数据',
          value: '抓拍数据'
        },
        {
          label: '预警数据',
          value: '预警数据'
        }
      ]
    }
  ])
  const headData = ref({
    time: [],
    tagId: '',
    userId: '',
    source: ''
  })
  const headHandle = [
    {
      label: '查询',
      type: 'default',
      handle: (e) => {
        query(headData.value)
      }
    },
    {
      label: '新增',
      type: 'default',
      handle: () => {
        openDialog({ type: 'add' })
      }
    }
  ]
  const taskHeader = ref([
    {
      label: '文件名称',
      size: 'default',
      type: 'Input',
      prop: 'fileName'
    },
    {
      label: '数据来源',
      type: 'Select',
      prop: 'dataSource',
      change: (e) => {},
      options: [
        {
          label: '导入数据',
          value: '导入数据'
        },
        {
          label: '抓拍数据',
          value: '抓拍数据'
        },
        {
          label: '预警数据',
          value: '预警数据'
        }
      ]
    },
    {
      label: '标签类型',
      type: 'Selects',
      prop: 'labelType',
      change: (e) => {},
      multiple: false,
      collapseTtags: false,
      options: []
    },
    {
      label: '负责人',
      type: 'Selects',
      prop: 'inChange',
      change: (e) => {},
      options: []
    }
  ])
  const searchHandle = [
    {
      label: '搜索',
      type: 'default',
      handle: (e) => {
        let regionIds = loadData.value.regionIds.map((item) => {
          return item.id
        })
        if (searchData.value.dataSource == '预警数据') {
          queryWarnPhoto({
            page: theImageInit.value.currentPage,
            size: theImageInit.value.size,
            from: loadData.value.from,
            to: loadData.value.to,
            typeIds: loadData.value.typeIds.toString(),
            regionIds: regionIds.toString()
          }).then((res) => {
            theImageInit.value.imgArr = res.data.content.map((item) => {
              return String(item.srcPhoto)
            })
            theImageInit.value.imgUrl = res.data.content.map((item) => {
              return item.srcPhoto
            })
            total.value = res.data.totalElements
          })
        } else {
          queryCatchPhoto({
            page: theImageInit.value.currentPage,
            size: theImageInit.value.size,
            from: loadData.value.from,
            to: loadData.value.to,
            typeIds: loadData.value.typeIds.toString(),
            regionIds: regionIds.toString()
          }).then((res) => {
            theImageInit.value.imgArr = res.data.content.map((item) => {
              return String(item.srcPhoto)
            })
            theImageInit.value.imgUrl = res.data.content.map((item) => {
              return item.srcPhoto
            })
            total.value = res.data.totalElements
          })
        }
      }
    }
  ]
  const theImageCanvasInit = ref({})
  const tableData = ref([])
  const theImageRef = ref(null)
  const cuuentPage = ref(1)
  const pageSize = ref(50)
  const total = ref(null)
  const uploadHttpRequest = ref({})
  const staticData = ref({})
  const imageCanvaArr = ref([])
  const theImageInit = ref({
    currentPage: 1,
    size: 50,
    imgArr: [],
    imgUrl: []
  })
  const addForm = ref(null)
  const dialogShow = ref(null)
  const fullscreen = ref(false)
  const openType = ref({})
  const handleStatus = ref(false)
  const dialogTitle = ref('')
  const dialogWidth = ref('50%')
  const totalHead = ref(null)
  const pageSizeHead = ref(10)
  const currentHead = ref(1)
  const fabricScope = ref({})
  const searchData = ref({
    fileName: '',
    labelType: [],
    inChange: [],
    dataSource: '导入数据'
  })
  const loadData = ref({
    from: '',
    to: '',
    regionIds: '',
    typeIds: [],
    loadType: null
  })
  const loadDataForm = ref({
    region: '',
    classification: 1,
    startTime: 1,
    endTime: 1
  })
  const openDialog = ({ scope, type }) => {
    dialogWidth.value = '1600px'
    dialogTitle.value = ''
    fullscreen.value = false
    handleStatus.value = false
    if (type == 'fabric') {
      openType.value.type = 'fabric'
      fullscreen.value = true
      fabricScope.value = scope.scope.row

    } else if (type == 'check') {
      queryFabricImg({
        id: scope.scope.row.id,
        page: 1,
        size: 50
      }).then((res) => {
        imageCanvaArr.value = res.data.content
      })
      openType.value.type = 'check'
    } else if (type == 'add') {
      dialogTitle.value = '新增'
      handleStatus.value = true
      openType.value.type = 'add'
      searchData.value = {
        fileName: '',
        labelType: [],
        inChange: [],
        dataSource: '导入数据'
      }
    }
    dialogShow.value.dialogTableVisible = true
  }
  const handleSizeChangeHead = (val) => {
    pageSizeHead.value = val
    query()
  }
  const handleCurrentChangeHead = (val) => {
    currentHead.value = val.page
    query(headData.value)
  }
  const query = (data) => {
    let datas = {
      from: data?.time[0] ?? '1970-2-28 14:13:47',
      to: data?.time[1] ?? moment().format('YYYY-MM-DD HH:mm:ss'),
      tagId: data?.tagId ?? '',
      userId: data?.userId ?? '',
      source: data?.source ?? '',
      size: pageSizeHead.value,
      page: currentHead.value
    }
    queryAnnotations(datas).then((res) => {
      totalHead.value = res.data.totalElements
      tableData.value = res.data.content.map((item) => {
        item.trainTagDtosOld = item.trainTagDtos
        item.trainTagDtos = item.trainTagDtos.map((items) => {
          return items.name
        })
        item.userDtos = item.userDtos.map((items) => {
          return items.name
        })
        item.progress = item.label == item.count ? '完成' : `进度${item.label}/${item.count}`
        return item
      })
    })
  }
  const confirm = () => {
    if (openType.value.type == 'add') {
      addForm.value.formValidate().then(() => {
        searchData.value.dataSource == '导入数据'
          ? (openType.value.type = 'upload')
          : ((openType.value.type = 'load'), (dialogWidth.value = '1600px'))
      })
    } else if (openType.value.type == 'upload') {
      uploadHttpRequest.value.uploadSubmit()
    } else if (openType.value.type == 'load') {
      loadConfirm()
    }
  }
  const httpRequest = (param) => {
    let fileObj = param.file // 相当于input里取得的files
    let fd = new FormData() // FormData 对象
    fd.append('file', fileObj) // 文件对象
    fd.append('path', searchData.value?.fileName) // 文件对象
    fd.append('source', searchData.value?.dataSource) // 文件对象
    fd.append('users', searchData.value?.inChange.toString()) // 文件对象
    fd.append('trainTags', searchData.value?.labelType.toString()) // 文件对象
    axios
      .post('/api/api/train/manage/import', fd, {
        onUploadProgress: (progressEvent) => {
          let percent = ((progressEvent.loaded / progressEvent.total) * 100) | 0
          //调用onProgress方法来显示进度条，需要传递个对象 percent为进度值
          uploadHttpRequest.value.uploadModel.onProgress({ percent: percent })
        }
      })
      .then((res) => {
        ElMessage({
          showClose: true,
          message: '成功上传',
          type: 'success'
        })
      })
  }
  const handleCurrentChange = (val) => {
    let regionIds = loadData.value.regionIds.map((item) => {
      return item.id
    })
    theImageInit.value.currentPage = val.page
    queryCatchPhoto({
      page: theImageInit.value.currentPage,
      size: theImageInit.value.size,
      from: loadData.value.from,
      to: loadData.value.to,
      typeIds: loadData.value.typeIds.toString(),
      regionIds: regionIds.toString()
    }).then((res) => {
      theImageInit.value.imgArr = res.data.content.map((item) => {
        return String(item.srcPhoto)
      })
      theImageInit.value.imgUrl = res.data.content.map((item) => {
        return item.srcPhoto
      })
      total.value = res.data.totalElements

      // console.log(total.value, pageSize.value)
    })
  }

  const loadConfirm = () => {
    let trainPhotos = ''
    theImageRef.value.allCheck.forEach((res) => {
      trainPhotos += res.toString()
    })
    let regionIds = loadData.value.regionIds.map((res) => {
      return res.id
    })
    let fd = new FormData()
    fd.append('path', searchData.value.fileName)
    fd.append('source', searchData.value.dataSource)
    fd.append('users', searchData.value.inChange.toString())
    fd.append('trainTags', searchData.value.labelType.toString())
    fd.append('from', loadData.value.from)
    fd.append('to', loadData.value.to)
    fd.append('trainPhotos', trainPhotos)
    fd.append('regionIds', regionIds.toString())
    fd.append('typeIds', loadData.value.typeIds.toString())
    fd.append('size', 10000)
    addImagData(fd).then((res) => {
      console.log(res)
    })
  }
  const beforeClose = () => {}
  const resetForm = () => {}
  const handleEdit = (e) => {
    delManage({ id: e.scope.row.id }).then((res) => {
      ElMessage({
        showClose: true,
        message: '删除成功',
        type: 'success'
      })
      query()
    })
  }
  const init = () => {
    query()
    queryAnnotationsPerson({}).then((res) => {
      let map = res.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      })

      staticData.value.charge = res.data
      taskHeader.value[3].options = map
      headForm.value[2].options = map
    })
    queryTagType({}).then((res) => {
      let map = res.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      })
      staticData.value.labelType = res.data
      headForm.value[1].options = map
      taskHeader.value[2].options = map
    })
    queryImgType({}).then((res) => {
      let data = []
      for (const index in res.data) {
        data.push({
          label: res.data[index],
          value: index
        })
      }

      loadHeader.value[3].options = data
      // console.log(data)
    })
    queryRegion({}).then((res) => {
      // console.log(res)
      loadHeader.value[2].options = res.data
    })
  }
  onMounted(() => {
    init()
  })
</script>
<style lang="scss" scoped>
  .loadForm:deep(.el-input) {
    width: 175px;
  }
  .headForm:deep(.el-input) {
    width: 160px;
  }
  .title {
    min-width: 1600px;
    display: flex;
    justify-content: space-between;
  }
  .foot {
    display: flex;
    justify-content: end;
  }
</style>
