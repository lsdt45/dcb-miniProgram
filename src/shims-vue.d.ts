import { ComponentCustomProperties } from 'vue'
import { Util } from '@/types/util'

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $util: Util,
    $refs: any,
    $store: any,
  }
}