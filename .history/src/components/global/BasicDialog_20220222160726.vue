<template>
  <el-dialog v-model="dialogTableVisible" destroy-on-close :close-on-click-modal="false" :width="width">
    <slot></slot>
    <template #footer v-if="handleStatus">
      <span class="dialog-footer">
        <el-button @click="dialogTableVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm()">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  const props = defineProps({
    handleStatus: {
      type: Boolean, // 参数类型
      default: false //默认值
    },
    width: {
      type: String, // 参数类型
      default: '50%' //默认值
    }
  })
  const emits = defineEmits(['confirm'])
  const confirm = (e) => {
    emits('confirm', 9)
  }
  const dialogTableVisible = ref(false)
  defineExpose({
    dialogTableVisible
  })
</script>
