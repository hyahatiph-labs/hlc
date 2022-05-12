# This is the image for xmr-dev-guides environment
# Uses fedora:latest image and node.js 16.x.x+, podman version 3.4.4
# Command to build:
# > podman build --network host -t xmr-dev-guides:latest .
# Command to run:
# > podman run --rm -P -p 127.0.0.1:8888:8888 --name xmr-dev-guides \
# > xmr-dev-guides:latest /bin/bash xmr-dev-guides.sh

FROM fedora
LABEL name = support@hiahatf.org
# Update fedora
RUN dnf -y update
# Install necessary packages
RUN dnf install -y wget curl git gnupg nodejs.x86_64 bzip2 \
    python3-notebook mathjax sscg python3-seaborn python3-lxml \ 
    python3-basemap python3-scikit-image python3-scikit-learn \ 
    python3-sympy python3-dask+dataframe python3-nltk
# Let's not use root
RUN adduser dev
# Clone xmr-dev-guides source code
RUN cd /home/dev && git clone https://github.com/hyahatiph-labs/hlc.git \
    && cd hlc/xmr-dev-guides && npm i
# Install tslab
RUN npm i -g tslab
RUN tslab install --version
RUN tslab install --python=python3
# Install monero python
RUN pip install monero
COPY xmr-dev-guides.sh .
COPY instructions.txt .
# Jupyter initial config
RUN mkdir /home/dev/.jupyter
RUN cd /home/dev/.jupyter; sscg
COPY jupyter_notebook_config.json .
RUN mv jupyter_notebook_config.json /home/dev/.jupyter
RUN chown -R dev /home/dev/.jupyter
RUN chown -R dev /home/dev/hlc
