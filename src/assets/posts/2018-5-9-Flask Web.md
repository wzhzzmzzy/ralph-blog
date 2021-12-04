---
layout: post
title: Flask 基础功能
author: wzhzzmzzy
date: 2018-5-9
categories: Tech
tags: 
    - Python
    - 计算机网络
description: 学习一下 Python 用得最多的 Web Framework 的框架。，这里是入门学习，学一下如何搭建简单的用户管理系统。
---

## Flask Web
### Flask 基本结构

> "Hello world!"

#### 初始化

所有 Flask 都需要创建一个程序实例。Web 服务器使用一种名为 WSGI 的协议，
把接受自客户端的所有请求都转交给这个对象处理。

```python
from flask import Flask
app = Flask(__name__)
```

Flask 类的构造函数只有一个必须指定的参数，就是主模块或者包的名字。
Flask 用这个名字决定程序的主目录，以便寻找资源文件位置。
一般我们可以直接使用创建实例的文件名`__name__`。

#### 路由和视图函数

客户端将请求发给 Web 服务器，服务器将请求发送给 Flask 实例。
实例需要对不同的 URL 请求运行哪些代码，所以保存一个 URL 到 Python 函数的映射，
处理 URL 和分派函数的程序称为路由。

```python
@app.route('/')
def index():
    return '<h1>Hello world!</h1>'
```

这里使用了装饰器来将`index`注册为视图函数，针对不同的路由生成`Response`。
当然，实际情况中不要在 Python 代码中硬分派响应字符串，这样会让代码难以维护。

Flask 可以匹配地址中的某块内容，比如`http://www.facebook.com/<name>`。

```python
@app.route('/user/<name>')
def user(name):
    return 'Hello, {name}'.format(name)
```

`<name>`就是动态部分，会进行匹配，将匹配结果传入函数中。

路由中的动态部分，默认使用字符串，当然也可以使用类型定义：`<int:id>`。
Flask 支持的类型有：`int`，`float`，`path`，
其中`path`会将后面的整段地址作为匹配内容。

#### 启动服务器

```python
if __name__ == '__main__':
    app.run(debug=True)
```

服务器启动后会进入轮询，直到主动停止。
开发时使用调试模式会带来一些便利，比如说激活调试器和重载程序。

当然，这个测试服务器不适合在生产环境下使用。

#### 请求——响应循环

Flask 从客户端收到请求时，要让视图函数能够访问一些对象，才能处理请求。
`request`是一个很好的例子，封装了客户端发送的 HTTP 请求。

我们有时会需要在视图函数中处理请求，但是如果通过传参的方式来添加的话，
会让视图函数变得非常复杂，Flask 使用上下文临时将对象变成了全局可访问。

```python
from flask import request

@app.route('/')
def index():
    user_agent = request.headers.get('User-Agent')
    return '<p>Your browser is {ua}</p>'.format(user_agent)
```

注意，在这里我们将`request`作为全局变量使用，而事实上，`request`不可能是全局变量，
因为同时可能会有多个线程处理不同客户端发送的不同请求，每个线程看到的`request`对象必然是不同的。
Flask 使用上下文将特定的变量在一个线程中全局可以访问，同时不会干扰到其他线程。

Flask 有两种上下文：程序上下文和请求上下文。

- `current_app`，当前激活的程序实例。
- `g`，处理请求时用于临时存储的对象。
- `request`，请求对象，封装了 HTTP 请求内容。
- `session`，用户会话，用于存储请求之间需要记住的值的字典。

Flask 会在分发请求之前`push`程序和请求上下文，请求处理完成之后将其删除。
程序`push`之后，线程中的`current_app`和`g`就可以使用了。
如果我们没有激活这些上下文，那么就会产出异常。

##### 请求调度

Flask 会在程序的 URL 映射中查找请求的 URL。URL 映射是 URL 和视图函数之间的对应关系。
Flask 使用`app.route`或者`app.add_url_rule()`生成映射。

Flask 会自动添加一个`/static/<filename>`的路由来处理静态文件；
使用`app.route`添加的路由会有`HEAD`，`OPTIONS`，`GET`三个方法。

##### 请求钩子

