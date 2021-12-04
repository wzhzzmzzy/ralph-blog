---
layout: post
title: SQL 练习题（LeetCode）
author: wzhzzmzzy
date: 2018-3-7
categories: Tech
tags: 
    - SQL
description: 学习了 SQL 语法之后去 LeetCode 找了一些练习题。
---

## SQL 练习 - LeetCode

### 626. Exchange Seats

> [626. Exchange Seats](https://leetcode.com/problems/exchange-seats/description/)

#### 自解

```sql
SELECT a.id, b.student
FROM seat AS a, seat AS b
WHERE (a.id % 2 = 1 AND b.id - 1 = a.id)
OR (a.id % 2 = 0 AND b.id + 1 = a.id)
UNION
SELECT id, student
FROM seat
WHERE id = (SELECT MAX(id) FROM seat)
AND id % 2 = 1
ORDER BY id;
```

#### 更优解

```sql
SELECT (
    CASE
        WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM seat) then id
        WHEN id % 2 = 1 THEN id + 1
        ELSE id - 1
    END
) AS id, student
from seat
ORDER BY id;
```

### 175. Combine Two Tables

> [175. Combine Two Tables](https://leetcode.com/problems/combine-two-tables/description/)

#### 解法

外联结（左连接）。

```sql
SELECT FirstName, LastName, City, State
FROM Person LEFT JOIN Address
ON Person.PersonId = Address.PersonId;
```

### 197. Rising Temperature

> [197. Rising Temperature](https://leetcode.com/problems/rising-temperature/description/)

#### 解法

有个小坑点，日期直接求差值需要用`DATEDIFF()`，

```sql
SELECT a.Id
FROM Weather As a, Weather AS b
WHERE DATEDIFF(a.date, b.date) = 1
AND a.Temperature > b.Temperature;
```

### 596. Classes More Than 5 Students

> [596. Classes More Than 5 Students](https://leetcode.com/problems/classes-more-than-5-students/description/)


#### 解法

`DISTINCT`可以用在`COUNT`里。

```sql
SELECT class
FROM courses
GROUP BY class
HAVING COUNT(DISTINCT student) >= 5;
```

### 196. Delete Duplicate Emails

> [196. Delete Duplicate Emails](https://leetcode.com/problems/delete-duplicate-emails/description/)


#### 解法

自联结。

```sql
DELETE a
FROM Person AS a, Person AS b
WHERE a.Email = b.Email
AND a.Id > b.Id;
```

### 176. Second Highest Salary

> [176. Second Highest Salary](https://leetcode.com/problems/second-highest-salary/description/)

#### 自解

```sql
SELECT MAX(Salary) AS SecondHighestSalary
FROM Employee
WHERE Salary NOT IN (
    SELECT MAX(Salary)
    FROM Employee
);
```

#### 更优解

利用`LIMIT`和`ORDER BY`。（这种解法会 WA，因为在只有一个字段的表中会返回空，但要求返回 NULL）

```sql
SELECT Salary AS SecondHighestSalary
FROM Employee
ORDER BY Salary DESC
LIMIT 1 OFFSET 1;
```

### 178. Rank Scores

> [178. Rank Scores](https://leetcode.com/problems/rank-scores/description/)

#### 解法

SELECT 语句也可以闭包。

```sql
SELECT Score, 
(
    SELECT COUNT(DISTINCT Score)+1
    FROM Scores
    WHERE Score > a.Score
) AS Rank
FROM Scores AS a
ORDER BY Score DESC;
```

