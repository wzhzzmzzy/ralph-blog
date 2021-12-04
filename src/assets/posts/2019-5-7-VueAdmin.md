---
layout: post
title: VueAdminTemplate源码分析
author: wzhzzmzzy
date: 2019-5-7
categories: Tech
tags: 
    - 前端
    - Vue
description: Vue-Element-Admin是一个使用Element-UI开发的后台项目，由于其 Production Ready，我觉得可以考虑认真地学习一下其架构和设计模式。
---

[Vue Element Admin - Documents](<https://panjiachen.github.io/vue-element-admin-site/#/>)

## 全局设置 ##

整个页面可以有全局设置，之前我是写死在`vuex`当中的，但是这个template的全局设置是`@/settings.js`，然后在`@/store/settings.js`中使用`vuex`进行控制。似乎这样是更好的方法。

## 登录系统 ##

路由：`@/route`，视图：`@/views/login`，数据：`@/store/modules/user.js`，Mock：`mock/user.js`，Cookies：`@/utils/auth.js`。

这里我学到的内容有：

- 路由守卫重定向到登录页面之后，可以携带`redirect`。

```javascript
watch: {
    $route: {
        // 判断是否需要进行跳转
        handler: function(route) {
            this.redirect = route.query && route.query.redirect
        },
        immediate: true
    }
}
```

- 密码显示与不显示（`Vue.nextTick`）。

```js
showPwd() {
    if (this.passwordType === 'password') {
        this.passwordType = ''
    } else {
        this.passwordType = 'password'
    }
    // 保证 Focus 发生在 密码框状态改变之后
    this.$nextTick(() => {
        this.$refs.password.focus()
    })
}
```

- Cookies 的处理，我们会需要把 Token 写在浏览器的 Cookie 里，之前我写 H5 的时候完全忘记了对 Cookie 的复用。这里我们可以使用`js-cookie`库。

```js
// @/utils/auth.js
import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
```

### 登录守卫 ###

一般来说，我们会使用 Vue-Router 的路由守卫功能实现对用户在跳转到目标路由之前进行鉴权。在该项目中同样，根据浏览器当前是否保有 Cookies 来进行判断。这里没有对 Cookies 做任何校验，其实是可以做的。

```js
const hasToken = getToken() // 获取浏览器当前的 Cookies

if (hasToken) { // 如果 Cookies 存在，那就是已登录的状态
    if (to.path === '/login') {
        next({ path: '/' })
    } else {
        next()
    }
} else { // 否则就是未登录，那么不需要登录态的页面是可以进入的
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else { // 需要登录态的页面重定向到 login
      next(`/login?redirect=${to.path}`)
    }
}
```

为了照顾用户的观感，使用`NProgress`进度条：

```js
router.beforeEach(async(to, from, next) => {
  	// start progress bar
  	NProgress.start()
	...
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done()
})
```

## Mock ##

使用`mock.js`可以脱离后台测试 API。以`table`为例：

```js
// API
export function getList(params) {
  return request({
    url: '/table/list',
    method: 'get',
    params
  })
}

// Table
import Mock from 'mockjs'

const data = Mock.mock({
  'items|30': [{
    id: '@id',
    title: '@sentence(10, 20)',
    'status|1': ['published', 'draft', 'deleted'],
    author: 'name',
    display_time: '@datetime',
    pageviews: '@integer(300, 5000)'
  }]
})

export default [
  {
    url: '/table/list',
    type: 'get',
    response: config => {
      const items = data.items
      return {
        code: 20000,
        data: {
          total: items.length,
          items: items
        }
      }
    }
  }
]

```

## Nested ##

示例中给出了收缩列表的使用方式，写法是嵌套`<router-view>`

```vue
// @/views/nested/menu1/index.vue
<template>
  <div style="padding:30px;">
    <el-alert :closable="false" title="menu 1">
      <router-view />
    </el-alert>
  </div>
</template>


// @/views/nested/menu1/menu1-2/index.vue
<template>
  <div style="padding:30px;">
    <el-alert :closable="false" title="menu 1-2" type="success">
      <router-view />
    </el-alert>
  </div>
</template>

// @/views/nested/menu1/menu1-2/menu1-2-1/index.vue
<template functional>
  <div style="padding:30px;">
    <el-alert :closable="false" title="menu 1-2-1" type="warning" />
  </div>
</template>

```

## 对 Axios 的封装 ##

在 Axios 中，可以创建默认访问器：

```js
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})
```

对于每一个请求和响应，我们都可以添加 Hook 来做一些固定的预处理工作：

```js
// request interceptors
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptors
service.interceptors.response.use(
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || 'error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(res.message || 'error')
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
```

## 面包屑（`Breadcrumb`） ##

使用 Element-UI 中的`el-breadcrumb`即可。问题在于如何实现将面包屑独立成为单独可用的组件，并随着页面的路由更新。

### 初始化面包屑并随时更新 ###

首先，通过 Hook 和侦听器可以解决一半的问题。

```js
{
    watch: {
        $route() {
            this.getBreadcrumb()
        }
    }, 
    created() {
        this.getBreadcrumb()
    }
}
```

接下来，通过`$route.matched`可以拿到所有嵌套的路由片段，这里我们只需要使用`path`和`meta.title`即可。其中，`meta.title`是在`@/router/index.js`中定义过的。其中，对于特别的`dashboard`页面需要特别判断一下。

```js
getBreadcrumb() {
    // only show routes with meta.title
    let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
    const first = matched[0]

    if (!this.isDashboard(first)) {
        matched = [{ path: '/dashboard', meta: { title: 'Dashboard' }}].concat(matched)
    }

    this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
}
isDashboard(route) {
    const name = route && route.name
    if (!name) {
        return false
    }
    return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
}
```

对于有些不能够直接跳转的页面，需要获取`meta.redirect`来跳转。

## 布局（`layout`） ##

### Mobile 处理 ###

在这个模板当中，使用了`@/layout/ResizeMixin`来做对小窗口的适配。当检测到窗口变小之后，会自动触发`window.resize`事件，只需要监听这个事件即可。对于当前是否要进行侧边栏的隐藏，则可以通过`store`来进行。

```js
const WIDTH = 992 // refer to Bootstrap's responsive design
$_isMobile() {
    const rect = body.getBoundingClientRect()
    return rect.width - 1 < WIDTH
}
$_resizeHandler() {
    if (!document.hidden) {
        const isMobile = this.$_isMobile()
        store.dispatch('app/toggleDevice', isMobile ? 'mobile' : 'desktop')
        if (isMobile) {
            store.dispatch('app/closeSideBar', { withoutAnimation: true })
        }
    }
}
```

### 页面基础布局 ###

我们会需要在页面上使用一个基础布局时，主要通过`vue-router`来实现，即，在所有需要使用到基础页面布局的路由上使用一个固定的`Layout`组件，然后使用嵌套路由进行内部组件的放置。

#### 顶部栏（`navbar`） ####

顶部栏的功能比较少，因为这是一个较为纯粹的侧边栏结构，如果用过WordPress会觉得这个布局非常熟悉。顶部栏主要只包含`hamburger`，`breadthumb`，以及一个`avatar`和下拉框。

#### 侧边栏 ####

侧边栏需要做到的功能较多，该模板还支持了对用户权限的动态路由生成。

首先是一个比较简单的点：侧边栏的`default-active`。这可以通过路由来进行不同的分派。

然后是根据动态路由表对侧边栏进行渲染，避免了路由与侧边栏之间的耦合。这里需要对路由进行`hidden`的过滤，比如`404`页面就不应该被渲染。对于侧边栏每一个`item`上的LOGO，需要做一下分派。BTW，这里侧边栏的开合是使用`vuex`记录状态的，所以确实是可以这样用的。

这里的侧边栏`item`是使用了 JS 渲染的方式进行构建，以下是`render`函数：

```js
render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
        vnodes.push(<svg-icon icon-class={icon}/>)
	}

	if (title) {
    	vnodes.push(<span slot='title'>{(title)}</span>)
	}
	return vnodes
}
```