有时候，我们会需要在处理请求之前或者之后执行一些代码，比如创建数据库连接、用户认证等等。
为了统一化管理，Flask 可以注册通用函数，这些函数可以在请求被分发之前或者之后调用。

Flask 支持四种钩子，使用装饰器注册：

- `before_first_request`，处理第一个请求之前运行。
- `before_request`，每次请求之前运行。
- `after_request`，在每次请求之后运行，遇到异常抛出。
- `teardown_request`，在每次请求之后运行，遇到异常同样执行。

在请求钩子和视图之间共享数据一般使用`g`。

##### 响应

Flask 调用视图函数后，会将返回值作为`Response`的`content`。

如果想要修改返回值，就需要设置第二个返回值，Flask 会将其作为状态码。
响应还可以添加一个参数，会作为 Response Header 返回，但是一般情况下不需要这么做。

如果不想直接粗暴地返回一个元组，那么可以返回一个`Response`对象，调用`make_response`即可。

```python
from flask import make_response

@app.route('/')
def index():
    response = make_response('<h1>This document carries a cookie!</h1>')
    response.set_cookie('answer', '42')
    return response
```

有时候我们需要使用重定向将用户指引到正确的页面。
重定向通常以 302 状态码表示，指向的地址由 Response Header 的`Location`字段提供。
我们可以使用返回值元组或者`Response`对象来设定，不过 Flask 提供了`redirect()`来辅助生成响应。

```python
from flask import  redirect

@app.route('/')
def index():
    return redirect('http://www.example.com/')
```

还有一种特殊的响应，用于处理错误。这种响应使用`abort`函数生成。
需要注意的是，`abort`不会将控制权交还给调用它的函数，而是抛出异常，把控制权交给 Web 服务器。

```python
from flask import abort

@app.route('/user/<int:id>')
def index():
    user = get_user(id)
    if not user:
        abort(404)
    return '<p>Hello, {user}</p>'.format(user)
```

#### Flask 扩展

Flask 支持许多扩展，比如 Flask-Script。需要时直接 PyPi 安装即可。

```python
from flask.ext.script import Manager

manager = Manager(app)

if __name__ == '__main__':
    manager.run()
```

为 Flask 开发的扩展包都放在了`flask.ext`名空间下，可以直接导入。

使用了`script.Manager`的脚本就获得了命令行的解析能力，可以使用`runserver`来运行。


### 模板

通常来说，视图函数中既有业务逻辑也有表现逻辑，但是这会让代码难以维护。
因而，Flask 提供了模板功能，让表现逻辑能够尽量与业务逻辑区分开，提升程序的可维护性。

Flask 使用 Jinja2 模板引擎。

#### Jinja2

首先我们准备了两个模板。

```html
# templates/index.html
<h1>Hello World!</h1>

# templates/user.html
<h1>Hello, {{ name }}</h1>
```

我们只需要改变一下视图函数就可以渲染这些模板。

```python
from flask import Flask, render_template

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/user/<name>')
def user(name):
    return render_template('user.html', name=name)
```

Flask 提供的`render_template`将 Jinja2 模板集成到了程序中。
`render_template`第一个参数是文件名，随后的是键值对，表示模板中变量对应的真实值。

Jinja2 能识别出所有类型的变量，甚至是一些复杂的类型，比如字典、列表和对象。
而且 Jinja2 支持过滤器，可以使用过滤器来处理变量的值。其内置了一些常用的过滤器。

```jinja2
<p>{{ myobj['key'] }}</p>
<p>{{ myobj[3] }}</p>
<p>{{ myobj[mykey] }}</p>
<p>{{ myobj.method() }}</p>
<p>{{ myobj|capitalize }}</p>
```

Jinja2 也有控制结构，包括条件、循环、宏、导入以及模板继承。

```jinja2
{# 控制 #}
{% if user %}
    Hello, {{ user }}
{% else %}
    Hello, Stranger!
{% endif %}

{# 循环 #}
<ul>
    {% for comment in comments %}
        <li>{{ comment }}</li>
    {% endfor %}
</ul>

{# 宏：声明 #}
{% macro render_comment(comment) %}
    <li>{{ comment }}</li>
{% endmacro %}

{# 宏：使用 #}
<ul>
    {% for comment in comments %}
        {{ render_comment(comment) }}
    {% endfor %}
</ul>

{# 导入 #}
{% include 'test.html' %}

```

