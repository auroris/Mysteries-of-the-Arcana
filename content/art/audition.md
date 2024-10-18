---
layout: paper.njk
title: 'Mysteries of the Arcana - Audition Pages'
date: '2024-10-03'
author: 'J Gray'
permalink: '/art/audition/'
---

{% set art = collections.audition %}

<div class="gallery">
<h1>Audition Pages</h1>
<hr />
<ul>
{% for item in art %}
    <li><a href="{{ item.filePathStem }}">{% Image "content/" + item.filePathStem, '' %}<span>{{ item.data.title }}</span></a></li>
{% endfor %}
</ul>
</div>