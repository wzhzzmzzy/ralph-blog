---
layout: post
title: AC自动机模板整理及入门例题
author: wzhzzmzzy
date: 2017-07-03
categories: ACM-ICPC
tags: [ACM-ICPC,字符串]
description: AC自动机入门，包含参考资料。
---

### 参考资料

- [字典树（讲解+模版）](http://www.cnblogs.com/tanky_woo/archive/2010/09/24/1833717.html)
- [AC自动机算法](http://blog.csdn.net/niushuai666/article/details/7002823)
- [AC自动机算法详解](http://www.cppblog.com/mythit/archive/2009/04/21/80633.html)
- [hdu 2222 ac自动机入门题](http://blog.csdn.net/hnust_xiehonghao/article/details/9130539)

### HDU 2222

> [Keywords Search](https://vjudge.net/problem/HDU-2222)
#### 题意

给出一些模式串和一个主串，求主串中能匹配到的模式串数量。

#### 思路

AC自动机裸题。

#### 代码

```c++
#include <stdio.h>
#include <string.h>
#include <malloc.h>
#include <queue>
using namespace std;

struct node {
    int count;
    struct node *next[26];
    struct node *fail;
    void init() {
        for(int i=0; i < 26; ++i)
            next[i] = NULL;
        count = 0;
        fail = NULL;
    }
} *root;

void insert(char str[]) {
    node *p = root;
    int len = strlen(str);
    for(int k=0; k < len; ++k) {
        int pos = str[k]-'a';
        if(p->next[pos] == NULL) {
            p->next[pos] = new node;
            p->next[pos]->init();
            p = p->next[pos];
        }
        else
            p = p->next[pos];
    }
    p->count++;
}

void getfail() {
    node *p = root, *son, *temp;
    queue<node*> que;
    que.push(p);
    while(!que.empty()){
        temp = que.front(); que.pop();
        for(int i=0; i < 26; ++i){
            son = temp->next[i];
            if(son != NULL){
                if(temp == root)
                    son->fail = root;
                else{
                    p = temp->fail;
                    while(p){
                        if(p->next[i]){
                            son->fail=p->next[i];
                            break;
                        }
                        p = p->fail;
                    }
                    if(!p)
                        son->fail = root;
                }
                que.push(son);
            }
        }
    }
}

void query(char str[]) {
    int len = strlen(str), cnt=0;
    node *p,*temp;
    p = root;
    for (int i=0; i < len; ++i) {
        int pos = str[i]-'a';
        while(!p->next[pos] && p!=root)
            p = p->fail;
        p = p->next[pos];
        if(!p) p = root;
        temp = p;
        while (temp != root) {
            if(temp->count >= 0) {
                cnt += temp->count;
                temp->count = -1;
            }
            else break;
            temp = temp->fail;
        }
    }
    printf("%d\n", cnt);
}

char str[1000000+100];

int main() {
    int cas,n;
    scanf("%d",&cas);
    while(cas--) {
        root=new node;
        root->init();
        root->fail = NULL;
        scanf("%d",&n);
        int i;
        for(i=0;i<n;i++) {
            scanf("%s", str);
            insert(str);
        }
        getfail();
        scanf("%s", str);
        query(str);
    }
    return 0;
}
```

### HDU 2896

> [病毒侵袭](https://vjudge.net/problem/HDU-2896)

#### 题意

给出一些模式串，再给出一些主串，求每个主串中能匹配到的模式串的编号，以及能匹配到模式串的主串数量。

#### 思路

本来是想用上面 HDU 2222 的模板改的，发现会MLE，就重新找了一个模板。

这个模板是开一个`node`数组，通过`next`和`fail`都通过下标来指示位置，
数据量一定时节省空间但是不能根据数据量自动拓展。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>
#include <queue>

using namespace std;

const int kind = 128;
const int s_maxn = 200+7;
const int t_maxn = 10000+7;
const int maxn = 500+7;

struct node {
    int fail, flag, next[kind];
    void init() {
        for(int i=0; i < kind; ++i)
            next[i] = 0;
        fail = -1, flag = 0;
    }
} tb[100007];

int web_cnt, n, m, cur;
char s[s_maxn], t[t_maxn];

void insert(const char str[], int id) {
    int temp = 0;
    for(int k=0; str[k]; ++k) {
        int pos = str[k];
        if(tb[temp].next[pos] == 0) {
            tb[++cur].init();
            tb[temp].next[pos] = cur;
        }
        temp = tb[temp].next[pos];
    }
    tb[temp].flag = id;
}

void getfail() {
    int p, son;
    queue<int> que;
    que.push(0);
    while(!que.empty()){
        int temp = que.front(); que.pop();
        for(int i=0; i < kind; ++i){
            son = tb[temp].next[i];
            if (!son) continue;
            p = tb[temp].fail;
            while (~p && !tb[p].next[i])
                p = tb[p].fail;
            if (!~p)
                tb[son].fail = 0;
            else
                tb[son].fail = tb[p].next[i];
            que.push(son);
        }
    }
}

void query(char str[], int id) {
    int ans[maxn] = {}, cnt = 0;
    int p = 0, temp;
    for (int i=0; str[i]; ++i) {
        int pos = str[i];
        if (tb[p].next[pos])
            p = tb[p].next[pos];
        else {
            temp = tb[p].fail;
            while (~temp && !tb[temp].next[pos])
                temp = tb[temp].fail;
            if (p == -1) p = 0;
            else p = tb[temp].next[pos];
        }
        if(tb[p].flag) {
            ans[tb[p].flag] = 1;
            ++cnt;
            temp = tb[p].fail;
            while (temp && !ans[tb[temp].flag]) {
                ans[tb[temp].flag] = 1;
                temp = tb[temp].fail;
                ++cnt;
            }
        }
    }
    if (cnt == 0) return;
    ++web_cnt;
    printf("web %d:", id);
    for (int i = 1; i <= n; ++i)
        if (ans[i]) printf(" %d", i);
    puts("");
}

void solve() {
    web_cnt = cur = 0;
    tb[0].init();
    for (int i = 1; i <= n; ++i) {
        scanf("%s", s);
        insert(s, i);
    }
    getfail();
    int m; scanf("%d", &m);
    for (int i = 1; i <= m; ++i) {
        scanf("%s", t);
        query(t, i);
    }
    printf("total: %d\n", web_cnt);
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    while (~scanf("%d", &n))
        solve();
    return 0;
}
```