```jinja2
{# 模板 #}
<!DOCTYPE html>
<html>
<head>
    {% block head %}
        <title>{% block title %}{% endblock %}</title>
    {% endblock %}
</head>
<body>
    {% block body %}
    {% endblock %}
</body>
</html>

{# 继承 #}
{% extends "index.html" %}
{% block title %}Index{% endblock %}
{% block head %}
    {{ super() }}
{% endblock %}
{% block body %}
    <h1>Hello, World!</h1>
{% endblock %}
```

#### 自定义错误界面

我们可以自定义一个有趣的 404 或者 500 错误页面。

```python
@app.errorhandler(404)
def page_not_found(e):
    return reder_template('404.html'), 404
```

#### 生成链接

很多时候我们需要链接不同的页面，但是存在可变路由的情况下，问题会变得复杂起来。
直接编写 URL 会对代码中定义的路由产生不必要的依赖关系。
Flask 提供了`url_for`函数，通过视图函数来获取 URL。

```python
url_for('index') # /
url_for('index', _external=True) # http://localhost:5000/
url_for('user', name='wzh') # /user/wzh
url_for('index', page=2) # /?page=2
```

#### 静态文件

很多时候，我们会使用静态文件，例如 HTML，图片，Javascript 和 CSS。

默认时候，Flask 会在程序根目录中创建名为 static 的子目录，在其中获取静态文件。
这时候就可以用到 Flask 默认申请的路由`/static/<filename>`。
使用`url_for('static', filename='img/my.png')`时会得到`/static/img/my.png`。
这样就能够很轻松地得到静态文件目录。

### 表单

#### CSRF

使用 Flask_WTF 可以保护表单免受 CSRF 攻击。为了实现 CSRF 保护，需要添加一个程序密钥，WTF 使用密钥来生成加密令牌。

```python
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your secret id'
```

`app.config`字典用于存储框架、扩展和程序本身的变量配置。你可以动态增添变量，也可以从文件或环境读入配置。

SECRET_KEY 是通用密钥，可以在 Flask 和多个第三方扩展中使用。加密的强东取决于变量值的机密程度。建议在不同的程序上使用不同的密钥。并且，密钥尽量不要直接写入代码。

#### 表单类

使用 Flask-WTF 时，每个表单都继承自 FlaskForm，这个类定义表单中的一组字段，每个字段都用一个实例表示。字段实例可以附属验证函数，用于检查输入值是否合法。

```python
from flask.ext.wtf import Form
from wtforms import StringField, SubmitField
from wtforms.validators import Required

class NameForm(FlaskForm):
    name = StringField('What is your name?', validators=[DataRequired()])
    submit = SubmitField('Submit')
```

`StringField`会被转化为`<input type="text">`，`SubmitField`被转化为`<input type="submit">`。`validators`中是所有的验证函数，`DataRequired`表示必填。

要将表单渲染为 HTML 只需要用 Flask-Buutstrap 即可。

```jinja2
{% import "bootstrap/wtf.html" as wtf %}
{{ wtf.quick_form(myform) }}
```

我们可以在视图函数中处理表单。

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    name = None
    form = NameForm()
    if form.validate_on_submit():
        name = form.name.data
        form.name.data = ''
    rend_body = {
        'form': form,
        'name': name,
        'current_time': datetime.utcnow()
    }
    return render_template('index.html', **rend_body)
```

首先我们为视图函数添加了`methods`参数，以便其可以接收到 POST 请求。视图函数会在每一次路由被请求时调用，`form.validate_on_submit`是用于判断是否接收到了合法输入。为了避免过长的函数参数，将关键字参数放在了一个字典里。

#### 重定向和用户会话

如果浏览器的最后一次页面请求是 POST 的话，当刷新页面时会出现确认再次提交表单的`alert`。这个提示看起来有些烦人而且不知所云，所以我们可以将 POST 的响应替换为重定向。

这个方法当然也有另一个问题。程序处理 POST 时，使用`form.name.data`获取用户输入，但是请求结束，数据就会丢失，所以重定向时需要保存输入的名字，这样重定向之后才能获得并且使用这个名字，从而构建真正的响应。

程序可以将数据存储在`session`中，在请求之间记住数据，`session`是一种私有存储，存在于每一个连接到服务器的客户端中，它是请求上下文中的变量，操作和字典相似。

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    form = NameForm()
    if form.validate_on_submit():
        session['name'] = form.name.data
        return redirect(url_for('index'))
    rend_body = {
        'form': form,
        'name': session.get('name'),
        'current_time': datetime.utcnow()
    }
    return render_template('index.html', **rend_body)
```

