<template>
  <div class="maintenancePlanAdd">
    <div class="child-panel-title">
      <el-button @click="loadImg(-1)">上一张</el-button>
      <el-button @click="loadImg(1)">下一张</el-button>
    </div>
    <div class="main">
      <div class="main-left">
        <div :key="idx" @click="typeChange(item.name)" v-for="(item, idx) in toolsArr" :title="item.title">
          <i :class="item.icon"></i>
        </div>
      </div>
      <div class="main-mid">
        <canvas id="canvas" width="1280" height="720"></canvas>
      </div>
      <div class="main-right">
        <div class="main-right-panel">
          <el-button>删除标记</el-button>
          <el-button style="margin-left: 0px">负样本</el-button>
          <el-select v-model="selColor" placeholder="请选择标注类型" @change="selType">
            <el-option v-for="item in scope.trainTagDtosOld" :key="item.id" :label="item.name" :value="item.id"> </el-option>
          </el-select>
          <el-checkbox v-model="checked1" label="跳过已提交的样本"></el-checkbox>
          <br />
          <el-button @click="save">保存当前图片</el-button>
          <el-button @click="submit">提交全部</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ElMessage } from 'element-plus'

  import { ref, reactive, onMounted } from 'vue'
  import { fabric } from 'fabric'
  import { queryFabricImg, addFabricJson, commitAnnotations } from 'api/modules/dataAnnotations.js'
  const props = defineProps({
    scope: {
      type: Object
    },
    pageCurrent: {
      type: String
    }
  })
  const page = ref(0)
  const blockColor = ref(null)
  const typeId = ref(null)
  const photoId = ref(null)
  const dataId = ref(null)
  const photoName = ref(null)
  let currentType = ref('default')
  let spaceKeyState = ref(false)
  let downPoint = reactive({})
  let upPoint = reactive({})
  let canvas = reactive({})
  const checked1 = ref(null)

  const toolsArr = reactive([
    // {
    //   name: 'undo',
    //   icon: 'icon-undo',
    //   title: '上一步'
    // },
    // {
    //   name: 'redo',
    //   icon: 'icon-redo',
    //   title: '下一步'
    // },
    {
      name: 'reset',
      icon: 'icon-clear',
      title: '重置'
    },
    {
      name: 'default',
      icon: 'icon-xuanze',
      title: '选择'
    },
    {
      name: 'rect',
      icon: 'icon-juxing',
      title: '矩形'
    },
    {
      name: 'remove',
      icon: 'icon-del',
      title: '移除'
    }
    // {
    //   name: 'img',
    //   icon: 'icon-png',
    //   title: '导入图片'
    // }
  ])
  const selColor = ref()
  const options = [
    {
      value: '1',
      label: '行人'
    },
    {
      value: '2',
      label: '工程车'
    },
    {
      value: '3',
      label: '烟'
    },
    {
      value: '4',
      label: '火'
    }
  ]
  // 初始化画板
  function initCanvas() {
    canvas = new fabric.Canvas('canvas')
    canvas.on('mouse:down', canvasMouseDown) // 鼠标在画布上按下
    canvas.on('mouse:move', canvasMouseMove) // 鼠标在画布上移动
    canvas.on('mouse:up', canvasMouseUp) // 鼠标在画布上松开
    canvas.on('mouse:wheel', canvasMouseWheel) // 鼠标滚轮在画布上的事件
    canvas.on({
      'selection:created': (e) => {
        if (currentType.value == 'remove') {
          canvas.remove(e.target)
        }
      }
    })
    canvas.selectionBorderColor = 'red' // 画布鼠标框选时的边框颜色
    blockColor.value = props.scope.trainTagDtosOld[0].color
    canvas.selectionColor = 'transparent'
    canvas.selectionLineWidth = 2
    if (props.scope.id) {
      loadImg(1)
    }
  }
  function submit() {
    let data = new FormData()
    data.append('id', dataId.value)
    commitAnnotations(
      data,
    ).then((res) => {
      console.log(res)
    })
  }
  function save() {
    let allObj = canvas.getObjects()
    let res = []
    let img = {}
    allObj.forEach((element) => {
      let tl = { x: 0, y: 0 }
      let br = { x: 0, y: 0 }
      if (element.types == 'image') {
        img.width = element.aCoords.tr.x
        img.height = element.aCoords.bl.y
      }
      if (element.types == 'rect') {
        tl = element.aCoords.tl
        br = element.aCoords.br
        res.push({
          cls: element.typeId,
          bbox: [element.aCoords.tl.x, element.aCoords.br.x, element.aCoords.tl.y, element.aCoords.br.y, img.width, img.height],
          color: element.bzcolor
        })
      }
    })
    let data = Array.from(new Set(res.map((item) => item.cls))).map((ii) => {
      let kk = res.filter((jj) => {
        if (jj.cls == ii) {
          return jj
        } else {
          return false
        }
      })
      return kk
    })
    addFabricJson(
      JSON.stringify({
        dataId: dataId.value,
        photoId: photoId.value,
        page: page.value,
        photoName: photoName.value,
        type: '导入数据',
        list: data
      })
    ).then((res) => {
      console.log(res)
    })
    console.log()
  }
  // 创建矩形
  function createRect() {
    // 点击事件，不生成矩形
    if (JSON.stringify(downPoint) === JSON.stringify(upPoint)) {
      return
    }
    // 创建矩形
    // 矩形参数计算
    let top = downPoint.y > upPoint.y ? upPoint.y : downPoint.y
    let left = downPoint.x > upPoint.x ? upPoint.x : downPoint.x
    let width = Math.abs(downPoint.x - upPoint.x)
    let height = Math.abs(downPoint.y - upPoint.y)
    // 矩形对象
    const rect = new fabric.Rect({
      top,
      left,
      width,
      height,
      fill: blockColor.value,
      stroke: '#000',
      opacity: 0.5,
      types: 'rect',
      typeId: typeId.value,
      bzcolor: blockColor.value
    })
    console.log(top, left, width, height)
    rect.setControlsVisibility({ mtr: false })
    // 将矩形添加到画布上
    canvas.add(rect)
    // 选中刚创建的矩形
    canvas.setActiveObject(rect)
  }

  // 鼠标在画布上按下
  function canvasMouseDown(e) {
    downPoint = canvas.getPointer(e)
    if (spaceKeyState.value) {
      canvas.isDragging = true
      canvas.lastPosX = e.e.clientX
      canvas.lastPosY = e.e.clientY
      canvas.selection = false // 移动时不出现框选样式
    }
  }
  //载入图片
  function loadImg(val = 0) {
    page.value = page.value + val
    if (page.value >= 0) {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      canvas.clear()
      queryFabricImg({
        page: page.value,
        id: props.scope.id,
        size: 1
      })
        .then((res) => {
          ;(photoId.value = res.data.content[0].id),
            (dataId.value = res.data.content[0].dataId),
            (photoName.value = res.data.content[0].photoName),
            (page.value = res.data.number)
          new fabric.Image.fromURL(
            res.data.content[0].httpPath,
            (oImg) => {
              oImg.scale(0.8)
              // canvas.add(oImg)
              canvas.insertAt(oImg, 0)
            },
            {
              selectable: false,
              types: 'image'
            }
          )
          showRect(JSON.parse(res.data.content[0].json))
        })
        .catch((res) => {})
    } else {
      ElMessage({
        showClose: true,
        message: '最后一张',
        type: 'error'
      })
    }
  }
  //showRect
  function showRect(arr) {
    arr.forEach((element) => {
      element.forEach((ii) => {
        const rect = new fabric.Rect({
          top: ii.bbox[2],
          left: ii.bbox[0],
          width: ii.bbox[1] - ii.bbox[0] - 1,
          height: ii.bbox[3] - ii.bbox[2] - 1,
          fill: ii.color,
          stroke: '#000',
          opacity: 0.5,
          types: 'rect',
          typeId: typeId.value,
          bzcolor: ii.color
        })

        // 将矩形添加到画布上
        canvas.add(rect)
      })
    })
  }
  // 画布操作类型切换
  function typeChange(opt) {
    currentType.value = opt
    if (currentType.value == 'reset') {
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
      canvas.clear()
      // updateModifications(true)
      return
    }
    if (currentType.value == 'img') {
      return
    }
    if (currentType.value == 'remove') {
      canvas.selection = true
      canvas.selectable = true
      canvas.skipTargetFind = false
      canvas.discardActiveObject().renderAll()
      return
    }
    if (opt === 'default') {
      canvas.selection = true
      ;(canvas.selectionColor = 'rgba(100, 100, 255, 0.3)'),
        (canvas.selectionBorderColor = 'rgba(255, 255, 255, 0.3)'),
        (canvas.selectionLineWidth = 1)
      canvas.skipTargetFind = false // 允许选中
    } else {
      ;(canvas.selectionColor = 'transparent'), (canvas.selectionBorderColor = 'rgba(0, 0, 0, 0.2)'), (canvas.selectionLineWidth = 1)
      canvas.skipTargetFind = true // 禁止选中
    }
  }

  // 鼠标在画布上移动
  function canvasMouseMove(e) {
    if (spaceKeyState.value) {
      // 按住空格时，鼠标指针是手掌
      canvas.setCursor('grab')
    }

    // 拖拽画布
    if (canvas.isDragging) {
      // 拖拽时，鼠标指针是抓
      canvas.setCursor('grabbing')
      const vpt = canvas.viewportTransform // 聚焦视图的转换
      vpt[4] += e.e.clientX - canvas.lastPosX
      vpt[5] += e.e.clientY - canvas.lastPosY
      canvas.requestRenderAll()
      canvas.lastPosX = e.e.clientX
      canvas.lastPosY = e.e.clientY
    }
  }

  // 鼠标在画布上松开
  function canvasMouseUp(e) {
    upPoint = canvas.getPointer(e)
    if (canvas.isDragging) {
      canvas.setViewportTransform(canvas.viewportTransform) // 设置此画布实例的视口转换
      canvas.isDragging = false
      canvas.selection = true // 移动结束后还原框选样式
      return
    }
    switch (currentType.value) {
      case 'default':
        console.log('框选')
        break
      case 'rect':
        console.log('创建矩形')
        createRect()
        break
    }
  }

  // 鼠标滚轮在画布上的事件
  function canvasMouseWheel(opt) {
    const delta = opt.e.deltaY // 滚轮，向上滚一下是 -100，向下滚一下是 100
    let zoom = canvas.getZoom() // 获取画布当前缩放值
    zoom *= 0.999 ** delta
    if (zoom > 20) zoom = 20
    if (zoom < 0.01) zoom = 0.01
    canvas.zoomToPoint(
      {
        x: opt.e.offsetX,
        y: opt.e.offsetY
      },
      zoom
    )
    opt.e.preventDefault()
    opt.e.stopPropagation()
  }

  // 全局键盘事件 按下
  function keyDown(e) {
    // console.log(e.keyCode)
    if (e.keyCode === 32) {
      // 空格键
      spaceKeyState.value = true
      if (!canvas.isDragging) {
        // 在非拖拽时按下空格，鼠标指针是个手
        canvas.setCursor('grab')
      }
    }
  }

  // 全局键盘事件 抬起
  function keyUp(e) {
    // console.log(e.keyCode)
    if (e.keyCode === 32) {
      // 空格键
      spaceKeyState.value = false
      canvas.setCursor('default')
    }
  }
  function selType(e) {
    props.scope.trainTagDtosOld.forEach((element) => {
      if (element.id == e) {
        blockColor.value = element.color
        canvas.selectionColor = 'transparent'
        canvas.selectionLineWidth = 2
      }
    })
    typeId.value = e
  }
  onMounted(() => {
    initCanvas()
    selColor.value = props.scope.trainTagDtosOld[0].id
    typeId.value = props.scope.trainTagDtosOld[0].id
  })
