# Docker (podman)

Pull the image (optional build locally if you don't trust dockerhub)

`docker pull hiahatf/xmr-dev-guides`

If you want to build the Dockerfile is located in `/scripts` directory

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
