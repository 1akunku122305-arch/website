/** PM2 process definition for bare-metal deployments. */
module.exports = {
  apps: [
    {
      name: "wangstore",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        WANGSTORE_DATA_DIR: `${__dirname}/data`,
      },
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
