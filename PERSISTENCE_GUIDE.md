# Server Persistence Guide (Long-Term Production)

While `run-background.sh` with `nohup` and `disown` provides basic persistence, for a production environment, you should use more robust process managers or terminal multiplexers.

## Recommended Tools

### 1. Screen (Easiest)
`screen` allows you to start a session that stays alive even if you close your terminal.

- **Start a new session:** `screen -S feedx`
- **Run your server:** `bash run-background.sh`
- **Detach from session:** Press `Ctrl+A` then `D`
- **List sessions:** `screen -ls`
- **Re-attach to session:** `screen -r feedx`

### 2. Tmux (Modern Alternative)
`tmux` is similar to `screen` but with more features.

- **Start a new session:** `tmux new -s feedx`
- **Detach from session:** Press `Ctrl+B` then `D`
- **List sessions:** `tmux ls`
- **Re-attach to session:** `tmux attach -t feedx`

### 3. PM2 (Production Grade)
`pm2` is a professional Node.js process manager that handles auto-restarts, monitoring, and log rotation.

- **Start Node server:** `pm2 start server/index-json.js --name "node-api"`
- **Start Python server:** `pm2 start "python3 server/attendance_api.py" --name "python-api"`
- **List processes:** `pm2 list`
- **Monitor processes:** `pm2 monit`
- **Restart on system reboot:** `pm2 startup` and `pm2 save`

> [!NOTE]
> `pm2` is not currently installed on this system. You can install it via `npm install -g pm2` if you have permission.

## Why was the server closing?

Previously, the servers were likely receiving a `SIGHUP` signal when your terminal session ended because they weren't fully detached. By using `disown` in the updated `run-background.sh`, we've told the shell to remove these processes from its job table, which helps them survive terminal closures.
