const { defineConfig } = require('@bull-board/api')
const { BullAdapter } = require('@bull-board/api/bullAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const express = require('express')
const Bull = require('bull')

const app = express()
const server = new ExpressAdapter()
server.setApp(app)

// Create queues (replace with actual queue names)
const orderQueue = new Bull('orders', process.env.REDIS_URL || 'redis://localhost:6379')
const emailQueue = new Bull('emails', process.env.REDIS_URL || 'redis://localhost:6379')

// Register queues with Bull Board
server.setQueues([
  new BullAdapter(orderQueue),
  new BullAdapter(emailQueue),
])

app.listen(3001, () => {
  console.log('Bull Board running at http://localhost:3001')
})
