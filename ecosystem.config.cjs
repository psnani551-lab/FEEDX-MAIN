module.exports = {
    apps: [
        {
            name: 'feedx-node-server',
            script: 'server/index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'logs/node_error.log',
            out_file: 'logs/node_out.log',
        },
        {
            name: 'feedx-python-api',
            script: 'python3',
            args: 'server/attendance_api.py',
            env: {
                PORT: 5001,
            },
            instances: 1,
            autorestart: true,
            watch: false,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'logs/python_error.log',
            out_file: 'logs/python_out.log',
        },
    ],
};
