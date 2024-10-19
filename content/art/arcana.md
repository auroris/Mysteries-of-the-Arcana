---
layout: paper.njk
title: 'Mysteries of the Arcana - Arcana Art'
date: '2024-10-03'
author: 'J Gray'
permalink: '/art/arcana/'
---

{% set art = collections.arcana | natsort %}

<div class="gallery">
<h1>Arcana Art</h1>
Here you'll find original concept art for Mysteries of the Arcana as well as a few other items.
<hr />
<ul>
{% for item in art %}
    <li><a href="{{ item.filePathStem }}">{% Image "content/" + item.filePathStem, '' %}<span>{{ item.data.title }}</span></a></li>
{% endfor %}
</ul>
</div>