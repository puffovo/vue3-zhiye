import { createStore } from 'vuex'
import {
  requestColumnList,
  requestColumnItem,
  requestLogin,
  requestUser,
  requestPostList
} from '@/http'
import { userProp, columnItem, postItem } from './type'
import axios from 'axios'

export interface GlobalState {
  userinfo: userProp
  token: string
  columnList: Array<columnItem>
  columnItem: columnItem
  postList: Array<postItem>
  isLoading: boolean
}

const store = createStore<GlobalState>({
  state: {
    userinfo: { isLogin: false },
    token: localStorage.getItem('token') || '',
    columnList: [],
    columnItem: {} as columnItem,
    postList: [],
    isLoading: false
  },
  getters: {
    // 通过columnId过滤postlist
    getPostsByColumnid: (state) => (columnId: string) => {
      return state.postList.filter(item => item.columnId.toString() === columnId)
    }
  },
  mutations: {
    setLoading (state, flag) { state.isLoading = flag },
    login (state, { loginMsg, code }) {
      if (code) {
        const { token, exq } = loginMsg
        state.token = token
        axios.defaults.headers.common.Authorization = `Bearer ${token}`
        localStorage.setItem('token', token)
        localStorage.setItem('exq', exq)
      }
    },
    logout (state) {
      state.token = ''
      state.userinfo = { isLogin: false }
      localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
    },
    getUser (state, { user }) {
      state.userinfo = { ...user, isLogin: true }
    },
    getColumn (state, data) {
      state.columnList = data.list
      state.isLoading = false
    },
    getColumnItem (state, data) {
      state.columnItem = data.item
      state.isLoading = false
    },
    getPost (state, data) { state.postList = data.list }
  },
  actions: {
    async asyncLogin ({ commit }, { email, password }) {
      const { data } = await requestLogin(email, password)
      commit('login', data)
      return data
    },
    async asyncGetUser ({ commit }) {
      const res = await requestUser()
      commit('getUser', res.data)
    },
    async loginAndGetUser ({ dispatch }, loginData) {
      return dispatch('asyncLogin', loginData).then(data => {
        // code为1登录成功, 0登录失败
        data.code && dispatch('asyncGetUser')
        return data
      })
    },
    // 获取栏目列表
    async asyncGetColumn ({ commit }) {
      const res = await requestColumnList()
      commit('getColumn', res.data)
    },
    // 获取单个栏目
    async asyncGetColumnItem (store, id) {
      const res = await requestColumnItem(id)
      store.commit('getColumnItem', res.data)
    },
    // 获取文章列表
    async asyncGetPost ({ commit }) {
      const res = await requestPostList()
      commit('getPost', res.data)
    }
  }
})

export default store
