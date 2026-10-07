// pm2 start deploy/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'kanbrik',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname + '/..',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '700M',
    },
  ],
}
