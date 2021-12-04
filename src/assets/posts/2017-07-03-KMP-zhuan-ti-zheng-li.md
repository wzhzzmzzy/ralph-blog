---
layout: post
title: 字符串小算法总结
author: wzhzzmzzy
date: 2017-07-03
categories: ACM-ICPC
tags: [ACM-ICPC,字符串]
description: 字符串小算法总结，包括KMP、E-KMP、Manacher、最大最小表示法的模板和例题题解。
---

> [kuangbin专题十六——KMP](https://vjudge.net/contest/70325#overview)

### KMP 学习总结

#### 朴素 KMP 算法

```c++
void getNext(const char s[]){
    int cur = 0, k = -1;
    nxt[cur] = k;
    while (cur < m) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else k = nxt[k];
    }
}

int kmp(const char a[], const char b[]){
    int i = 0, j = 0;
    while (i < n) {
        if (j == -1 || a[i] == b[j]) ++i, ++j;
        else j = nxt[j];
        if (j == m) return i;
    }
    return -1;
}
```

#### 拓展 KMP 算法（Extend-KMP）

```c++
void getNext(const char T[]){
    int len=strlen(T), a=0;
    nxt[0] = len;
    while(a<len-1 && T[a]==T[a+1]) ++a;
    nxt[1] = a, a = 1；// a->适配最远位置的起始点
    for(int k=2; k<len; ++k){
        int p = a+nxt[a]-1; // p->之前适配可达到的最远处
        int L = nxt[k-a]; // L->a到k这一段的适配长度
        if(k-1+L >= p){ // 如果超过了 p 适配到的位置
            int j = (p-k+1)>0?(p-k+1):0; // s[k,p]的长度
            while(k+j<len && T[k+j]==T[j]) ++j; // 向后匹配
            nxt[k] = j, a = k;
        }
        else nxt[k]=L; // 没有超过就直接用
    }
}

void getExtend(const char S[],const char T[]){
    getNext(T);
    int slen = strlen(S), tlen = strlen(T), a = 0;
    int minLen = min(slen, tlen);
    while(a<minLen && S[a]==T[a]) ++a;
    extend[0] = a;
    a=0;
    for(int k=1; k<slen; ++k){
        int p = a+extend[a]-1, L = nxt[k-a];
        if(k-1+L >= p){
            int j = max(p-k+1, 0);
            while(k+j<slen && j<tlen && S[k+j]==T[j]) ++j;
            extend[k] = j;
            a=k;
        }
        else
            extend[k] = L;
    }
}
```

#### 最大最小表示法

```c++
int getMinOrMax(char str[], bool flag) {
    // true -> Max \ false -> Min
    int p1 = 0, p2 = 1, k = 0;
    while (p1<len && p2<len && k<len) {
        int cur = str[(p1+k)%len] - str[(p2+k)%len];
        if (cur > 0)
            flag ? p2+=k+1 : p1+=k+1;
        if (cur < 0)
            flag ? p1+=k+1 : p2+=k+1;
        if (p1 == p2) ++p2;
        !cur ? ++k : k=0;
    }
    return min(p1, p2);
}
```

#### 最长回文子串（Manacher）

```c++
void init(char str[], int len) {
    for (int i = len; i >= 0; --i) {
        str[(i<<1)+2] = str[i];
        str[(i<<1)+1] = '#';
    }
    str[0] = '@';
}

int manacher(char str[]) {
    int len = strlen(str), id = 0, maxi = 0;
    int p[maxn<<1] = {};
    init(str, len);
    for (int i = 2; i < (len<<1)+1; ++i) {
        p[i] = (p[id]+id > i? min(p[(id<<1)-i], p[id]+id-i) : 1);
        while (str[i-p[i]] == str[i+p[i]]) ++p[i]; // 向外延伸
        if (id+p[id] < i+p[i]) id = i; // 更新 id
        maxi = max(maxi, p[i]);
    }
    return maxi-1; // 最长回文子串长度
}
```

#### 学习资料

- [深入讲解next数组的求解](http://www.cnblogs.com/c-cloud/p/3224788.html)
- [扩展KMP算法](http://blog.csdn.net/dyx404514/article/details/41831947)
- [最大最小表示法](http://blog.csdn.net/cclsoft/article/details/5467743)
- [HDU3068+Manacher](http://blog.csdn.net/xingyeyongheng/article/details/9310555)


### HDU 1711

> [Number Sequence](https://vjudge.net/problem/HDU-1711)

#### 题意

> 给出`t`组样例和两串数列，在`a`串中求出`b`串所在位置。

#### 思路

KMP裸题，根据`b`串求出匹配序列`next`之后依次匹配即可。

#### 代码

```c++
#include <cstdio>
using namespace std;
#define LOCAL
const int maxn = 1e6+7;
int a[maxn], b[maxn], next[maxn], n, m;
void getNext(){
    int cur = 0, k = -1;
    next[cur] = k;
    while (cur < m) {
        if (k == -1 || b[cur] == b[k])
            next[++cur] = ++k;
        else k = next[k];
    }
}
int kmp(){
    int i = 0, j = 0;
    while (i < n) {
        if (j == -1 || a[i] == b[j]) ++i, ++j;
        else j = next[j];
        if (j == m) return i;
    }
    return -1;
}
int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    int t;
    scanf("%d", &t);
    while (t--) {
        scanf("%d%d", &n, &m);
        for (int i = 0; i < n; ++i)
            scanf("%d", a+i);
        for (int i = 0; i < m; ++i)
            scanf("%d", b+i);
        getNext();
        if (kmp()==-1)
            printf("-1\n");
        else
            printf("%d\n", kmp()-m+1);
    }
    return 0;
}
```

### HDU 1686

> [Oulipo](https://vjudge.net/problem/HDU-1686)

#### 题意

给出`t`组样例，每组样例有两个字符串。要求在`b`串中能找到多少个`a`串，每个`a`串有可能重叠。

#### 思路

简单KMP。由于对KMP理解不深，在匹配的时候选择了回到开始位置，这样会导致重复匹配，可以回到结尾位置对应的前缀位置，这样可以提高效率。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;
//#define LOCAL

int cas, nxt[10005], m, n;
char s[10005];
char t[1000007];

void getNext() {
    int cur = 0, k = -1;
    nxt[0] = -1;
    while(cur < m) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else k = nxt[k];
    }
}

int kmp() {
    int i = 0, j = 0, ans = 0;
    while (i < n) {
        if (j == -1 || t[i] == s[j]) ++i, ++j;
        else j = nxt[j];
        if (j == m) {
            ++ans;
            j = nxt[j];
        }
    }
    return ans;
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    scanf("%d", &cas);
    while (cas--) {
        scanf("%s%s", s, t);
        m = strlen(s), n = strlen(t);
        getNext();
        printf("%d\n", kmp());
    }
    return 0;
}
```

### HDU 2087

#### 题意

有多组样例，读入到`#`时终止。
每组样例有两个字符串，求能在`a`串中找到多少个`b`串。

#### 思路

KMP匹配即可，匹配完成之后小串指针归零。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;
#define LOCAL

char a[1005], b[1005];
int m, n, nxt[1005];

void getNext(){
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (cur < m) {
        if (k == -1 || b[cur] == b[k])
            nxt[++cur] = ++k;
        else
            k = nxt[k];
    }
}

int kmp(){
    int i = 0, j = 0, cnt = 0;
    while (i < n) {
        if (j == -1 || a[i] == b[j]){
            ++i, ++j;
        }
        else j = nxt[j];
        if (j == m)
            ++cnt, j = 0;
    }
    return cnt;
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    while (~scanf("%s", a) && a[0] != '#') {
        scanf("%s", b);
        n = strlen(a), m = strlen(b);
        getNext();
        printf("%d\n", kmp());
    }
    return 0;
}
```

### HDU 3746

> [Cyclic Nacklace ](https://vjudge.net/problem/HDU-3746)

#### 题意

有`t`组样例。每组样例给出一个字符串，要求要在两端补上多少个字符才能让其变为多个完全相同的字符串合并成的字符串。

#### 思路

KMP。根据题意发现，两端添加字符其实和一端是一样的。
那么我们只要根据匹配序列，获得字符串尾端的最长公共前后缀长度`nxt[len]`，这样可以求出最短的子序列长度为`xlen = len-nxt[len]`。
如果`len%xlen==0`那么这个字符串本身就已经是多个相同的字符串组合而成的了。
否则的话，需要增添的字符数量就是`xlen-nxt[len]%xlen`。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;
#define LOCAL

char s[100007];
int m, n, nxt[100007];

void getNext(){
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (cur < m) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else
            k = nxt[k];
    }
}
int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    int t;
    scanf("%d", &t);
    while (t--) {
        scanf("%s", s);
        m = strlen(s);
        getNext();
        n = m - nxt[m];
        if (n != m && !(m%n))
            printf("0\n");
        else
            printf("%d\n", n - nxt[m]%n);
    }
    return 0;
}
```

### HDU 1358

#### 题意

有多组样例，读到`0`时结束。每组样例是一个字符串，要求字符串的每个长度大于二的子串是否是一个由不少于一个相同的字符串连接成的串。

#### 思路

一开始想了很久，后来才知道这居然是一个性质：`i%(i-next[i])==0`，那么这个长度为`i`的串就是一个重复串，并且循环节长度为`i-next[i]`。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;
#define LOCAL

int nxt[1000007], n;
char s[1000007];

void getNext() {
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (cur < n) {
        if (k == -1 || s[cur] == s[k]){
            nxt[++cur] = ++k;
        }
        else k = nxt[k];
    }
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    int cas = 0;
    while (scanf("%d", &n), n) {
        scanf("%s", s);
        getNext();
        printf("Test case #%d\n", ++cas);
        for (int i = 2; i <= n; ++i){
            if (i%(i-nxt[i]) == 0 && nxt[i])
                printf("%d %d\n", i, i/(i-nxt[i]));
        }
        printf("\n");
    }
    return 0;
}
```

### POJ 3080

> [Blue Jeans](https://vjudge.net/problem/POJ-3080)

#### 题意

给出多个长度为60的字符串，求出字典序最大的最长公共子串。

#### 思路

因为数据范围不大，所以暴力枚举第一个串的所有子串，然后KMP匹配即可。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;
#define LOCAL

char s[12][67], ans[67], now[67];
int nxt[67], len, len_ans, flag;

void getNext(const char s[]) {
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (s[cur]) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else
            k = nxt[k];
    }
}

int kmp(const char s[]) {
    int i = 0, j = 0;
    while (s[i]) {
        if (j == -1 || s[i] == now[j]) ++i, ++j;
        else j = nxt[j];
        if (j == len) return 1;
    }
    return 0;
}

bool check() {
    //printf("_%s %s\n", ans, now);
    if (len > len_ans) return true;
    int cur = -1;
    return strcmp(ans, now) > 0;
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    int t;
    scanf("%d", &t);
    while (t--) {
        int m; scanf("%d", &m);
        for (int i = 0; i < m; ++i)
            scanf("%s", s[i]);
        for (len = 1, len_ans = 0; len <= 60; ++len) {
            for (int cur = 0, flag = 1; cur <= 60-len; ++cur, flag = 1) {
                for (int i = 0; i < len; ++i)
                    now[i] = s[0][cur+i];
                now[len] = '\0';
                getNext(now);
                for (int i = 1; i < m; ++i) if (!kmp(s[i])) {
                    flag = 0;
                    break;
                }
                if (flag && check()){
                    strcpy(ans, now);
                    len_ans = len;
                }
            }
        }
        if (len_ans < 3)
            printf("%s\n", "no significant commonalities");
        else
            printf("%s\n", ans);
    }
    return 0;
}
```

### HDU 3336

> [Count the string](https://vjudge.net/problem/HDU-3336)

#### 题意

给出一个字符串，求这个字符串的每个前缀在字符串中出现的次数总和。

#### 思路

KMP。依然是考对`next`数组的理解程度。
`next`数组表示当前位置的最大公共前后缀长度，那么这个最大的公共前后缀长度中包含的就是前缀中的每个小前缀的数量。也就是说，`next`数组在这道题目中就可以用来表示当前位置的后缀中出现了的重复前缀数量，可以直接加入计数器当中。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;
const int mod = 10007;

int n, nxt[200007];
char s[200007];

void getNext() {
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (s[cur]) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else
            k = nxt[k];
    }
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    int t;
    scanf("%d", &t);
    while (t--) {
        scanf("%d%s", &n, s);
        getNext();
        int ans = (nxt[n] + n)%mod;
        for (int i = 0; i < n; ++i)
            if (nxt[i] && nxt[i+1] != nxt[i]+1)
                ans += nxt[i];
        printf("%d\n", ans%mod);
    }
    return 0;
}
```

### HDU 4300

> [Clairewd’s message](https://vjudge.net/problem/HDU-4300)

#### 题意

给出若干样例，每个样例有两个字符串。第一个字符串是26个英文字母对应的密码表，第二个字符串是密文和明文连接成的，其中的明文可能不全，可能没有。求补完明文串。

#### 思路

1. 数据较弱，可以暴力。

2. 用朴素KMP完成，将字符串的前一半翻译为明文，后一半不变，然后生成`next`数组，看最后一位的大小就知道密文的长度。

3. 用拓展KMP完成，将字符串整个翻译为明文，原串为模式串，新串为主串，生成`extend`，遍历`extend`找第一个完全匹配的点（这个点后面的字符都能和主串的前缀匹配），就知道密文的长度了。

#### 代码

```c++
\\ 朴素KMP
#include <cstdio>
using namespace std;

char a[27];
char s1[100007];
char s2[100007];
int nxt[100007];

void getNext(char s[]) {
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (s[cur]) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else
            k = nxt[k];
    }
}

int main(){
    int t;
    scanf("%d", &t);
    while (t--) {
        scanf("%s%s", a+1, s1);
        char b[27];
        for (int i = 1; i <= 26; ++i)
            b[a[i]-'a'] = i+'a'-1;
        int len = strlen(s1);
        int k = len;
        for (int i = 0; i < (len+1)>>1; ++i)
            s2[i] = b[s1[i]-'a'];
        for (int i = (len+1)>>1; i <= len; ++i)
            s2[i] = s1[i];
        getNext(s2);
        while (nxt[k] > len>>1)
            k = nxt[k];
        printf(s1);
        for (int i = nxt[k]; i < len-nxt[k]; ++i)
            printf("%c", b[s1[i]-'a']);
        printf("\n");
    }
    return 0;
}

\\ 拓展KMP
#include <cstdio>
#include <cstring>
#include <algorithm>

using namespace std;
const int maxn = 100000+7;

char s1[maxn], s2[maxn];
int nxt[maxn], extend[maxn];

void getNext(const char T[]){
    int len=strlen(T), a=0;
    nxt[0] = len;
    while(a<len-1 && T[a]==T[a+1]) ++a;
    nxt[1] = a;
    a=1;
    for(int k=2; k<len; ++k){
        int p=a+nxt[a]-1, L=nxt[k-a];
        if(k-1+L >= p){
            int j = (p-k+1)>0?(p-k+1):0;
            while(k+j<len && T[k+j]==T[j]) ++j;
            nxt[k] = j;
            a=k;
        }
        else
            nxt[k]=L;
    }
}

void getExtend(const char S[],const char T[]){
    getNext(T);
    int slen = strlen(S), tlen = strlen(T), a = 0;
    int minLen = min(slen, tlen);
    while(a<minLen && S[a]==T[a]) ++a;
    extend[0] = a;
    a=0;
    for(int k=1; k<slen; ++k){
        int p = a+extend[a]-1, L = nxt[k-a];
        if(k-1+L >= p){
            int j = max(p-k+1, 0);
            while(k+j<slen && j<tlen && S[k+j]==T[j]) ++j;
            extend[k] = j;
            a=k;
        }
        else
            extend[k] = L;
    }
}

int main(){
    int t;
    scanf("%d", &t);
    while (t--) {
        char table[30], b[200];
        scanf("%s%s", table, s1);
        for (int i = 0; table[i]; ++i)
            b[table[i]] = i+'a';
        for (int i = 0; s1[i]; ++i)
            s2[i] = b[s1[i]];
        getExtend(s1, s2);
        int n = strlen(s1), cur = n;
        for (int i = 0; s1[i]; ++i)
            if (i+extend[i] >= n && i >= extend[i]) {
                cur = i;
                break;
            }
        char ans[maxn*2];
        for (int i = 0; i < cur; ++i){
            ans[i] = s1[i];
            ans[cur+i] = s2[i];
        }
        ans[cur*2] = '\0';
        printf("%s\n", ans);
    }
    return 0;
}
```

### HDU 2328

> [Corporate Identity](https://vjudge.net/problem/HDU-2328)

#### 题意

找多个字符串的公共子串。

#### 思路

暴力枚举+KMP，没什么好说的。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;

int nxt[203], len, len_ans;
char s[4003][203], now[203], ans[203];

void getNext(const char s[]) {
    int cur = 0, k = -1;
    nxt[0] = -1;
    while (s[cur]) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else
            k = nxt[k];
    }
}

int kmp(const char s[]) {
    int i = 0, j = 0;
    while (s[i]) {
        if (j == -1 || s[i] == now[j]) ++i, ++j;
        else j = nxt[j];
        if (j == len) return 1;
    }
    return 0;
}

bool check() {
    if (len > len_ans) return true;
    return strcmp(ans, now) > 0;
}

int main(){
    int n;
    while (scanf("%d", &n), n) {
        for (int i = 0; i < n; ++i)
            scanf("%s", s[i]);
        int mi = strlen(s[0]);
        for (len = 1, len_ans = 0; len <= mi; ++len) {
            for (int i = 0, flag = 1; i <= mi-len; ++i, flag = 1) {
                for (int j = 0; j < len; ++j)
                    now[j] = s[0][i+j];
                now[len] = '\0';
                getNext(now);
                for (int j = 1; j < n; ++j) if (!kmp(s[j])) {
                    flag = 0;
                    break;
                }
                if (flag && check()) {
                    strcpy(ans, now);
                    len_ans = len;
                }
            }
        }
        if (len_ans == 0)
            printf("IDENTITY LOST\n");
        else
            printf("%s\n", ans);
    }
    return 0;
}
```

### HDU 3374

> [String Problem](https://vjudge.net/problem/HDU-3374)

#### 题意

求一个串每一位依次向前滚动一位，生成的每一个串中字典序最大和最小的字符串。并输出个数。

#### 思路

KMP+字符串最大最小表示法。

最大最小表示法确实是第一次接触。就是通过不断滚动字符串，得到字符串中字典序最大的一串。

最小表示法：取两个指针`p=0`和`q=1`，以及一个辅助变量`k`，从头开始遍历字符串，
如果`str[p+k]==str[q+k]`，则`++k`，
如果`str[p+k]<str[q+k]`，则`q+=k+1,k=0`，
如果`str[p+k]>str[q+k]`，则`p+=k+1,k=0`。
如果`p==q`，则`++q`。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>

using namespace std;

const int maxn = 1000000+7;

int nxt[maxn]; char s[maxn];

int getMinOrMax(char str[], bool flag) {
    // true -> Max \ false -> Min
    int p1 = 0, p2 = 1;
    int k = 0, len = strlen(str);
    while (p1<len && p2<len && k<len) {
        int cur = str[(p1+k)%len] - str[(p2+k)%len];
        if (cur > 0)
            flag ? p2+=k+1 : p1+=k+1;
        if (cur < 0)
            flag ? p1+=k+1 : p2+=k+1;
        if (p1 == p2) ++p2;
        !cur ? ++k : k=0;
    }
    return min(p1, p2);
}

void getNext(const char str[]){
    int cur = 0, k = -1;
    nxt[cur] = k;
    while (str[cur]) {
        if (k == -1 || str[cur] == str[k])
            nxt[++cur] = ++k;
        else k = nxt[k];
    }
}

int main(){
    while (~scanf("%s", s)) {
        getNext(s);
        int len = strlen(s), xlen = len-nxt[len], times = 1;
        if (!(len%xlen)) times = len/xlen;
        int mi = getMinOrMax(s, 0);
        int ma = getMinOrMax(s, 1);
        printf("%d %d %d %d\n", mi+1, times, ma+1, times);
    }
    return 0;
}
```

### HDU 2609

#### 题意

给出一列01串，求有多少滚动后依然不同的串。

#### 思路

滚动后相同的串的最小表示是相同的，所以用最小表示法可以过。
一开始用了三次`strcpy`，结果TLE了，发现人家用`set`和`memcpy`就可以稳过，还是没学过C的问题。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>
#include <set>

using namespace std;

const int maxn = 100+7;

set<string> ans;
char s[maxn*2];
int len;

int getMinOrMax(char str[], bool flag) {
    // true -> Max \ false -> Min
    int p1 = 0, p2 = 1, k = 0;
    while (p1<len && p2<len && k<len) {
        int cur = str[(p1+k)%len] - str[(p2+k)%len];
        if (cur > 0)
            flag ? p2+=k+1 : p1+=k+1;
        if (cur < 0)
            flag ? p1+=k+1 : p2+=k+1;
        if (p1 == p2) ++p2;
        !cur ? ++k : k=0;
    }
    return min(p1, p2);
}

void getMinString(char *str){
    str[len/2] = '\0';
    ans.insert(str);
}

int main(){
    int n;
    while (~scanf("%d", &n)) {
        ans.clear();
        for (int i = 0; i < n; ++i) {
            scanf("%s", s);
            char temp[maxn*2];
            memcpy(temp, s, sizeof s);
            strcat(s, temp);
            len = strlen(s);
            int k = getMinOrMax(s, 0);
            getMinString(s+k);
        }
        printf("%d\n", ans.size());
    }
    return 0;
}
```

### FZU 1901

#### 题意

求公共前后缀的长度`p`。

#### 思路

用`next`数组，从最后一位递归遍历至首，输出。

#### 代码

```c++
#include <cstdio>
#include <cstring>
#include <cmath>
#include <iostream>
#include <algorithm>
#include <vector>
using namespace std;

const int maxn = 1000000+7;

int nxt[maxn];

void getNext(const char s[]){
    int cur = 0, k = -1;
    nxt[cur] = k;
    while (s[cur]) {
        if (k == -1 || s[cur] == s[k])
            nxt[++cur] = ++k;
        else k = nxt[k];
    }
}

int main(){
    int n, cas = 0; scanf("%d", &n);
    while (n--) {
        char s[maxn];
        scanf("%s", s);
        getNext(s);
        int cnt = 1;
        int len = strlen(s);
        for (int i = nxt[len]; i; i = nxt[i]) ++cnt;
        printf("Case #%d: %d\n", ++cas, cnt);
        for (int i = nxt[len]; i; i = nxt[i])
            printf("%d ", len-i);
        printf("%d\n", strlen(s));
    }
    return 0;
}
```

### HDU - 3068

#### 题意

求一个字符串的最大回文子串的长度。

#### 思路

Manacher的入门模板题。

设`p[i]`为`i`位置的回文串半径。那么从前往后遍历字符串，求出`p[0...len]`即可。

首先，因为我们是以每个字符为中点向两侧延伸来计算回文串，所以无法判别`aa`这样的串，这需要对原串进行一次扩展。扩展方式就是，在字符串的每一个字符之间，和首尾，添加一个字符串中没有出现的字符，比如`#`，然后再给字符串首加上另一个，比如`@`。

然后就是计算`p[i]`了。如何提高效率？用`id`来记录
可以延伸到最远处的回文串中点，如果当前遍历到`j>id+p[id]`，那么直接向外延伸。但是如果`j<=id+p[id]`，就可以直接更新`p[j]=min(p[id*2-j],p[id]+id-j)`。

这里我们来分析一下`p[j]=min(p[id*2-j],p[id]+id-j)`这个式子。

`p[id*2-j]`表示什么？表示`j`关于`id`对称的点。`id*2-j`的半径如果超出了`p[id]-id`的范围，那么`p[j]=p[id]+id-j`，`id`范围外不可能还有回文串；如果`p[id*2-j]>p[id]-id`，那么`p[j]=p[id*2-j]`，`id*2-j`范围外也不会有回文串。如果两者相等，就继续向外延伸。

#### 代码

```c++
#include <bits/stdc++.h>
using namespace std;

const int maxn = 110000+7;

void init(char str[], int len) {
    for (int i = len; i >= 0; --i) {
        str[(i<<1)+2] = str[i];
        str[(i<<1)+1] = '#';
    }
    str[0] = '@';
}

int manacher(char str[]) {
    int len = strlen(str), id = 0, maxi = 0;
    int p[maxn<<1] = {};
    init(str, len);
    for (int i = 2; i < (len<<1)+1; ++i) {
        p[i] = (p[id]+id > i? min(p[(id<<1)-i], p[id]+id-i) : 1);
        while (str[i-p[i]] == str[i+p[i]]) ++p[i]; // 向外延伸
        if (id+p[id] < i+p[i]) id = i; // 更新 id
        maxi = max(maxi, p[i]);
    }
    return maxi-1; // 最长回文子串长度
}

int main(){
#ifdef LOCAL
    freopen("in.txt", "r", stdin);
#endif
    char s[maxn<<1];
    while (~scanf("%s", s))
        printf("%d\n", manacher(s));
    return 0;
}
```
