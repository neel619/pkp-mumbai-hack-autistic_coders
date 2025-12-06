// backend/routes/api.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { createFuseIndex } = require('../utils/search');

const router = express.Router();
const DATA_PATH = path.join(__dirname, '..', 'data', 'content.json');

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * GET /api/cards
 * optional query: ?category=Police
 */
router.get('/cards', async (req, res) => {
  try {
    const data = await readData();
    let cards = data.cards || [];
    if (req.query.category) {
      cards = cards.filter(
        (c) => c.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    res.json({ ok: true, count: cards.length, cards });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

/** GET /api/cards/:id */
router.get('/cards/:id', async (req, res) => {
  try {
    const data = await readData();
    const card = (data.cards || []).find((c) => c.id === req.params.id);
    if (!card) return res.status(404).json({ ok: false, msg: 'Card not found' });
    res.json({ ok: true, card });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

/** GET /api/flows/:id */
router.get('/flows/:id', async (req, res) => {
  try {
    const data = await readData();
    const flow = (data.flows || []).find((f) => f.id === req.params.id);
    if (!flow) return res.status(404).json({ ok: false, msg: 'Flow not found' });
    res.json({ ok: true, flow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

/**
 * GET /api/search?q=...&category=...
 * Returns fuse.js fuzzy search results on cards
 */
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const category = req.query.category;
    const data = await readData();
    let list = data.cards || [];

    if (category) {
      list = list.filter(
        (c) => c.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (!q) return res.json({ ok: true, results: list.map((i) => ({ item: i })) });

    const fuse = createFuseIndex(list);
    const results = fuse.search(q).map((r) => ({ score: r.score, item: r.item }));
    res.json({ ok: true, query: q, count: results.length, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

/**
 * POST /api/cards
 * Simple admin endpoint to add a card (no auth)
 * Body: card object (must include id & title)
 */
router.post('/cards', async (req, res) => {
  try {
    const newCard = req.body;
    if (!newCard || !newCard.id || !newCard.title) {
      return res.status(400).json({ ok: false, msg: 'id and title are required' });
    }
    const data = await readData();
    data.cards = data.cards || [];
    // simple duplicate id check
    if (data.cards.find((c) => c.id === newCard.id)) {
      return res.status(400).json({ ok: false, msg: 'card with this id already exists' });
    }
    data.cards.push(newCard);
    await writeData(data);
    res.json({ ok: true, card: newCard });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

module.exports = router;
