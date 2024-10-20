---
layout: paper.njk
title: 'Mysteries of the Arcana - Gift Art'
date: '2024-10-03'
author: 'J Gray'
permalink: '/art/gift/'
---

{% set art = collections.gift | natsort %}

<div class="gallery">
<h1>Gift Art</h1>
<hr />
<ul class="gallery-images">
{% for item in art %}
    <li><a href="{{ item.filePathStem }}">{% Image "content/" + item.filePathStem, '' %}<span>{{ item.data.title }}</span></a></li>
{% endfor %}
</ul>
</div>