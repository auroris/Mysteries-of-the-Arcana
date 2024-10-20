---
layout: paper.njk
title: 'Mysteries of the Arcana - Guest Art'
date: '2024-10-03'
author: 'J Gray'
permalink: '/art/guest/'
---

{% set art = collections.arcana | natsort %}

<div class="gallery">
<h1>Guest Art</h1>
<hr />
<ul class="gallery-images">
{% for item in art %}
    <li><a href="{{ item.filePathStem }}">{% Image "content/" + item.filePathStem, '' %}<span>{{ item.data.title }}</span></a></li>
{% endfor %}
</ul>
</div>