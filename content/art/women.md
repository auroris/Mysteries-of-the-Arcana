---
layout: paper.njk
title: 'Mysteries of the Arcana - Women of Gaming 2010'
date: '2024-10-03'
author: 'J Gray'
permalink: '/art/women/'
---

{% set art = collections.women | natsort %}

<div class="gallery">

<h1>Women of Gaming 2010</h1>

During the 2010 holiday break J did a countdown of the top ten women in video games for 2010. The only rules were:

1. The selection had to be from a video game.
2. The video game had to have been one J played in 2010.

<hr />

<ul class="gallery-images">
{% for item in art %}
    <li><a href="{{ item.filePathStem }}">{% Image "content/" + item.filePathStem, '' %}<span>{{ item.data.title }}</span></a></li>
{% endfor %}
</ul>
</div>