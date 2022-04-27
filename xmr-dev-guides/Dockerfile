# This is the image for xmr-dev-guides environment
# Uses fedora:latest image and node.js 16.x.x+, podman version 3.4.4
# Command to build:
# > podman build --network host -t xmr-dev-guides:latest .
# Command to run:
# > podman run --rm -P -p 127.0.0.1:8888:8888 --name xmr-dev-guides \
# > xmr-dev-guides:latest
# podman exec xmr-dev-guides -it /bin/bash
# set up the notebook: https://fedoramagazine.org/jupyter-and-data-science-in-fedora/

FROM fedora
LABEL name = support@hiahatf.org
# Update fedora
RUN dnf -y update
# Install necessary packages
RUN dnf install -y wget curl git gnupg nodejs.x86_64 bzip2 \
    python3-notebook mathjax sscg python3-seaborn python3-lxml \ 
    python3-basemap python3-scikit-image python3-scikit-learn \ 
    python3-sympy python3-dask+dataframe python3-nltk
# Clone xmr-dev-guides source code
RUN git clone https://github.com/hyahatiph-labs/hlc.git && cd hlc/xmr-dev-guides && npm i
# Install tslab
RUN npm i -g tslab
RUN tslab install --version
RUN tslab install --python=python3
# Install monero python
RUN pip install monero
# Install monero
RUN mkdir xmr
RUN cd xmr && wget https://downloads.getmonero.org/cli/monero-linux-x64-v0.17.3.0.tar.bz2
RUN cd xmr && tar xvf monero-linux-x64*.tar.bz2
