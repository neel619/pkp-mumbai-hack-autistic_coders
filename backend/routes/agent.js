// backend/routes/agent.js
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const Fuse = require("fuse.js");

const router = express.Router();
const DATA_PATH = path.join(__dirname, "..", "data", "content.json");

const GREETINGS = ["hi","hello","hey","namaste","good morning","good evening","yo"];

function isGreeting(q){
  if(!q) return false;
  const cleaned = q.toLowerCase().replace(/[^a-z0-9\s]/gi,"").trim();
  if(!cleaned) return false;
  return GREETINGS.includes(cleaned) || (cleaned.length<=3 && GREETINGS.includes(cleaned));
}

async function readData(){ return JSON.parse(await fs.readFile(DATA_PATH,"utf8")); }

function generateTemplate(card, userQuestion){
  if(card.category === "Labour"){
    return `**Formal Salary Complaint Letter**

To,
HR Dept
Subject: Pending Salary Request

Issue: ${userQuestion}

I request the release of my pending salary. Kindly resolve promptly.

Regards,
[Your Name]`;
  }
  if(card.category === "Police"){
    return `**FIR Template**

To,
Station House Officer

Details:
${userQuestion}

Please register my FIR.`;
  }
  return `Issue: ${userQuestion}\nRelated Law: ${card.title}\n\n${card.summary}`;
}

function generateAnswer(card, userQuestion){
  return `
### Issue Detected
"${userQuestion}"

### Relevant Law
${card.category} → ${card.title} (Source ID: ${card.id})

Summary:
${card.summary}

Recommended Actions:
${card.steps.map((s,i)=>`${i+1}. ${s}`).join("\n")}

Template:
${generateTemplate(card, userQuestion)}
`;
}

router.post("/", async (req, res) => {
  try {
    const q = (req.body.q || "").toString().trim();
    if(!q) return res.status(400).json({ ok:false, msg:"Query required" });

    if(isGreeting(q)){
      return res.json({ ok:true, answer: "Hi — I'm CivicGuard AI. Ask: 'How to file FIR' or 'My salary not paid'." , card:null });
    }

    const alphaNum = q.replace(/[^a-z0-9\s]/gi,"").trim();
    if(!alphaNum || alphaNum.length < 3){
      return res.json({ ok:true, answer: "I didn't understand that. Try: 'file FIR' or 'employer not paid salary'" , card:null });
    }

    const data = await readData();
    const list = data.cards || [];

    const fuse = new Fuse(list, { keys:['title','summary','category','steps'], threshold:0.45, includeScore:true, ignoreLocation:true });
    const hits = fuse.search(q);
    if(!hits || hits.length === 0) return res.json({ ok:true, answer: "No matching legal info found in KB.", card:null });

    const best = hits[0];
    const bestScore = best.score || 1.0;
    const CONF_THRESHOLD = 0.45;
    if(bestScore > CONF_THRESHOLD){
      return res.json({ ok:true, answer: "I found possible matches but not confident. Please provide more details.", results: hits.slice(0,4).map(h=>({ id:h.item.id, title:h.item.title, score:h.score })), card:null });
    }

    const card = best.item;
    const answer = generateAnswer(card, q);

    res.json({ ok:true, answer, card });
  } catch (err) {
    console.error('agent error', err);
    res.status(500).json({ ok:false, msg:'Server error' });
  }
});

module.exports = router;