这里示范了`url_for`和`redirect`的使用，以及`session`的存取。这里使用`get()`是为了避免当键值不存在时抛出异常，`get()`会自动返回`None`。

#### Flash 消息

有时，用户需要知道请求之后的状态发生了哪些变化。这里可以使用确认消息、警告或者错误提醒。比如，用户提交了错误的账户名或者密码，服务器发回响应，重新渲染登陆表单，并且提示一个信息。

Flask 提供了 Flash 特性，用于向模板提交提示信息。

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    form = NameForm()
    if form.validate_on_submit():
        old_name = session.get('name')
        if old_name and old_name != form.name.data:
            flash('Looks like you have changed your name!')
        session['name'] = form.name.data
        return redirect(url_for('index'))
    rend_body = {
        'form': form,
        'name': session.get('name'),
        'current_time': datetime.utcnow()
    }
    return render_template('index.html', **rend_body)
```

仅仅调用`flash()`不能把信息显示出来，还需要使用模板去渲染。

```html
{% for message in get_flashed_messages() %}
<div class="alert alert-warning">
    <button type="button" class="close"
            data-dismiss="alert">
        &times;
    </button>
    {{ message }}
</div>
{% endfor %}
```

之所以使用循环，是因为每次调用`flash()`都会向队列中添加一个消息，使用`get_flashed_messages`之后，消息就已经出队，不会再次被获取到。

### 数据库

#### Flask-SQLAlchemy

Flask-SQLAlchemy 是一个针对 Flask 项目简化过的 SQLAlchemy 库。要配置一个数据库只要简单的几步就可以了。将数据库 URL 和一些配置放入`app.config`，然后创建数据库实例。

```python
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = \
    r'postgresql://postgres:123456@localhost:5432/wzh'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_ECHO'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
