---
layout: post
title: 魔盒挑战第二期判题系统制作日志
author: wzhzzmzzy
date: 2019-5-16
categories: Tech
tags: 
    - Python
description: SUMSC 2019 魔盒挑战第二期判题系统制作日志。
---

>  Github Repo：
>
> - [题面 - Flask](<https://github.com/SUMSC/Pandora-2nd-Competition>)
> - [前端页面 - VueElementAdmin](<https://github.com/SUMSC/Pandora-2nd-FE>)
> - [后端 - Tornado](<https://github.com/LionTao/Pandora-2nd-BE>)

## 遇到的坑

### Python HTTP Service 异步

由于 eForm-Auth 在处理一个请求时会同步阻塞，并等待远端服务器的响应，直观的表现就是占用了过多的 Worker，无法处理之后过来的请求。因此，使用经典的同步 HTTP 框架，例如 Flask，就会让之后的请求超时。

之后我们选用了 tornado 的 AsyncHTTPClient 处理这个问题，也就导致了下面这个问题的发生。

### Tornado Async Fetch 的缺陷

由于 eForm-Auth 是通过向学校的统一认证服务器发送 HTTP 模拟请求进行用户登录的，所以我们需要使用 tornado AsyncHTTPClient Fetch 对这个环节进行异步处理。由于对服务器发送请求会发生两次连续的需要通过 Cookie 鉴权的重定向，而 tornado Fetch 没有对重定向保持 Credential，而之前，当我们使用 Python 发送 HTTP 请求最主流的`requests`包对学校的统一认证服务进行访问时，则和浏览器会有相同的表现。

解决方法：手动处理 tornado Redirect

```python
async def post(self):
    ...
    http_client = AsyncHTTPClient()
    try:
        response = await http_client.fetch(url,
            method="POST", headers=headers,
            body=urlencode({"IDToken1": id_tag, "IDToken2": token}),
            follow_redirects=False
        )
    except HTTPClientError as e:
        cookie = next(filter(lambda s: s.startswith(
            'iPlanetDirectoryPro'),
            e.response.headers.get_list('Set-Cookie'))
        )
        request = HTTPRequest(
            url="...",
            method='GET',
            headers={
                "Cookie": cookie,
            },
        )
        response = await http_client.fetch(request)
        res = json.loads(response.body).get('data')
        ...
        self.finish()
    else:
        self.set_status(status_code=400)
        ...
        self.finish()
```

### Github Personal Authorization Key 与 Gitee 私人令牌使用差异

当在 Azure Pipeline 中使用 Git 进行操作时，不可避免会需要使用 Github 或 Gitee 的 OpenAPI。这两者的私人令牌使用有差异，以`git push`为例：

```shell
# Github PAT
git push -f "https://$(github-pat)@github.com/<USER>/<REPO>.git"

# Gitee 私人令牌
git push -f "https://$(gitee-username):$(gitee-pat)@github.com/<USER>/<REPO>.git"
```

### SQLite3 的奇妙错误（待解决）

我们需要一个查询所有用户的成绩单的接口：`GET /inspect`。

```python
@app.route('/inspect', methods=['POST', 'GET'])
def inspect():
    if request.method == 'GET':
        db = get_db()
        try:
            test_grade = db.execute(
                '''
                SELECT *
                FROM (
                    SELECT user.id_tag, user.username, test.test_status, test.test_grade
                    FROM
                        main.test,
                        main.user
                    WHERE test.user_id = user.id
                    ORDER BY test_grade ASC
                )
                GROUP BY id_tag
                ''').fetchall()
            return jsonify(list(map(
                lambda item: dict(zip(item.keys(), tuple(item))),
                test_grade)))

        except Exception as e:
            tb = sys.exc_info()[2]
            logging.error(e, exc_info=True)
            return jsonify({"error": str(e.with_traceback(tb))})
    if request.method == 'POST':
        ...
```

这里的问题发生在 SQL 语句里，我们在 PyCharm 中使用其 DATABASE 功能进行测试时，使用`ORDER BY ... DESC`可以查询到用户的历史最好成绩，但是使用 Python3 sqlite3 包时，表现截然相反：`ORDER BY ... DESC`获取的结果是用户的最坏成绩，使用`ORDER BY ... ASC`则能获得最好成绩。我们猜测是 Python3 的 sqlite3 实现问题。
