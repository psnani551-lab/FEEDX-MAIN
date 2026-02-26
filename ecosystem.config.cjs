module.exports = {
    apps: [
        {
            name: 'feedx-production-server',
            script: 'server/index-json.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'logs/production_error.log',
            out_file: 'logs/production_out.log',
        }
    ],
};
