/**
 * PM2 process file. Loaded with `pm2 start deploy/ecosystem.config.cjs`.
 * Runs Next.js in production on port 3000; Nginx reverse-proxies 80/443 → 3000.
 */
module.exports = {
  apps: [
    {
      name: "btl",
      cwd: "/var/www/btl",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
      },
      out_file: "/var/log/btl/out.log",
      error_file: "/var/log/btl/err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
