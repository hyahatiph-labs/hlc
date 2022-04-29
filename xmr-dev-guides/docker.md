# Docker (podman)


```bash
podman build --network host -t xmr-dev-guides:latest .

podman run --rm -P -p 127.0.0.1:8888:8888 --name xmr-dev-guides xmr-dev-guides:latest /bin/bash xmr-dev-guides.sh
```

In another terminal

```bash
su dev

cd /home/dev

jupyter notebook password

jupyter notebook
```

go to: https://localhost:8888 on your machine