</script>
<style lang="scss" scoped>
  i {
    height: 30px;
    width: 30px;
  }
  .icon-clear {
    background-image: url('assets/icons/draw/icon-clear.png');
    background-size: 75%;
  }
  .icon-juxing {
    background-image: url('assets/icons/draw/icon-juxing.png');
    background-size: 75%;
  }
  .icon-del {
    background-image: url('assets/icons/draw/icon-del.png');
    background-size: 75%;
  }
  .icon-png {
    background-image: url('assets/icons/draw/icon-png.png');
    background-size: 75%;
  }
  .icon-xuanze {
    background-image: url('assets/icons/draw/icon-xuanze.png');
    background-size: 75%;
  }
  .icon-redo {
    background-image: url('assets/icons/draw/icon-redo.png');
    background-size: 75%;
  }
  .icon-undo {
    background-image: url('assets/icons/draw/icon-undo.png');
    background-size: 75%;
  }
  .main {
    display: flex;
    .main-left {
      & > div {
        background: #fafafa;
        cursor: pointer;
        &:hover {
          background: #eee;
        }
        i {
          display: flex;
          background-repeat: no-repeat;
          background-size: 80%;
          background-position: 50% 50%;
          height: 30px;
          width: 30px;
        }
      }
    }
    .main-mid {
      flex: 1;
      margin: 0 100px;
      display: flex;
      justify-content: space-around;
      // margin-left: 100px;
      // width: 50%;
      // display: flex;
      // justify-content: space-around;
    }
    .main-right-panel {
      display: flex;
      flex-direction: column;
    }
  }
  canvas {
    border: 1px dashed black;
  }

  .active {
    border: red 1px solid;
  }
</style>
