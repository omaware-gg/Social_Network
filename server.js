const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');

const prisma = new PrismaClient();
const app = express();

app.use(bodyParser.json());

app.post('/parent', async (req, res) => {
  const { name, email, schoolId, sectionId } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  try {
    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        schoolId,
        sectionId,
      },
    });
    res.json(parent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/post', async (req, res) => {
  const { title, content, parentId, sectionId } = req.body;
  if (!title || !content || !parentId || !sectionId) {
    return res.status(400).json({ error: "Title, content, parentId, and sectionId are required" });
  }
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        parent: { connect: { id: parentId } },
        section: { connect: { id: sectionId } },
      },
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/comment', async (req, res) => {
  const { content, parentId, postId } = req.body;
  if (!content || !parentId || !postId) {
    return res.status(400).json({ error: "Content, parentId, and postId are required" });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        parent: { connect: { id: parentId } },
        post: { connect: { id: postId } },
      },
    });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/vote', async (req, res) => {
  const { value, parentId, postId, commentId } = req.body;
  if (!value || !parentId || (!postId && !commentId)) {
    return res.status(400).json({ error: "Value, parentId, and either postId or commentId are required" });
  }
  try {
    const vote = await prisma.vote.create({
      data: {
        value,
        parent: { connect: { id: parentId } },
        post: postId ? { connect: { id: postId } } : undefined,
        comment: commentId ? { connect: { id: commentId } } : undefined,
      },
    });
    res.json(vote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/posts/:sectionId', async (req, res) => {
  const { sectionId } = req.params;
  const sectionIdInt = parseInt(sectionId);
  if (isNaN(sectionIdInt)) {
    return res.status(400).json({ error: "Invalid sectionId" });
  }
  try {
    const posts = await prisma.post.findMany({
      where: { sectionId: sectionIdInt },
      include: { comments: true, votes: true },
    });
    res.json(posts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/comments/:postId', async (req, res) => {
  const { postId } = req.params;
  const postIdInt = parseInt(postId);
  if (isNaN(postIdInt)) {
    return res.status(400).json({ error: "Invalid postId" });
  }
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: postIdInt },
      include: { votes: true },
    });
    res.json(comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