```

具体参数的含义可以查询[中文文档](http://www.pythondoc.com/flask-sqlalchemy/config.html)。

#### 定义模型

在 ORM 中，模型一般是个 Python 类，类中属性对应数据表中的列。SQLAlchemy 创建的数据库梳理为模型提供了一个基类以及一系列辅助类和辅助函数，可以用于定义模型的结构。

```python
class Student(db.Model):
    __tablename__ = 'xsb'
    xh = db.Column(db.String(15), primary_key=True)
    xm = db.Column(db.String(5), nullable=False)
    xb = db.Column(db.String(1), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    bjdm = db.Column(db.String(20), db.ForeignKey('bjb.bjdm'))

    def __repr__(self):
        return '<Student %r>' % self.xm
```

类变量`__tablename__`定义在数据库中使用的表名。如果没有定义，那么 SQLAlchemy 会使用一个默认的名字，但是默认的表名没有遵守使用复数形式进行命名的约定，所以最好由自己来指定表名。其余变量都是模型的属性，作为`db.Column`的实例。`db.Column`的第一个参数为类型，关键字参数可以用于指定主键、默认值、非空、索引和是否可以重复。

> Flask-SQLAlchemy 要求每一个模型都需要定义主键。

这里用了`__repr__`来使模型的实例拥有可读的字符串表示

#### 关系

数据库中有关系，使用关系来把不同的表中的行联系起来。比如一对多的关系，可以直接用`ForeignKey`和`relationship`来表示。

```python
class Student(db.Model):
    # ...
    bjdm = db.Column(db.String(20), db.ForeignKey('bjb.bjdm'))


class Class(db.Model):
    # ...
    xss = db.relationship('Student', backref='bj')  # 学生关联
```

外键就是数据库中的外键，`relationship`表示根据外键联系生成一个对应的列表。当两个表之间的外键联系不止一个时，可以需要使用额外的参数`primaryjoin`。`lazy`参数用于指定何时生成相关的记录，避免一段时间内发生过多的数据库操作。

一对一关系可以用一对多关系表示，只需要在`relationship`中将`uselist`设置为`False`。


#### 数据库操作

我们可以用`shell`进行数据库操作的测试。

- 建表和删表

我们可以直接使用我们定义好的模型来建表。

```python
from flask_test import db
db.create_all()
db.drop_all()
```

- 插入行

```python
wzh = {
    'xh': '1000000000',
    'xm': '王子恒',
    'xb': '男',
    'age': 21,
    'bjdm': 'se02'
}
Student(**wzh)
db.session.add(wzh)
```

如果你想要插入多行，可以传入一个列表。

```python
db.session.add_all([wzh, wl, wrj])
```

不要忘记修改了数据库的操作需要提交，上面我们设置了当关闭连接时自动提交操作。

```python
db.session.commit()
```

- 查询行

```python
from flask_test import Class
Class.query.all()
se02 = Class.query.filter_by(bjdm='se02').all()
```

如果要看查询所执行的 SQL 语句，那么我们只需要转化成字符串就可以了。

```python
str(Class.query.all())
```

当数据表直接有关联时，我们可以使用关系来查看数据。

```python
stus = se02.xss
```

这里有个小问题，我们直接调用了`se02`的`xss`属性，然后查询就自动完成了，这意味着我们无法执行更加精细的查询，比如说排序。通过指定查询执行的时间，可以解决这个问题。

```python
class Class(db.Model):
    xss = db.relationship('Student', backref='bj', lazy='dynamic')
```

这样配置关系，我们就可以获得一个尚未执行的查询，然后在其上添加过滤器。

#### 在视图函数中操作数据库

```python
@app.route('/', methods=['GET', 'POST'])
def index():
    form = NameForm()
    if form.validate_on_submit():
        stu = Student.query.filter_by(xm=form.name.data).first()
        if stu is None:
            flash('I do not have your information...')
            session['known'] = False
        else:
            session['known'] = True
        session['name'] = form.name.data
        form.name.data = ''
        return redirect(url_for('index'))
    rend_body = {
        'form': form,
        'name': session.get('name'),
        'known': session.get('known', False),
        'current_time': datetime.utcnow()
    }
    return render_template('index.html', **rend_body)
```

添加了一个数据库查询。

#### 集成 Python Shell

每次进入 Python Shell 操作数据库都需要很麻烦地导入一些变量，我们可以做一些配置，让 Flask-Script 自动导入这些变量，比如添加上下文。

```python
def make_shell_context():
    """Make Context for flask_script"""
    return dict(app=app, db=db, Student=Student, Class=Class)

manager.add_command("shell", Shell(make_context=make_shell_context()))
```

#### 使用 Flask-Migrate 实现数据库迁移

我们会需要修改数据库模型，并且更新数据库，但是不想丢失之前的数据。先`drop_all`然后`create_all`显然不是个好办法，好的点子是使用数据库迁移框架。这些框架能跟踪数据库模式的变化，然后以增量的形式把变化应用到数据库当中。

SQLAlchemy 的开发人员编写了一个迁移框架，称为`Alembic`。除了使用它之外，我们还可使用`Flask-Migrate`扩展，这个扩展是对`Alembic`的轻量级包装，并且集成到了`Flask-Script`中。

##### 创建迁移仓库

首先要安装`Flask-Migrate`。

给`manager`配置新的数据库操作命令。

```python
from flask_migrate import Migrate, MigrateCommand

migrate = Migrate(app, db)
manager.add_command('db', MigrateCommand)
```

为了导出数据库迁移命令，`Flask-Migrate`提供了一个`MigrateCommand`类，可以附加到`Flask-Script`的`manager`对象上，然后在命令行中运行。

```shell
$ python flask_test.py db init
```

然后就会发现，项目目录中创建了`migrations`文件夹，所有的迁移脚本都要放在里面。

##### 创建迁移脚本

在 Alembic 中，数据库迁移使用迁移脚本来完成，其中有两个函数，分别是`upgrade()`和`downgrade()`。`upgrade()`函数将迁移中的改动应用到数据库，`downgrade()`将改动删除。通过这两个函数，数据库可以重设到改动历史的任意一点。

我们可以使用`revision`手动创建迁移，也可以使用`migrate`自动创建。手动创建的话，两个函数都是空的，需要使用 Alembic 提供的`Operations`对象指令实现具体操作。

```shell
$ python flask_test.py db migrate -m "initial migration"
```

##### 更新数据库

```shell
$ python flask_test.py db upgrade 
```

这样我们就将迁移应用了。

### 电子邮件

我们可以使用 Flask-Mail 提供电子邮件支持。

#### Flask-Mail

这个库会连接到 SMTP 服务器，并且将邮件交给这个服务器发送。如果不进行配置，Flask-Mail 会连接到`localhost:25`，无需验证就可以发送电子邮件。可以通过添加配置来设置使用 TLS、SSL，以及邮箱账户。

```python
app.config['MAIL_SERVER'] = 'smtp.qq.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = '254886715@qq.com'
app.config['MAIL_PASSWORD'] = 'lwvkryvxsnghbjfb'
app.config['FLASKY_MAIL_SUBJECT_PREFIX'] = '[FROM Flasky]'
app.config['FLASKY_MAIL_SENDER'] = 'Amber<254886715@qq.com>'
```

在实际的业务中，是不可以在代码逻辑中添加用户名和密码的，需要从环境或者本地读取。可以将用户信息放到环境变量当中，用`os.environ.get('MAIL_USERNAME')`获取。

配置完成之后，就可以发送邮件了。邮件可以以 HTML 文档的形式发送，也可以以纯文本的形式发送。我们将需要参数封装到一个函数当中。

```python
app.config['FLASKY_MAIL_SUBJECT_PREFIX'] = '[FROM Flasky]'
app.config['FLASKY_MAIL_SENDER'] = 'Amber<254886715@qq.com>'

def send_email(to, subject, template, **kwargs):
    """
    :param to: 收件人
    :param subject: 邮件标题
    :param template: 邮件所使用的 HTML 模板
    :param kwargs: 在渲染模板需要的关键字
    :return: None
    """
    msg = Message(app.config['FLASKY_MAIL_SUBJECT_PREFIX'] + subject,
                  sender=app.config['FLASKY_MAIL_SENDER'], recipients=[to])
    msg.body = render_template(template + '.txt', **kwargs)
    msg.html = render_template(template + '.html', **kwargs)
    mail.send(msg)
```

### 大型应用的结构

编写较大的 Flask Web App 时，需要进行项目结构的调整。

#### 项目结构

```
|-flask_test/
    |-app/
        |-templats/
        |-static/
        |-main/
            |-__init__.py
            |-errors.py
            |forms.py
            |views.py
        |-__init__.py
        |-email.py
        |-models.py
    |-migrations/
    |-tests/
        |-__init__.py
        |-test*.py
    |-venv/
    |-requirements.txt
    |-config.py
    |-manage.py
```

程序主体放置在`app/`中，`venv/`放置虚拟环境，`tests/`放置单元测试。

#### 配置选项

程序有时候会需要设定多个配置，比如：开发、测试、生产环境会需要使用不同的数据库，避免彼此影响。

我们使用新的层次结构的配置类来完成。

```python
import os

baskdir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or '123456'
    FLASKY_MAIL_SUBJECT_PREFIX = '[FROM Flasky]'
    FLASKY_MAIL_SENDER = 'Amber<254886715@qq.com>'
    
    @staticmethod
    def init_app(app):
        pass
    

class DevelopmentConfig(Config):
    DEBUG = True
    MAIL_SERVER = 'smtp.qq.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = '254886715@qq.com'
    MAIL_PASSWORD = 'lwvkryvxsnghbjfb'
    SQLALCHEMY_DATABASE_URI = \
    r'postgresql://postgres:123456@localhost:5432/wzh'


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = \
        r'postgresql://postgres:123456@localhost:5432/wzh'


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
```

不难看出，这样设定的配置更加安全。所有配置信息以类定义存在，并且，根据不同的需要可以选择不同的环境配置。

#### 程序包

##### 程序工厂函数

在单个文件中开发程序很方便，但是由于程序是在全局作用域中创建的，所以无法动态修改程序的配置。运行时，程序实例已经创建完成，再去修改配置为时已晚。然而这一点对于单元测试来说尤为重要。

解决这个问题的方法是延迟创建程序实例，把创建过程移到可以显示调用的工厂函数之中。这种方法不但可以给脚本流出配置程序的时间，还可以创建多个程序实例。这些实例有时候在测试中非常有用。

```python
# app/__init__.py
from flask import Flask, render_template
from flask_bootstrap import Bootstrap
from flask_moment import Moment
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from config import config

bootstrap = Bootstrap()
moment = Moment()
db = SQLAlchemy()
mail = Mail()


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    bootstrap.init_app(app)
    mail.init_app(app)
    moment.init_app(app)
    db.init_app(app)
    
    return app
```

`__init__.py`文件中的逻辑会在本模块被导入时运行。

这里，我们建立了几个程序本体需要用到的插件的实例，在`create_app`中将其初始化。这就是我们的工厂函数。使用`app.config.from_object()`可以从一个实例中使用`get_attr`获取配置信息。 

##### 使用蓝本

由于我们使用了工厂函数，所以路由变得复杂。在单文件程序中，程序实例存在于全局，路由可以直接用`app.route`定义。程序实例在运行时创建后，我们需要用`create_app`之后才能使用`app.route`，这时候定义路由就有些晚了。

使用蓝本可以将路由体系封装起来，在创建实例时将蓝本绑定到实例。蓝本在但文件中定义，直到蓝本注册到程序上之后，路由才会真正成为程序的一部分。

```python
from flask import Blueprint

main = Blueprint('main', __name__)

from . import views, errors
```

通过实例化一个`Blueprint`类可以创建蓝本。这个构造函数有两个必须指定的参数：蓝本的名字和蓝本所在的包或者模块。

路由保存在`app/main/views.py`中，错误处理保存在`app/main/errors.py`中，导入这两个模块就可以将这些与蓝本关联起来。注意，这些模块在蓝本实例之后导入，这是为了避免循环导入一来，因为在`views.py`和`errors.py`中还要导入蓝本`main`。

在`create_app`中，将蓝本注册到程序实例上。

```python
# app/__init__.py
def create_app(config_name):
    # ...
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
```

```python
# app/main/views.py
from flask import render_template
from . import main


@main.app_errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@main.app_errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500
```

```python
# app/main/views.py
from flask import render_template, session, redirect, url_for, flash
from datetime import datetime

from . import main
from .forms import NameForm
from .. import db
from ..models import Student

@main.route('/', methods=['GET', 'POST'])
def index():
    form = NameForm()
    if form.validate_on_submit():
        # ...
        return redirect(url_for('.index'))
    rend_body = {
        'form': form,
        'name': session.get('name'),
        'known': session.get('known', False),
        'current_time': datetime.utcnow()
    }
    return render_template('index.html', **rend_body)
```

注意这里`views.py`中的导入信息。

这个视图函数主要有两点不同，第一，路由由脚本提供；第二，`url_for`所使用的目标不同。这里，`index`实际注册的其实是`main.index`。在本蓝本中，可以省略蓝本名。

这里需要将数据库模型转移到`app/models.py`中，以及将电子邮件相关的逻辑转移到`app/email.py`中。

这里我出现了一些小问题：在`email.py`中，会需要获取`app.config`，但是由于动态创建的原因，无法获取到`app`变量，并且`app`模块不应该在`__init__.py`以外的地方去向外界读取信息，否则会破坏模块之间的耦合。

至此，我们就布局好了整个应用的结构，只需要再布置一个`manage.py`即可。

```python
#!/usr/bin/env python3
# coding:utf-8

import os
from app import create_app, db
from app.models import Student, Class, Major
from flask_script import Manager, Shell
from flask_migrate import MigrateCommand, Migrate

app = create_app(os.getenv('FLASK_CONFIG') or 'default')
manager = Manager(app)
migrate = Migrate(app, db)


def make_shell_context():
    return dict(app=app, db=db, Class=Class, Student=Student, Major=Major)


manager.add_command("shell", Shell(make_context=make_shell_context))
manager.add_command("db", MigrateCommand)


@manager.command
def test():
    """Run the unit tests."""
    import unittest
    tests = unittest.TestLoader().discover('tests')
    unittest.TextTestRunner(verbosity=2).run(tests)


if __name__ == '__main__':
    manager.run()
```

这个`manage.py`与之前大同小异，唯一的区别是使用装饰器增加了一个`test`命令。

至此，一个简单的 Web App 所需要的所有功能全部完成了。