import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import userRoutes from './routes/userRoutes'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*', // You might want to restrict this in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 3600,
  credentials: true
}))

// Routes
app.route('/users', userRoutes)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// Error handling
app.onError((err, c) => {
  console.error(`${err}`)
  return c.json({
    error: {
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  }, 500)
})

// 404 handler
app.notFound((c) => {
  return c.json({
    status: 404,
    message: 'Not Found'
  }, 404)
})

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch
}